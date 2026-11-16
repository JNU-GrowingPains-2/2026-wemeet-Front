import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { StorybookPage } from "../../types";
import { nameForms } from "../../utils/korean";
import { BrandMark } from "../layout/Brand";
import PageFlipper, { type Leaf, type PageFlipperHandle } from "./PageFlipper";
import QuestionPanel from "./QuestionPanel";
import { QUESTION_KIND_STYLE } from "../../constants/storybook";

export interface StoryBookData {
  title: string;
  coverImageUrl: string | null;
  pages: StorybookPage[];
  questions: string[];
  parentMessage: string;
  protagonistName: string;
  periodLabel: string;
  lessonTag: string | null;
  // 마지막 쪽 편지. 없으면 부모 메시지를 그대로 싣는다.
  letter?: string | null;
  // 쪽마다 음성이 있을 때 읽어 주기 버튼에 붙일 목소리 이름
  voiceLabel?: string | null;
}

interface StoryBookProps {
  book: StoryBookData;
  onSaveAnswer?: (pageNo: number, answer: string) => Promise<unknown>;
  // 뒤표지까지 처음 다 읽었을 때 한 번 부른다.
  onFinish?: () => void;
  // 책이 차지할 수 있는 최대 높이(px). 없으면 화면 높이에 맞춘다.
  maxHeight?: number;
  compact?: boolean;
}

const LESSON_PHRASE: Record<string, string> = {
  나눔: "나누는 기쁨을 배우는 이야기",
  용기: "용기 내는 마음을 배우는 이야기",
  정직: "솔직한 마음을 배우는 이야기",
  배려: "친구를 생각하는 마음을 배우는 이야기",
  끈기: "포기하지 않는 마음을 배우는 이야기",
};

const SPREAD_ASPECT = 0.72; // 펼친 책 한 쪽의 가로/세로
const SINGLE_ASPECT = 0.66;

// ---------- 페이지 면 ----------

