import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { errorMessage } from "../api";
import AuthLayout from "../components/Auth/AuthLayout";
import Button from "../components/common/Button";
import CharacterPicker from "../components/common/CharacterPicker";
import TextField from "../components/common/TextField";
import AppearanceFields from "../components/Onboarding/AppearanceFields";
import ChildProfileFields from "../components/Onboarding/ChildProfileFields";
import { useCreateChild } from "../hooks/useAccount";
import { brandArt } from "../assets/art";
import { MAX_CHILD_AGE } from "../constants/childAppearance";
import type { ChildAppearance, ChildGender, ChildProfile } from "../types";
import { EMPTY_APPEARANCE, EMPTY_PROFILE, isAppearanceEmpty, isProfileEmpty } from "../utils/childProfile";
import { formatDate, todayString } from "../utils/date";
import { nameForms } from "../utils/korean";

const STEPS = ["주인공", "생김새", "어떤 아이"] as const;

// 만 12세 이하만 고를 수 있게 하는 생일 하한
function earliestBirthDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - (MAX_CHILD_AGE + 1));
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

// 1단계: 이름·모습·생일, 2단계: 생김새, 3단계: 어떤 아이인지.
// 아이는 마지막에 한 번에 만들고, 서버가 첫 캐릭터를 그리기 시작한다.
export default function OnboardingPage() {
  const navigate = useNavigate();
  const createChild = useCreateChild();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<ChildGender | null>(null);
  const [appearance, setAppearance] = useState<ChildAppearance>(EMPTY_APPEARANCE);
  const [profile, setProfile] = useState<ChildProfile>(EMPTY_PROFILE);
  const [submitted, setSubmitted] = useState(false);

  const minBirthDate = earliestBirthDate();
  const trimmed = name.trim();
  const forms = nameForms(trimmed || "아이");
  const nameError =
    trimmed.length === 0 ? "아이 이름을 알려 주세요." : trimmed.length > 20 ? "이름은 20자까지 쓸 수 있어요." : undefined;
  const genderError = gender ? undefined : "주인공 모습을 골라 주세요.";
  const birthError = !birthDate
    ? "생일을 알려 주세요. 나이에 맞는 모습으로 그려요."
    : birthDate < minBirthDate || birthDate > todayString()
      ? `만 ${MAX_CHILD_AGE}세 이하 아이의 생일을 골라 주세요.`
      : undefined;

  const go = (next: 1 | 2 | 3) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const goNext = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || genderError || birthError) return;
    go(2);
  };

  const finish = (withProfile: boolean) => {
    if (createChild.isPending) return;
    createChild.mutate(
      {
        name: trimmed,
        birthDate,
        gender,
        appearance: isAppearanceEmpty(appearance) ? null : appearance,
        profile: withProfile && !isProfileEmpty(profile) ? profile : null,
      },
      { onSuccess: () => navigate("/character", { replace: true }) },
    );
  };

  const stepper = (
    <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-brown/45" aria-label="아이 소개 단계">
      {STEPS.map((label, index) => {
        const current = step === index + 1;
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={`rounded-full px-3 py-1 ${current ? "bg-brown text-white" : "bg-white ring-1 ring-hairline"}`}
          >
            {index + 1} {label}
          </li>
        );
      })}
    </ol>
  );

  const backButton = (to: 1 | 2) => (
    <Button variant="ghost" className="flex-1" disabled={createChild.isPending} onClick={() => go(to)}>
      <ArrowLeft size={16} aria-hidden />
      이전
    </Button>
  );

  if (step === 2) {
    return (
      <AuthLayout
        title={`${forms.는} 어떻게 생겼나요?`}
        description="사진 대신 생김새를 알려 주시면, 아이와 닮은 그림책 주인공을 그려 드려요."
        illustration={brandArt.welcome}
      >
        {stepper}
        <AppearanceFields value={appearance} onChange={setAppearance} />
        <div className="mt-7 flex flex-col gap-2">
          <Button size="lg" className="w-full" onClick={() => go(3)}>
            다음
          </Button>
          <div className="flex gap-2">{backButton(1)}</div>
        </div>
      </AuthLayout>
    );
  }

  if (step === 3) {
    return (
      <AuthLayout
        title={`${forms.는} 어떤 아이인가요?`}
        description="고른 만큼만 동화에 녹여 드려요. 모두 선택이라 나중에 설정에서 채워도 괜찮아요."
        illustration={brandArt.welcome}
      >
        {stepper}
        <ChildProfileFields childName={trimmed} value={profile} onChange={setProfile} />
        {createChild.isError && (
          <p role="alert" className="mt-5 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
            {errorMessage(createChild.error)}
          </p>
        )}
        <div className="mt-7 flex flex-col gap-2">
          <Button size="lg" loading={createChild.isPending} className="w-full" onClick={() => finish(true)}>
            {forms.의} 캐릭터 그리기
          </Button>
          <div className="flex gap-2">
            {backButton(2)}
            <Button variant="ghost" className="flex-1" disabled={createChild.isPending} onClick={() => finish(false)}>
              건너뛰고 그리기
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="동화의 주인공을 소개해 주세요"
      description="이름과 모습, 생일을 먼저 알려 주세요. 나중에 설정에서 언제든 바꿀 수 있어요."
      illustration={brandArt.welcome}
    >
      {stepper}
      <form onSubmit={goNext} noValidate className="flex flex-col gap-5">
        <TextField
          label="아이 이름"
          placeholder="예: 서아"
          autoComplete="off"
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
          hint="동화 속에서 이 이름으로 불려요."
          error={submitted ? nameError : undefined}
        />
        <div>
          <CharacterPicker value={gender} onChange={setGender} />
          {submitted && genderError && <p className="mt-1.5 text-xs text-error">{genderError}</p>}
        </div>
        <TextField
          label="생일"
          type="date"
          min={minBirthDate}
          max={todayString()}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          hint="나이에 맞는 모습과 문장으로 동화를 만들어요."
          error={submitted ? birthError : undefined}
        />
        <Button type="submit" size="lg" className="mt-1 w-full">
          다음
        </Button>
      </form>
    </AuthLayout>
  );
}
