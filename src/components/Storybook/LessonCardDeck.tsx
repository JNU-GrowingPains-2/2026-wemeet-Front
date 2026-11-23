import { ArrowLeftRight } from "lucide-react";
import { LESSON_CARDS, LESSON_MAX } from "../../constants/storybook";

// 카드 그림은 public/lesson-cards 에 있다. 만드는 방법은 design/lesson-cards 참고.
const cardImage = (slug: string) => `${import.meta.env.BASE_URL}lesson-cards/${slug}.webp`;

const ROLE = ["중심", "곁들임"];

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

// 그림 카드를 펼쳐 놓고 두 장까지 뽑는 교훈 카드. 먼저 뽑은 카드가 이야기의 중심이 된다.
export default function LessonCardDeck({ value, onChange }: Props) {
  const full = value.length >= LESSON_MAX;
  const toggle = (tag: string) => {
    if (value.includes(tag)) onChange(value.filter((t) => t !== tag));
    else if (!full) onChange([...value, tag]);
  };

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {LESSON_CARDS.map(({ tag, hint, slug, tint }, index) => {
          const order = value.indexOf(tag);
          const active = order >= 0;
          const blocked = full && !active;
          return (
            <li key={tag} className="lesson-card-deal" style={{ animationDelay: `${index * 35}ms` }}>
              <button
                type="button"
                aria-pressed={active}
                aria-disabled={blocked}
                aria-label={`${tag}, ${hint}${active ? `, ${ROLE[order]} 카드로 고름` : ""}`}
                onClick={() => toggle(tag)}
                className={["lesson-card", active ? "is-active" : "", blocked ? "is-blocked" : ""].join(" ")}
                style={{ "--card-tint": tint } as React.CSSProperties}
              >
                <img src={cardImage(slug)} alt="" loading="lazy" className="lesson-card-picture" />
                <span className="lesson-card-name">{tag}</span>
                <span className="lesson-card-hint">{hint}</span>
                {active && <span className="lesson-card-badge animate-pop-in">{ROLE[order]}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex min-h-11 flex-wrap items-center gap-2 rounded-xl bg-canvas px-4 py-2.5 text-sm" aria-live="polite">
        {value.length === 0 ? (
          <p className="text-brown/55">카드를 뽑지 않으면 적어 주신 마음에 가장 어울리는 이야기로 지어요.</p>
        ) : (
          <>
            <p className="text-brown">
              <span className="font-bold">{value[0]}</span>
              {value[1] ? <> 이야기에 <span className="font-bold">{value[1]}</span> 한 스푼</> : " 이야기"}
            </p>
            {value.length === 2 && (
              <button
                type="button"
                onClick={() => onChange([value[1], value[0]])}
                className="ml-auto flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-ocean-deep hover:bg-ocean-light"
              >
                <ArrowLeftRight size={14} aria-hidden />중심 카드 바꾸기
              </button>
            )}
            {value.length === 1 && <span className="ml-auto text-xs text-brown/45">한 장 더 섞을 수 있어요</span>}
          </>
        )}
      </div>
    </div>
  );
}
