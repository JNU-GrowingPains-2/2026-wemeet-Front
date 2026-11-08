import { APPEARANCE_LIMITS, FEATURE_OPTIONS, HAIR_OPTIONS } from "../../constants/childAppearance";
import type { ChildAppearance } from "../../types";
import ChoiceChips from "./ChoiceChips";

const chip = (active: boolean) =>
  [
    "min-h-11 rounded-full px-4 text-sm font-semibold transition-colors",
    active ? "bg-brown text-white" : "bg-white text-brown/70 ring-1 ring-hairline hover:bg-sand-light",
  ].join(" ");

// 아이와 닮은 주인공 캐릭터를 그리기 위한 외모 질문. 사진은 받지 않는다.
export default function AppearanceFields({
  value,
  onChange,
}: {
  value: ChildAppearance;
  onChange: (value: ChildAppearance) => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-brown">머리 모양</legend>
        <div className="flex flex-wrap gap-2">
          {HAIR_OPTIONS.map((option) => {
            const active = value.hair === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...value, hair: active ? null : option })}
                className={chip(active)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>
      <ChoiceChips
        legend="눈에 띄는 특징"
        hint="캐릭터에 그대로 그려 드려요."
        options={FEATURE_OPTIONS}
        value={value.features}
        onChange={(features) => onChange({ ...value, features })}
        max={APPEARANCE_LIMITS.features}
        customPlaceholder="예: 왼쪽 눈 밑 점, 갈색 머리"
        itemMaxLength={APPEARANCE_LIMITS.itemLength}
      />
      <div>
        <label htmlFor="child-appearance-note" className="mb-1 block text-sm font-semibold text-brown">
          더 알려 주고 싶은 모습 <span className="font-normal text-brown/45">선택</span>
        </label>
        <input
          id="child-appearance-note"
          maxLength={APPEARANCE_LIMITS.note}
          value={value.note ?? ""}
          onChange={(e) => onChange({ ...value, note: e.target.value || null })}
          placeholder="예: 노란 모자를 자주 써요, 웃을 때 눈이 반달이 돼요"
          className="min-h-13 w-full rounded-lg border border-hairline bg-white px-4 text-base text-brown outline-none placeholder:text-brown/30 focus:border-ocean focus:ring-4 focus:ring-ocean/15"
        />
      </div>
    </div>
  );
}
