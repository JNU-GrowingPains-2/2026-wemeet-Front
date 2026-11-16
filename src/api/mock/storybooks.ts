import type { StorybooksApi } from "../storybooks";
import type { StoryReadiness, Storybook, StorybookStatus, StorybookSummary } from "../../types";
import { LESSON_TAGS, STORY_PERIOD_MAX_DAYS, THEME_TAGS, VOICES } from "../../constants/storybook";
import { buildStory, mockPageQuestions, pickStorySlug } from "../../mock/stories";
import { daysBetweenInclusive, todayString } from "../../utils/date";
import { loadDb, newId, nowIso, saveDb, type MockDb, type MockStorybook } from "./db";
import { clone, fail, requireChild, requireUser, simulateNetwork } from "./util";

// 요청 직후 queued → 약 5초 뒤 processing → 약 15초 뒤 completed(또는 failed).
const PROCESSING_AFTER_MS = 5_000;
const FINISHED_AFTER_MS = 15_000;
const FAIL_KEYWORD = "실패테스트";

function statusOf(book: MockStorybook): StorybookStatus {
  const elapsed = Date.now() - new Date(book.startedAt).getTime();
  if (elapsed < PROCESSING_AFTER_MS) return "queued";
  if (elapsed < FINISHED_AFTER_MS) return "processing";
  // 메시지에 실패 키워드가 있으면 첫 시도는 실패하고, 다시 만들기(retry)는 성공한다.
  return book.attempt === 1 && book.parentMessage.includes(FAIL_KEYWORD) ? "failed" : "completed";
}

function finishedAt(book: MockStorybook): string {
  return new Date(new Date(book.startedAt).getTime() + FINISHED_AFTER_MS).toISOString();
}

function contentOf(book: MockStorybook, db: MockDb) {
  const child = db.children.find((c) => c.id === book.childId);
  return buildStory(pickStorySlug(book.lessonTag, book.parentMessage), child?.name ?? "", child?.gender ?? null);
}

function toSummary(book: MockStorybook, db: MockDb): StorybookSummary {
  const status = statusOf(book);
  const content = status === "completed" ? contentOf(book, db) : null;
  return {
    id: book.id,
    childId: book.childId,
    title: content?.title ?? null,
    status,
    periodStart: book.periodStart,
    periodEnd: book.periodEnd,
    parentMessage: book.parentMessage,
    lessonTag: book.lessonTag,
    themeTag: book.themeTag ?? null,
    storyMode: book.storyMode ?? null,
    coverImageUrl: content?.coverImageUrl ?? null,
    createdAt: book.createdAt,
    completedAt: status === "completed" ? finishedAt(book) : null,
  };
}

function toStorybook(book: MockStorybook, db: MockDb): Storybook {
  const summary = toSummary(book, db);
  const content = summary.status === "completed" ? contentOf(book, db) : null;
  const child = db.children.find((c) => c.id === book.childId);
  const pageQuestions = mockPageQuestions(child?.name ?? "");
  const questions = content?.questions ?? [];
  return {
    ...summary,
    pages:
      content?.pages.map((page, i) => ({
        pageNo: i + 1,
        ...page,
        ...pageQuestions[i],
        childAnswer: book.pageAnswers?.[i + 1] ?? null,
        // 체험 버전은 음성 파일이 없어서 브라우저 목소리로 읽어 준다.
        audioUrl: null,
      })) ?? [],
    questions,
    letter: null,
    childAnswers: questions.map((_, i) => book.childAnswers?.[i] ?? ""),
    reaction: book.reaction ?? null,
    readCount: book.readCount ?? 0,
    narrationVoice: book.narrationVoice ?? null,
    errorMessage:
      summary.status === "failed"
        ? "동화를 만드는 중에 문제가 생겼어요. 다시 만들어 주세요."
        : null,
  };
}

