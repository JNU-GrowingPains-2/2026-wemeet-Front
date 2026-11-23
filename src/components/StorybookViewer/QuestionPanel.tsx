import { useState } from "react";
import { Check, ChevronRight, MessageCircleQuestion } from "lucide-react";
import { QUESTION_KIND_STYLE } from "../../constants/storybook";
import type { StorybookPage } from "../../types";

interface QuestionPanelProps {
  page: StorybookPage;
  // 소리 내어 읽어 주다가 이 쪽에서 멈춰 질문을 기다리는 중인지
  waiting: boolean;
  dark?: boolean;
  // 도토가 질문과 부모 한마디를 말풍선으로 건넬 때는 대답 칸만 남긴다.
  guided?: boolean;
  onNext: () => void;
  onSaveAnswer?: (pageNo: number, answer: string) => Promise<unknown>;
}

// 책 아래에 지금 쪽의 질문을 보여 주고, 아이의 대답을 적게 한다.
export default function QuestionPanel({ page, waiting, dark = false, guided = false, onNext, onSaveAnswer }: QuestionPanelProps) {
  const saved = page.childAnswer ?? "";
  // 쪽이 바뀌면 key 로 새로 만들어지므로 초기값만 맞추면 된다.
  const [answer, setAnswer] = useState(saved);
  const [showTip, setShowTip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  if (!page.question) return null;
  // 도토와 함께일 때 적을 곳도, 기다리는 중도 아니면 보여 줄 것이 없다.
  if (guided && !onSaveAnswer && !waiting) return null;

  const dirty = answer.trim() !== saved;
  const save = async () => {
    if (!onSaveAnswer || !dirty) return;
    setSaving(true);
    setError(false);
    try {
      await onSaveAnswer(page.pageNo, answer);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-live="polite"
      className={[
        "mx-auto mt-4 w-full max-w-xl rounded-xl transition-shadow",
        guided ? "p-2.5" : "p-4",
        dark ? "bg-white/10 text-white" : "bg-white ring-1 ring-hairline",
        waiting ? (dark ? "ring-2 ring-sand" : "ring-2 ring-sand shadow-lift") : "",
      ].join(" ")}
    >
      {!guided && (
        <>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <MessageCircleQuestion size={16} className={dark ? "text-sand" : "text-sand-ink"} aria-hidden />
        <span className={dark ? "text-white/70" : "text-brown/55"}>{page.pageNo}장면에서 함께 이야기해요</span>
        {page.questionKind && (
          <span className={`ml-auto rounded-full px-2.5 py-0.5 ${QUESTION_KIND_STYLE[page.questionKind] ?? "bg-paper text-brown"}`}>
            {page.questionKind}
          </span>
        )}
      </div>
      <p className={`mt-2 font-book text-lg leading-snug ${dark ? "text-white" : "text-brown"}`}>{page.question}</p>
      {page.questionTip && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowTip((v) => !v)}
            aria-expanded={showTip}
            className={`text-xs font-medium underline underline-offset-4 ${dark ? "text-white/70" : "text-ocean-deep"}`}
          >
            {showTip ? "부모 한마디 접기" : "아이가 대답하면 이렇게 받아 주세요"}
          </button>
          {showTip && (
            <p className={`mt-1.5 rounded-lg px-3 py-2 text-sm ${dark ? "bg-white/10 text-white/85" : "bg-ocean-light text-brown"}`}>
              “{page.questionTip}”
            </p>
          )}
        </div>
      )}
        </>
      )}
      {onSaveAnswer && (
        <div className={`flex gap-2 ${guided ? "" : "mt-3"}`}>
          <label htmlFor={`answer-${page.pageNo}`} className="sr-only">
            아이의 대답
          </label>
          <input
            id={`answer-${page.pageNo}`}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              // 책장 넘기기 단축키(← →)와 겹치지 않게 막는다.
              e.stopPropagation();
              if (e.key === "Enter") void save();
            }}
            maxLength={300}
            placeholder={guided ? "아이의 대답을 적어 도토에게 들려주세요" : "아이의 대답을 적어 두면 다음 동화의 재료가 돼요"}
            className={`min-h-11 min-w-0 flex-1 rounded-lg border px-3 font-handwriting text-lg outline-none focus:ring-4 ${
              dark
                ? "border-white/20 bg-white/10 text-white placeholder:font-body placeholder:text-sm placeholder:text-white/40 focus:ring-white/15"
                : "border-hairline bg-canvas text-brown placeholder:font-body placeholder:text-sm placeholder:text-brown/35 focus:border-ocean focus:ring-ocean/15"
            }`}
          />
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving}
            className={`flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-semibold disabled:opacity-40 ${dark ? "bg-white/15 text-white" : "bg-sand text-brown"}`}
          >
            {!dirty && saved ? <Check size={15} aria-hidden /> : null}
            {saving ? "저장 중" : !dirty && saved ? "적었어요" : "적기"}
          </button>
        </div>
      )}
      {error && <p role="alert" className="mt-1.5 text-xs text-error">대답을 저장하지 못했어요. 다시 눌러 주세요.</p>}
      {waiting && (
        <button
          type="button"
          onClick={onNext}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-1 rounded-lg bg-sand text-sm font-semibold text-brown"
        >
          이야기 나눴으면 다음 장으로
          <ChevronRight size={16} aria-hidden />
        </button>
      )}
    </section>
  );
}
