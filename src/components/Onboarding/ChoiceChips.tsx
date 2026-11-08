import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";

interface ChoiceChipsProps {
  legend: string;
  hint?: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  max: number;
  // 있으면 선택지에 없는 항목을 직접 추가할 수 있다.
  customPlaceholder?: string;
  itemMaxLength?: number;
}

const chipClass = (active: boolean) =>
  [
    "min-h-11 rounded-full px-4 text-sm font-semibold transition-colors",
    active ? "bg-brown text-white" : "bg-white text-brown/70 ring-1 ring-hairline hover:bg-sand-light",
  ].join(" ");

export default function ChoiceChips({
  legend,
  hint,
  options,
  value,
  onChange,
  max,
  customPlaceholder,
  itemMaxLength = 20,
}: ChoiceChipsProps) {
  const [draft, setDraft] = useState("");
  const full = value.length >= max;
  const custom = value.filter((item) => !options.includes(item));

  const toggle = (item: string) => {
    if (value.includes(item)) onChange(value.filter((v) => v !== item));
    else if (!full) onChange([...value, item]);
  };

  const addCustom = () => {
    const item = draft.trim().slice(0, itemMaxLength);
    if (!item || full) return;
    if (!value.includes(item)) onChange([...value, item]);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 입력 조합 중에 누른 Enter는 무시한다.
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      addCustom();
    }
  };

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-brown">
        {legend}
        <span className="ml-1.5 font-normal text-brown/45">
          {value.length}/{max}
        </span>
      </legend>
      {hint && <p className="mb-3 text-xs text-brown/50">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              disabled={!active && full}
              onClick={() => toggle(option)}
              className={`${chipClass(active)} disabled:opacity-40`}
            >
              {option}
            </button>
          );
        })}
        {custom.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`${item} 빼기`}
            onClick={() => toggle(item)}
            className={`${chipClass(true)} inline-flex items-center gap-1`}
          >
            {item}
            <X size={14} aria-hidden />
          </button>
        ))}
      </div>
      {customPlaceholder && (
        <div className="mt-3 flex gap-2">
          <input
            value={draft}
            maxLength={itemMaxLength}
            disabled={full}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={full ? "더 고를 수 없어요" : customPlaceholder}
            aria-label={`${legend} 직접 추가`}
            className="min-h-11 flex-1 rounded-lg border border-hairline bg-white px-3 text-sm text-brown outline-none placeholder:text-brown/30 focus:border-ocean focus:ring-4 focus:ring-ocean/15 disabled:bg-canvas"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!draft.trim() || full}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-white px-3 text-sm font-semibold text-brown ring-1 ring-hairline hover:bg-sand-light disabled:opacity-40"
          >
            <Plus size={15} aria-hidden />
            추가
          </button>
        </div>
      )}
    </fieldset>
  );
}
