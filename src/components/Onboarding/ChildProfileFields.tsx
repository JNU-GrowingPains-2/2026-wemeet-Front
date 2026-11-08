import {
  DAYCARE_OPTIONS,
  FAMILY_OPTIONS,
  LIKE_OPTIONS,
  PERSONALITY_OPTIONS,
  PROFILE_LIMITS,
} from "../../constants/childProfile";
import type { ChildProfile } from "../../types";
import { nameForms } from "../../utils/korean";
import ChoiceChips from "./ChoiceChips";

interface ChildProfileFieldsProps {
  childName: string;
  value: ChildProfile;
  onChange: (value: ChildProfile) => void;
}

// 아이가 어떤 아이인지 묻는 질문들. 동화의 작은 디테일이 된다.
export default function ChildProfileFields({ childName, value, onChange }: ChildProfileFieldsProps) {
  const name = childName.trim() ? nameForms(childName.trim()) : null;
  const set = <K extends keyof ChildProfile>(key: K, next: ChildProfile[K]) => onChange({ ...value, [key]: next });
  const noteLength = value.note?.length ?? 0;

  return (
    <div className="flex flex-col gap-7">
      <ChoiceChips
        legend="성격"
        hint={`가장 잘 어울리는 것을 ${PROFILE_LIMITS.personality}개까지 골라 주세요.`}
        options={PERSONALITY_OPTIONS}
        value={value.personality}
        onChange={(next) => set("personality", next)}
        max={PROFILE_LIMITS.personality}
      />
      <ChoiceChips
        legend="좋아하는 것"
        hint="동화 속 장소나 소품으로 살짝 등장해요."
        options={LIKE_OPTIONS}
        value={value.likes}
        onChange={(next) => set("likes", next)}
        max={PROFILE_LIMITS.likes}
        customPlaceholder="예: 기차, 딸기, 뽀로로"
        itemMaxLength={PROFILE_LIMITS.itemLength}
      />
      <ChoiceChips
        legend="함께 사는 가족"
        hint="이야기에 필요할 때 가족이 등장해요. 반려동물은 이름을 적어 주셔도 좋아요."
        options={FAMILY_OPTIONS}
        value={value.family}
        onChange={(next) => set("family", next)}
        max={PROFILE_LIMITS.family}
        customPlaceholder="예: 강아지 콩이, 사촌 언니"
        itemMaxLength={PROFILE_LIMITS.itemLength}
      />
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-brown">낮에는 주로 어디에서 지내나요?</legend>
        <div className="flex flex-wrap gap-2">
          {DAYCARE_OPTIONS.map((option) => {
            const active = value.daycare === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => set("daycare", active ? null : option)}
                className={[
                  "min-h-11 rounded-full px-4 text-sm font-semibold transition-colors",
                  active ? "bg-brown text-white" : "bg-white text-brown/70 ring-1 ring-hairline hover:bg-sand-light",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label htmlFor="child-profile-note" className="mb-1 block text-sm font-semibold text-brown">
          요즘 {name ? name.가 : "아이가"} 겪고 있는 일
          <span className="ml-1.5 font-normal text-brown/45">선택</span>
        </label>
        <p className="mb-3 text-xs text-brown/50">요즘 관심사나 작은 고민을 적어 주시면 이야기의 결이 더 가까워져요.</p>
        <textarea
          id="child-profile-note"
          rows={3}
          maxLength={PROFILE_LIMITS.note}
          value={value.note ?? ""}
          onChange={(e) => set("note", e.target.value || null)}
          placeholder="예: 동생이 생겨서 형 노릇을 하고 싶어 해요. 밤에 혼자 자는 연습을 하고 있어요."
          className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-base leading-relaxed text-brown outline-none placeholder:text-brown/30 focus:border-ocean focus:ring-4 focus:ring-ocean/15"
        />
        <p className="mt-1 text-right text-xs text-brown/40">
          {noteLength}/{PROFILE_LIMITS.note}
        </p>
      </div>
    </div>
  );
}