function requireOwnedStorybook(id: string, db: MockDb): MockStorybook {
  const user = requireUser(db);
  const book = db.storybooks.find((b) => b.id === id);
  const owner = book && db.children.find((c) => c.id === book.childId);
  if (!book || owner?.userId !== user.id) {
    fail(404, "STORYBOOK_NOT_FOUND", "동화를 찾을 수 없어요.");
  }
  return book;
}

function requireCompleted(id: string, db: MockDb): MockStorybook {
  const book = requireOwnedStorybook(id, db);
  if (statusOf(book) !== "completed") {
    fail(409, "STORYBOOK_NOT_COMPLETED", "완성된 동화에서만 할 수 있어요.");
  }
  return book;
}

// 서버의 app/material.py 와 같은 규칙. AI를 부르지 않는다.
function readinessOf(texts: string[], hasMood: boolean, photoCount: number): StoryReadiness {
  const kept = texts.map((t) => t.trim()).filter(Boolean);
  const joined = kept.join("\n");
  if (kept.length === 0) {
    return { diaryCount: 0, textLength: 0, photoCount, level: "empty", hints: ["이 기간에는 글로 남긴 기록이 없어요. 한 줄이라도 적어 주세요."], questions: [] };
  }
  const hints: string[] = [];
  const questions: string[] = [];
  if (!/["“'][^"”']{2,}["”']|(라고|하고) (말|물|소리|대답)/.test(joined)) {
    hints.push("아이가 한 말을 그대로 적어 주면 동화 속 대사가 돼요.");
    questions.push("그때 아이가 뭐라고 말했나요? 한 말 그대로 적어 주세요.");
  }
  if (!hasMood && !/기뻐|신나|웃|속상|울었|화가|무서|떨려|뿌듯|아쉬|미안|부끄|자랑|놀랐|행복/.test(joined)) {
    hints.push("그때 아이의 기분이나 표정을 적어 주면 이야기에 마음이 담겨요.");
    questions.push("그 순간 아이 표정이나 기분은 어땠나요?");
  }
  if (joined.length < 40 || !/친구|엄마|아빠|할머니|할아버지|동생|언니|누나|오빠|형|선생님|이랑|랑 |와 |과 /.test(joined)) {
    hints.push("어디에서 누구와 무엇을 했는지 적어 주면 장면이 또렷해져요.");
    questions.push("어디에서 누구와 있었나요? 눈에 띄던 물건이 있었나요?");
  }
  const level = joined.length < 40 ? "thin" : joined.length >= 200 && hints.length <= 1 ? "rich" : "ok";
  return { diaryCount: kept.length, textLength: joined.length, photoCount, level, hints, questions: questions.slice(0, 2) };
}