function Paper({ children, className = "", gutter }: { children?: ReactNode; className?: string; gutter?: "left" | "right" }) {
  return (
    <div
      className={[
        "paper-grain relative h-full w-full bg-paper",
        gutter === "right" ? "book-gutter-right" : gutter === "left" ? "book-gutter-left" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function PageNumber({ n, side }: { n: number; side: "left" | "right" }) {
  return (
    <span
      className={`absolute bottom-[4%] font-book text-[0.72em] text-brown/40 ${side === "left" ? "left-[8%]" : "right-[8%]"}`}
    >
      {n}
    </span>
  );
}

function Cover({ book }: { book: StoryBookData }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-sand-soft">
      {book.coverImageUrl && (
        <img src={book.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fffdf7]/70 via-transparent to-transparent" />
      {/* 하드커버 책등 느낌 */}
      <div className="absolute inset-y-0 left-0 w-[5%] bg-gradient-to-r from-brown/30 via-brown/10 to-transparent" />
      <div className="book-cover-hinge absolute inset-y-0 left-[6.5%] w-[1.4%]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 rounded-r-[6px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08),inset_-3px_0_6px_rgb(255_255_255/0.25)]" aria-hidden />
      <div className="absolute inset-x-[9%] top-[7%] text-center">
        <p className="font-book text-[0.78em] tracking-[0.2em] text-sand-ink">하루동화 그림책</p>
        <h2 className="mt-[0.4em] font-book text-[1.9em] font-bold leading-[1.25] text-brown [text-shadow:0_1px_12px_rgba(255,253,247,0.9)]">
          {book.title}
        </h2>
      </div>
    </div>
  );
}

function Dedication({ book }: { book: StoryBookData }) {
  const n = nameForms(book.protagonistName);
  return (
    <Paper gutter="left" className="flex flex-col items-center justify-center px-[12%] text-center">
      <BrandMark className="h-[2.2em] w-[2.2em] opacity-80" />
      <p className="mt-[1.4em] font-book text-[1.05em] text-brown">사랑하는 {n.에게}</p>
      <p className="mt-[1em] font-book text-[0.82em] leading-[1.9] text-brown/65">
        {book.periodLabel}, 우리가 함께 남긴
        <br />
        작은 하루들로 엮은
        <br />
        세상에 단 하나뿐인 이야기예요.
      </p>
    </Paper>
  );
}

function TitlePage({ book }: { book: StoryBookData }) {
  return (
    <Paper gutter="right" className="flex flex-col items-center justify-center px-[10%] text-center">
      {book.coverImageUrl && (
        <div className="mb-[1.6em] aspect-square w-[52%] overflow-hidden rounded-full ring-[0.35em] ring-white shadow-md">
          <img src={book.coverImageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      )}
      <h3 className="font-book text-[1.45em] font-bold leading-snug text-brown">{book.title}</h3>
      {book.lessonTag && (
        <p className="mt-[0.8em] rounded-full bg-sand-light px-[1em] py-[0.25em] text-[0.72em] font-semibold text-sand-ink">
          {LESSON_PHRASE[book.lessonTag] ?? `${book.lessonTag} 이야기`}
        </p>
      )}
      <p className="mt-[1.6em] text-[0.72em] text-brown/45">글·그림 하루동화 · 주인공 {book.protagonistName}</p>
    </Paper>
  );
}

function Illustration({ page, title }: { page: StorybookPage; title: string }) {
  return (
    <div className="book-gutter-left relative h-full w-full bg-paper">
      <img
        src={page.imageUrl}
        alt={`${title} ${page.pageNo}장면 삽화`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}

// 책 쪽 아래에 인쇄된 듯 보이는 질문 한 줄
function PrintedQuestion({ page }: { page: StorybookPage }) {
  if (!page.question) return null;
  return (
    <p className="mt-[1.2em] flex items-start gap-[0.5em] border-t border-dashed border-sand/70 pt-[0.8em] text-[0.82em] leading-[1.6] text-brown/75">
      <span className={`shrink-0 rounded-full px-[0.6em] py-[0.1em] text-[0.8em] font-semibold ${QUESTION_KIND_STYLE[page.questionKind ?? ""] ?? "bg-paper"}`}>
        {page.questionKind ?? "질문"}
      </span>
      <span className="font-book">{page.question}</span>
    </p>
  );
}

function StoryText({ page, number }: { page: StorybookPage; number: number }) {
  const paragraphs = page.text.split("\n").filter(Boolean);
  return (
    <Paper gutter="right" className="flex flex-col justify-center px-[11%] py-[12%]">
      <span className="mb-[1.4em] block h-px w-[2.4em] bg-sand" aria-hidden />
      <div className="book-text font-book text-[1.02em] leading-[1.95] text-brown">
        {paragraphs.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <PrintedQuestion page={page} />
      <PageNumber n={number} side="right" />
    </Paper>
  );
}

function SinglePage({ page, title, number }: { page: StorybookPage; title: string; number: number }) {
  const paragraphs = page.text.split("\n").filter(Boolean);
  return (
    <Paper className="flex flex-col">
      <div className="relative h-[52%] w-full shrink-0 overflow-hidden">
        <img
          src={page.imageUrl}
          alt={`${title} ${page.pageNo}장면 삽화`}
          className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
          draggable={false}
        />
      </div>
      <div className="book-text flex flex-1 flex-col justify-center px-[8%] py-[5%] font-book text-[0.92em] leading-[1.8] text-brown">
        {paragraphs.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        <PrintedQuestion page={page} />
      </div>
      <PageNumber n={number} side="right" />
    </Paper>
  );
}

function Letter({ book, gutter }: { book: StoryBookData; gutter?: "left" | "right" }) {
  return (
    <Paper gutter={gutter} className="flex flex-col justify-center px-[11%]">
      <p className="text-[0.72em] font-semibold tracking-wider text-sand-ink">이 동화에 담은 마음</p>
      <div className="paper-lined mt-[1em] rounded-[0.6em] px-[0.9em] py-[0.3em] shadow-inner">
        <p className="ruled-text font-handwriting text-[1.2em] leading-[36px] text-brown">{book.letter || book.parentMessage}</p>
      </div>
      <p className="mt-[1em] text-right font-handwriting text-[1.05em] text-brown/70">— {nameForms(book.protagonistName).call}를 사랑하는 엄마, 아빠가</p>
    </Paper>
  );
}

function Questions({ book, gutter }: { book: StoryBookData; gutter?: "left" | "right" }) {
  return (
    <Paper gutter={gutter} className="flex flex-col justify-center px-[11%]">
      {book.questions.length > 0 && (
        <>
          <p className="text-[0.72em] font-semibold tracking-wider text-ocean-deep">다 읽고 함께 이야기해요</p>
          <ol className="mt-[1em] space-y-[0.9em]">
            {book.questions.map((q, i) => (
              <li key={q} className="flex gap-[0.6em] font-book text-[0.95em] leading-[1.7] text-brown">
                <span className="mt-[0.1em] flex h-[1.5em] w-[1.5em] shrink-0 items-center justify-center rounded-full bg-ocean-light text-[0.75em] font-bold text-ocean-deep">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="mt-[2.2em] text-center font-book text-[1.6em] font-bold text-brown/80">끝</p>
    </Paper>
  );
}

function BackCover({ book }: { book: StoryBookData }) {
  return (
    <div className="paper-kraft relative flex h-full w-full flex-col items-center justify-center px-[12%] text-center">
      <div className="absolute inset-y-0 right-0 w-[5%] bg-gradient-to-l from-brown/30 via-brown/10 to-transparent" />
      <BrandMark className="h-[2.6em] w-[2.6em]" />
      <p className="mt-[0.8em] font-book text-[1em] font-bold text-brown">하루동화</p>
      <p className="mt-[0.4em] text-[0.72em] leading-relaxed text-brown/60">
        {book.periodLabel}의 기록으로 만든
        <br />
        {book.protagonistName}만의 그림동화
      </p>
    </div>
  );
}

function BlankPaper({ gutter }: { gutter?: "left" | "right" }) {
  return <Paper gutter={gutter} />;
}

// ---------- 본체 ----------

function useBookSize(wrapper: React.RefObject<HTMLDivElement | null>, fullscreen: boolean, maxHeight?: number) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      const viewport = window.innerHeight;
      const height = fullscreen ? viewport - 150 : Math.min(maxHeight ?? viewport - 220, viewport - 140);
      setSize({ width, height: Math.max(320, height) });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [wrapper, fullscreen, maxHeight]);
  return size;
}

export default function StoryBook({ book, maxHeight, compact = false, onSaveAnswer, onFinish }: StoryBookProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const flipper = useRef<PageFlipperHandle>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [position, setPosition] = useState<{ mode: "spread" | "single" | null; flipped: number }>({
    mode: null,
    flipped: 0,
  });
  const [reading, setReading] = useState(false);
  // 읽어 주다가 질문이 있는 쪽에서 멈춰 아이의 대답을 기다리는 중인 장
  const [waitingAt, setWaitingAt] = useState<number | null>(null);
  const finishedRef = useRef(false);
  const leavesCountRef = useRef(0);
  const { width, height } = useBookSize(wrapper, fullscreen, maxHeight);
  const mode: "spread" | "single" = width >= 680 ? "spread" : "single";
  // 펼침/한 쪽 모드가 바뀌면 장 구성이 달라지므로 처음(표지)부터 보여준다.
  const flipped = position.mode === mode ? position.flipped : 0;
  const setFlipped = useCallback(
    (next: number) => {
      setPosition({ mode, flipped: next });
      // 마지막 장(뒤표지)에 닿으면 읽어주기를 멈춘다.
      if (next >= leavesCountRef.current) setReading(false);
    },
    [mode],
  );

  const pageHeight = mode === "spread" ? Math.min(height, width / 2 / SPREAD_ASPECT) : Math.min(height, width / SINGLE_ASPECT);
  const pageWidth = pageHeight * (mode === "spread" ? SPREAD_ASPECT : SINGLE_ASPECT);
  const fontSize = Math.max(12, pageWidth * (mode === "spread" ? 0.043 : 0.047));

  // 펼침 모드: [표지 | 헌정 | 제목 | (그림, 글)… | 마음 편지 | 질문·끝 | 뒤표지]
  const { leaves, speech } = useMemo(() => {
    if (mode === "spread") {
      const faces: ReactNode[] = [<Cover key="cover" book={book} />, <Dedication key="dedication" book={book} />, <TitlePage key="title" book={book} />];
      const speak: string[] = [book.title, "", book.title];
      book.pages.forEach((page, i) => {
        faces.push(
          <Illustration key={`img-${i}`} page={page} title={book.title} />,
          <StoryText key={`txt-${i}`} page={page} number={i + 1} />,
        );
        speak.push("", page.text);
      });
      faces.push(
        <Letter key="letter" book={book} gutter="left" />,
        <Questions key="questions" book={book} gutter="right" />,
        <BackCover key="back" book={book} />,
      );
      speak.push(book.letter || book.parentMessage, book.questions.join(" "), "");
      if (faces.length % 2 === 1) {
        faces.push(<BlankPaper key="blank" gutter="left" />);
        speak.push("");
      }
      const result: Leaf[] = [];
      for (let i = 0; i < faces.length; i += 2) result.push({ front: faces[i], back: faces[i + 1] });
      // 펼친 상태 f에서 읽을 글: 오른쪽 면(faces[2f])
      const perState = Array.from({ length: result.length + 1 }, (_, f) => speak[2 * f] ?? "");
      return { leaves: result, speech: perState };
    }
    const faces: ReactNode[] = [
      <Cover key="cover" book={book} />,
      <TitlePage key="title" book={book} />,
      ...book.pages.map((page, i) => <SinglePage key={`page-${i}`} page={page} title={book.title} number={i + 1} />),
      <Letter key="letter" book={book} />,
      <Questions key="questions" book={book} />,
      <BackCover key="back" book={book} />,
    ];
    const speak = [book.title, book.title, ...book.pages.map((p) => p.text), book.letter || book.parentMessage, book.questions.join(" "), ""];
    return {
      leaves: faces.map((front, i) => ({ front, back: <BlankPaper key={`blank-${i}`} /> })),
      speech: [...speak, ""],
    };
  }, [book, mode]);

  const total = leaves.length;
  useEffect(() => {
    leavesCountRef.current = total;
  }, [total]);

  // 두 모드 모두 i번째 장면은 flipped = i + 2 일 때 보인다.
  const sceneIndex = flipped - 2;
  const currentPage = sceneIndex >= 0 && sceneIndex < book.pages.length ? book.pages[sceneIndex] : null;
  const hasAudio = book.pages.some((p) => p.audioUrl);

  useEffect(() => {
    if (flipped >= total && total > 0 && !finishedRef.current) {
      finishedRef.current = true;
      onFinish?.();
    }
  }, [flipped, total, onFinish]);

  // ---------- 읽어주기 ----------
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const canRead = canSpeak || hasAudio;
  useEffect(() => {
    if (!reading || !canRead) return;
    if (flipped >= total) return;
    let timer: number | undefined;
    let cancelled = false;
    // 질문이 있는 쪽은 다 읽고 멈춰서 아이와 이야기할 시간을 준다.
    const afterRead = () => {
      if (cancelled) return;
      if (currentPage?.question) setWaitingAt(flipped);
      else timer = window.setTimeout(() => flipper.current?.next(), 700);
    };
    const audioUrl = currentPage?.audioUrl;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = afterRead;
      audio.onerror = afterRead;
      void audio.play().catch(afterRead);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      };
    }
    const text = speech[flipped] ?? "";
    // 음성 파일로 읽는 책은 장면이 아닌 쪽(표지, 편지)은 조용히 넘긴다.
    if (!text || hasAudio || !canSpeak) {
      timer = window.setTimeout(() => flipper.current?.next(), 900);
      return () => window.clearTimeout(timer);
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/\n/g, " "));
    utter.lang = "ko-KR";
    utter.rate = 0.92;
    utter.pitch = 1.05;
    const voice = synth.getVoices().find((v) => v.lang.startsWith("ko"));
    if (voice) utter.voice = voice;
    utter.onend = afterRead;
    synth.speak(utter);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      utter.onend = null;
      synth.cancel();
    };
  }, [reading, flipped, speech, total, canSpeak, canRead, hasAudio, currentPage]);

  useEffect(() => () => {
    if (canSpeak) window.speechSynthesis.cancel();
  }, [canSpeak]);

  const waiting = reading && waitingAt === flipped;

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const atStart = flipped === 0;
  const atEnd = flipped >= total;
  const sceneCount = book.pages.length;
  const label = (() => {
    if (atStart) return "표지";
    if (atEnd) return "뒤표지";
    if (mode === "spread") {
      const scene = flipped - 1;
      if (scene <= 0) return "첫 장";
      if (scene <= sceneCount) return `${scene} / ${sceneCount} 장면`;
      return "마지막 장";
    }
    const scene = flipped - 1;
    if (scene <= 0) return "첫 장";
    if (scene <= sceneCount) return `${scene} / ${sceneCount} 장면`;
    return "마지막 장";
  })();

  const body = (
    <div className={fullscreen ? "flex h-full w-full flex-col" : ""}>
      <div
        ref={wrapper}
        className={[
          "relative w-full",
          fullscreen ? "flex flex-1 items-center justify-center px-4" : "",
          mode === "single" ? "overflow-x-clip" : "",
        ].join(" ")}
      >
        {width > 0 && (
          <div style={{ fontSize }} className={fullscreen ? "" : "py-2"}>
            <PageFlipper
              ref={flipper}
              leaves={leaves}
              mode={mode}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              flipped={flipped}
              onFlippedChange={setFlipped}
            />
          </div>
        )}
      </div>

      {/* 조작 막대 */}
      <div className={`mx-auto mt-5 flex w-full max-w-xl items-center gap-2 ${fullscreen ? "mb-6 px-4" : ""}`}>
        <button
          type="button"
          onClick={() => flipper.current?.prev()}
          disabled={atStart}
          aria-label="이전 장"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors disabled:opacity-30 ${fullscreen ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-brown shadow-sm ring-1 ring-hairline hover:bg-sand-light"}`}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="min-w-0 flex-1 px-1">
          <div className={`flex items-center justify-between text-xs font-medium ${fullscreen ? "text-white/70" : "text-brown/55"}`}>
            <span>{label}</span>
            {!compact && <span className="hidden sm:inline">← → 키 또는 책장을 끌어서 넘겨요</span>}
          </div>
          <div className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${fullscreen ? "bg-white/15" : "bg-hairline"}`}>
            <div
              className="h-full rounded-full bg-sand transition-[width] duration-500"
              style={{ width: `${(flipped / total) * 100}%` }}
            />
          </div>
        </div>
        {atEnd ? (
          <button
            type="button"
            onClick={() => flipper.current?.goTo(0)}
            aria-label="처음부터 다시 보기"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${fullscreen ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-brown shadow-sm ring-1 ring-hairline hover:bg-sand-light"}`}
          >
            <RotateCcw size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => flipper.current?.next()}
            aria-label="다음 장"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand text-brown shadow-sm transition-colors hover:bg-sand-strong"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {currentPage?.question && (
        <div className={fullscreen ? "px-4" : ""}>
          <QuestionPanel
            key={currentPage.pageNo}
            page={currentPage}
            waiting={waiting}
            dark={fullscreen}
            onNext={() => flipper.current?.next()}
            onSaveAnswer={onSaveAnswer}
          />
        </div>
      )}

      <div className={`mt-3 flex items-center justify-center gap-2 ${fullscreen ? "mb-4" : ""}`}>
        {canRead && (
          <button
            type="button"
            onClick={() => setReading((r) => !r)}
            aria-pressed={reading}
            className={`flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-medium transition-colors ${
              fullscreen
                ? "text-white/80 hover:bg-white/10"
                : reading
                  ? "bg-ocean-light text-ocean-deep"
                  : "text-brown/60 hover:bg-sand-light hover:text-brown"
            }`}
          >
            {reading ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
            {reading ? "읽어주기 멈추기" : hasAudio && book.voiceLabel ? `${book.voiceLabel}로 읽어주기` : "소리 내어 읽어주기"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          className={`flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-medium transition-colors ${
            fullscreen ? "text-white/80 hover:bg-white/10" : "text-brown/60 hover:bg-sand-light hover:text-brown"
          }`}
        >
          {fullscreen ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
          {fullscreen ? "작게 보기" : "크게 펼쳐 보기"}
        </button>
      </div>
    </div>
  );

  if (fullscreen) {
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${book.title} 크게 보기`}
        className="fixed inset-0 z-50 flex flex-col bg-[radial-gradient(ellipse_at_center,#4a403a_0%,#2a2420_75%)] pt-4"
      >
        {body}
      </div>,
      document.body,
    );
  }
  return body;
}
