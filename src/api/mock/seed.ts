// 목업 모드 체험용 데모 계정. 로그인할 때 없으면 만든다.
import { seedDecoration, seedEntries } from "../../mock/diaryEntries";
import { addDays, todayString } from "../../utils/date";
import { loadDb, newId, saveDb, type MockDiary, type MockPhoto, type MockStorybook } from "./db";

export const DEMO_ACCOUNT = { email: "demo@harudonghwa.app", password: "harudonghwa" } as const;
const DEMO_CHILD_NAME = "서아";

// 이미 완성된 동화들. offset은 오늘 기준 며칠 전인지.
const SEED_STORYBOOKS = [
  {
    lessonTag: "나눔",
    parentMessage: "친구와 나누면 기쁨이 두 배가 된다는 걸 알려주고 싶어요. 네 것을 기꺼이 내어줄 줄 아는 마음이 참 예뻐.",
    period: [7, 1],
    createdDaysAgo: 1,
  },
  {
    lessonTag: "용기",
    parentMessage: "무서워도 한 걸음 내디디면 해낼 수 있다고 말해주고 싶어. 엄마는 언제나 네 편이야.",
    period: [16, 10],
    createdDaysAgo: 9,
  },
  {
    lessonTag: "정직",
    parentMessage: "실수해도 괜찮아. 솔직하게 말해주는 네가 엄마는 제일 자랑스러워.",
    period: [30, 24],
    createdDaysAgo: 23,
  },
] as const;

export function ensureDemoAccount() {
  const db = loadDb();
  if (db.users.some((u) => u.email === DEMO_ACCOUNT.email)) return;

  const userId = newId("user");
  const childId = newId("child");
  // 한 달 넘게 기록을 모아 온 가족처럼 보이도록 가입일을 앞당긴다.
  db.users.push({ id: userId, ...DEMO_ACCOUNT, createdAt: new Date(Date.now() - 40 * 86_400_000).toISOString() });
  db.children.push({
    id: childId,
    userId,
    name: DEMO_CHILD_NAME,
    birthDate: "2021-05-20",
    gender: "girl",
    profile: {
      personality: ["호기심 많은", "다정한"],
      likes: ["그림 그리기", "동물", "바깥놀이"],
      family: ["엄마", "아빠", "할머니"],
      daycare: "어린이집",
      note: "요즘 친구에게 먼저 말을 거는 연습을 하고 있어요.",
    },
  });

  const today = todayString();
  for (const seed of seedEntries) {
    const date = addDays(today, -seed.offset);
    const photos: MockPhoto[] = seed.photos.map((key) => ({ id: newId("photo"), userId, url: `art:${key}` }));
    db.photos.push(...photos);
    const createdAt = `${date}T12:30:00.000Z`;
    db.diaries.push({
      id: newId("diary"),
      childId,
      date,
      text: seed.text,
      weather: seed.weather,
      moodTag: seed.moodTag,
      photoIds: photos.map((p) => p.id),
      decoration: seedDecoration(seed),
      createdAt,
      updatedAt: createdAt,
    } satisfies MockDiary);
  }

  for (const book of SEED_STORYBOOKS) {
    const createdAt = new Date(Date.now() - book.createdDaysAgo * 86_400_000).toISOString();
    db.storybooks.push({
      id: newId("storybook"),
      childId,
      periodStart: addDays(today, -book.period[0]),
      periodEnd: addDays(today, -book.period[1]),
      parentMessage: book.parentMessage,
      lessonTag: book.lessonTag,
      createdAt,
      startedAt: createdAt,
      attempt: 1,
    } satisfies MockStorybook);
  }

  saveDb(db);
}
