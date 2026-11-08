import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { errorMessage } from "../api";
import AuthLayout from "../components/Auth/AuthLayout";
import Button from "../components/common/Button";
import CharacterPicker from "../components/common/CharacterPicker";
import TextField from "../components/common/TextField";
import ChildProfileFields from "../components/Onboarding/ChildProfileFields";
import { EMPTY_PROFILE, isProfileEmpty } from "../utils/childProfile";
import { useCreateChild } from "../hooks/useAccount";
import { brandArt } from "../assets/art";
import type { ChildGender, ChildProfile } from "../types";
import { todayString } from "../utils/date";
import { nameForms, possessive } from "../utils/korean";

// 1단계: 이름·모습·생일, 2단계: 어떤 아이인지. 아이는 2단계를 마칠 때 한 번에 만든다.
export default function OnboardingPage() {
  const navigate = useNavigate();
  const createChild = useCreateChild();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<ChildGender | null>(null);
  const [profile, setProfile] = useState<ChildProfile>(EMPTY_PROFILE);
  const [submitted, setSubmitted] = useState(false);

  const trimmed = name.trim();
  const nameError =
    trimmed.length === 0 ? "아이 이름을 알려 주세요." : trimmed.length > 20 ? "이름은 20자까지 쓸 수 있어요." : undefined;
  const genderError = gender ? undefined : "주인공 모습을 골라 주세요.";

  const goNext = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || genderError) return;
    setStep(2);
    window.scrollTo({ top: 0 });
  };

  const finish = (withProfile: boolean) => {
    if (createChild.isPending) return;
    createChild.mutate(
      {
        name: trimmed,
        birthDate: birthDate || null,
        gender,
        profile: withProfile && !isProfileEmpty(profile) ? profile : null,
      },
      { onSuccess: () => navigate("/", { replace: true }) },
    );
  };

  const stepper = (
    <ol className="mb-6 flex items-center gap-2 text-xs font-semibold text-brown/45" aria-label="아이 소개 단계">
      {(["주인공 정하기", "어떤 아이인가요"] as const).map((label, index) => {
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

  if (step === 2) {
    const forms = nameForms(trimmed);
    return (
      <AuthLayout
        title={`${forms.는} 어떤 아이인가요?`}
        description={`고른 만큼만 동화에 녹여 드려요. 모두 선택이라 나중에 설정에서 채워도 괜찮아요.`}
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
            {possessive(trimmed)} 하루 시작하기
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" disabled={createChild.isPending} onClick={() => setStep(1)}>
              <ArrowLeft size={16} aria-hidden />
              이전
            </Button>
            <Button variant="ghost" className="flex-1" disabled={createChild.isPending} onClick={() => finish(false)}>
              나중에 할게요
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="동화의 주인공을 소개해 주세요"
      description="이름과 모습을 먼저 알려 주세요. 나중에 설정에서 언제든 바꿀 수 있어요."
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
          label="생일 (선택)"
          type="date"
          max={todayString()}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          hint="나이에 맞는 문장으로 동화를 써요."
        />
        <Button type="submit" size="lg" className="mt-1 w-full">
          다음
        </Button>
      </form>
    </AuthLayout>
  );
}