export const mockStorybooksApi: StorybooksApi = {
  async createStorybook(childId, input) {
    await simulateNetwork();
    const db = loadDb();
    requireChild(childId, db);

    const parentMessage = input.parentMessage.trim();
    if (parentMessage.length < 10 || parentMessage.length > 300) {
      fail(400, "INVALID_PARENT_MESSAGE", "전하고 싶은 메시지는 10~300자로 적어 주세요.");
    }
    const { periodStart, periodEnd } = input;
    if (periodStart > periodEnd) fail(400, "INVALID_PERIOD", "기간을 다시 확인해 주세요.");
    if (periodEnd > todayString()) fail(400, "INVALID_PERIOD", "미래 날짜는 고를 수 없어요.");
    if (daysBetweenInclusive(periodStart, periodEnd) > STORY_PERIOD_MAX_DAYS) {
      fail(400, "PERIOD_TOO_LONG", `기간은 최대 ${STORY_PERIOD_MAX_DAYS}일까지 고를 수 있어요.`);
    }
    const diaryCount = db.diaries.filter(
      (d) => d.childId === childId && d.date >= periodStart && d.date <= periodEnd,
    ).length;
    if (diaryCount < 1) {
      fail(400, "NOT_ENOUGH_DIARIES", "이 기간에는 기록이 없어요. 기록을 먼저 남겨 주세요.");
    }

    const now = nowIso();
    const book: MockStorybook = {
      id: newId("storybook"),
      childId,
      periodStart,
      periodEnd,
      parentMessage,
      lessonTag: input.lessonTag || null,
      themeTag: input.themeTag || null,
      storyMode: input.storyMode ?? null,
      extraDetails: input.extraDetails?.trim() || null,
      createdAt: now,
      startedAt: now,
      attempt: 1,
    };
    db.storybooks.push(book);
    saveDb(db);
    return clone(toSummary(book, db));
  },

  async listStorybooks(childId) {
    await simulateNetwork();
    const db = loadDb();
    requireChild(childId, db);
    return clone(
      db.storybooks
        .filter((b) => b.childId === childId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((b) => toSummary(b, db)),
    );
  },

  async getStorybook(id) {
    await simulateNetwork();
    const db = loadDb();
    return clone(toStorybook(requireOwnedStorybook(id, db), db));
  },

  async retryStorybook(id) {
    await simulateNetwork();
    const db = loadDb();
    const book = requireOwnedStorybook(id, db);
    if (statusOf(book) !== "failed") {
      fail(409, "STORYBOOK_NOT_FAILED", "실패한 동화만 다시 만들 수 있어요.");
    }
    book.attempt += 1;
    book.startedAt = nowIso();
    saveDb(db);
    return clone(toSummary(book, db));
  },

  async getStorybookOptions() {
    await simulateNetwork();
    return {
      lessonTags: [...LESSON_TAGS],
      themeTags: THEME_TAGS.map((theme) => theme.tag),
      storyModes: ["daily", "fantasy"],
      voices: VOICES.map((voice) => ({ id: voice.id, label: voice.label })),
    };
  },

  async getStoryReadiness(childId, periodStart, periodEnd) {
    await simulateNetwork();
    const db = loadDb();
    requireChild(childId, db);
    const entries = db.diaries.filter(
      (d) => d.childId === childId && d.date >= periodStart && d.date <= periodEnd,
    );
    return clone(readinessOf(entries.map((d) => d.text), entries.some((d) => d.moodTag), entries.reduce((n, d) => n + d.photoIds.length, 0)));
  },

  async savePageAnswer(id, pageNo, answer) {
    await simulateNetwork();
    const db = loadDb();
    const book = requireCompleted(id, db);
    if (pageNo < 1 || pageNo > 6) fail(404, "PAGE_NOT_FOUND", "쪽을 찾을 수 없어요.");
    const pageAnswers = { ...book.pageAnswers };
    if (answer.trim()) pageAnswers[pageNo] = answer.trim();
    else delete pageAnswers[pageNo];
    book.pageAnswers = pageAnswers;
    saveDb(db);
    return clone(toStorybook(book, db));
  },

  async makeNarration(id, voice) {
    await simulateNetwork();
    const db = loadDb();
    const book = requireCompleted(id, db);
    if (!VOICES.some((v) => v.id === voice)) fail(400, "INVALID_VOICE", "목소리를 다시 골라 주세요.");
    book.narrationVoice = voice;
    saveDb(db);
    return clone(toStorybook(book, db));
  },

  async saveStorybookFeedback(id, input) {
    await simulateNetwork();
    const db = loadDb();
    const book = requireCompleted(id, db);
    if (input.reaction !== undefined) book.reaction = input.reaction;
    if (input.answers) book.childAnswers = input.answers.map((a) => a.trim());
    saveDb(db);
    return clone(toStorybook(book, db));
  },

  async markStorybookRead(id) {
    await simulateNetwork();
    const db = loadDb();
    const book = requireCompleted(id, db);
    book.readCount = (book.readCount ?? 0) + 1;
    saveDb(db);
    return { readCount: book.readCount };
  },

  async deleteStorybook(id) {
    await simulateNetwork();
    const db = loadDb();
    const book = requireOwnedStorybook(id, db);
    db.storybooks = db.storybooks.filter((b) => b !== book);
    saveDb(db);
  },
};
