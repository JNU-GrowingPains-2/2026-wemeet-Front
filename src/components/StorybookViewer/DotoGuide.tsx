import { useEffect, useLayoutEffect, useRef } from "react";
import { QUESTION_KIND_STYLE } from "../../constants/storybook";
import { DOTO_POSES, dotoImage, type DotoLine, type DotoPose } from "./doto";

// 길잡이 다람쥐 도토. 책 화면 위에 얹혀 둥실거리다가, 말할 일이 있을 때만 자리를 옮긴다.

interface DotoGuideProps {
  // 책 왼쪽 위를 기준으로 한 도토의 자리(px)
  x: number;
  y: number;
  size: number;
  pose: DotoPose;
  // 그림은 왼쪽을 보고 있다. 말풍선이 오른쪽에 붙을 때는 뒤집어 말풍선 쪽을 보게 한다.
  mirrored: boolean;
  lines: DotoLine[];
  // side: 도토 오른쪽에 붙는다, above: 도토 머리 위에 붙는다
  layout: "side" | "above";
  bubbleWidth: number;
  // 지금 보이는 말풍선 묶음의 높이. 책 쪽이 그만큼 자리를 비워 글을 가리지 않게 한다.
  onStackHeight?: (height: number) => void;
  onPetClick?: () => void;
  petLabel: string;
}

const MAX_BUBBLES = 2;

// 도토 목소리가 생기면 여기서 재생한다. 주소가 없으면 아무 일도 하지 않는다.
function useDotoVoice(line: DotoLine | undefined) {
  const url = line?.from === "doto" ? line.audioUrl : null;
  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    void audio.play().catch(() => undefined);
    return () => audio.pause();
  }, [url]);
}

function Bubble({ line, layout }: { line: DotoLine; layout: "side" | "above" }) {
  const mine = line.from === "child";
  const tone =
    line.from === "child"
      ? "bg-[#f4e3c8] text-brown ring-sand/40"
      : line.from === "parent"
        ? "bg-ocean-light text-brown ring-ocean-soft/70"
        : "bg-[#fffdf7] text-brown ring-hairline";
  const corner = mine ? "rounded-br-[6px]" : layout === "side" ? "rounded-bl-[6px]" : "";
  return (
    <div className={`doto-bubble flex max-w-full flex-col ${mine ? "items-end self-end" : "items-start self-start"}`}>
      {line.label && <span className="mb-0.5 px-1.5 text-[10px] font-semibold tracking-wide text-brown/55 [text-shadow:0_0_6px_#fbf6ec,0_0_6px_#fbf6ec]">{line.label}</span>}
      <div
        className={`pointer-events-auto rounded-[16px] px-3 py-2 shadow-[0_1px_2px_rgb(63_56_51/0.08),0_8px_20px_-8px_rgb(63_56_51/0.28)] ring-1 ${tone} ${corner}`}
      >
        <p className={`${mine ? "font-handwriting text-[15px] sm:text-[17px]" : "font-book text-[13.5px] sm:text-[15.5px]"} leading-[1.5]`}>
          {line.kind && (
            <span className={`mr-1.5 inline-block rounded-full px-2 py-px align-[0.1em] font-body text-[10px] font-semibold leading-[1.5] ${QUESTION_KIND_STYLE[line.kind] ?? "bg-paper text-brown/70"}`}>
              {line.kind}
            </span>
          )}
          {line.text}
        </p>
        {line.action && (
          <button
            type="button"
            onClick={line.action.onClick}
            aria-expanded={line.action.pressed}
            className="mt-1 block text-[11px] font-medium text-ocean-deep underline underline-offset-[3px]"
          >
            {line.action.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DotoGuide({
  x,
  y,
  size,
  pose,
  mirrored,
  lines,
  layout,
  bubbleWidth,
  onStackHeight,
  onPetClick,
  petLabel,
}: DotoGuideProps) {
  const stack = useRef<HTMLDivElement>(null);
  const shown = lines.slice(-MAX_BUBBLES);
  useDotoVoice(shown.findLast((line) => line.from === "doto"));

  useLayoutEffect(() => {
    const el = stack.current;
    if (!el || !onStackHeight) return;
    const report = () => onStackHeight(el.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onStackHeight]);

  const stackStyle =
    layout === "side"
      ? { left: size + 4, bottom: Math.round(size * 0.12), width: bubbleWidth }
      : { left: (size - bubbleWidth) / 2, bottom: size + 6, width: bubbleWidth };

  return (
    <div
      className="doto-move pointer-events-none absolute left-0 top-0 z-[1000]"
      style={{ transform: `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)` }}
    >
      <button
        type="button"
        onClick={onPetClick}
        aria-label={petLabel}
        className="pointer-events-auto relative block cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ocean/30"
        style={{ width: size, height: size }}
      >
        <span className={`doto-bob absolute inset-0 block ${pose === "happy" ? "doto-hop" : ""}`}>
          {DOTO_POSES.map((name) => (
            <img
              key={name}
              src={dotoImage(name)}
              alt=""
              draggable={false}
              className="doto-pose absolute inset-0 h-full w-full select-none"
              style={{ opacity: name === pose ? 1 : 0, transform: mirrored ? "scaleX(-1)" : undefined }}
            />
          ))}
        </span>
      </button>
      <div ref={stack} aria-live="polite" className="absolute flex flex-col gap-1.5" style={stackStyle}>
        {shown.map((line) => (
          <Bubble key={line.id} line={line} layout={layout} />
        ))}
      </div>
    </div>
  );
}
