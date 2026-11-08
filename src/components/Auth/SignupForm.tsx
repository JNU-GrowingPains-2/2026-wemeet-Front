import { useState, type FormEvent } from "react";
import type { SignupInput } from "../../api";
import Button from "../common/Button";
import TextField from "../common/TextField";
import SignupConsents, { type ConsentState } from "./SignupConsents";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MAX = 128;

interface SignupFormProps {
  pending: boolean;
  serverError: string | null;
  onSubmit: (input: SignupInput) => void;
}

export default function SignupForm({ pending, serverError, onSubmit }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [consents, setConsents] = useState<ConsentState>({ collect: false, overseas: false });
  const [submitted, setSubmitted] = useState(false);

  const emailError = !EMAIL_PATTERN.test(email.trim()) ? "이메일 형식을 확인해 주세요." : undefined;
  const passwordError =
    password.length < 8
      ? "비밀번호는 8자 이상이어야 해요."
      : password.length > PASSWORD_MAX
        ? "비밀번호는 128자까지 쓸 수 있어요."
        : undefined;
  const confirmError = passwordConfirm !== password ? "비밀번호가 서로 달라요." : undefined;
  const agreeError = consents.collect && consents.overseas ? undefined : "필수 항목에 모두 동의해 주셔야 가입할 수 있어요.";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (emailError || passwordError || confirmError || agreeError || pending) return;
    onSubmit({ email: email.trim(), password, agreeToTerms: true });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="이메일"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="parent@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint="로그인할 때 쓰는 주소예요."
        error={submitted ? emailError : undefined}
      />
      <TextField
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        placeholder="8자 이상"
        maxLength={PASSWORD_MAX}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={submitted ? passwordError : undefined}
      />
      <TextField
        label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
        placeholder="한 번 더 입력해 주세요"
        maxLength={PASSWORD_MAX}
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        // 다 입력하기 전에는 오류를 띄우지 않는다.
        error={submitted || (passwordConfirm && passwordConfirm.length >= password.length) ? confirmError : undefined}
      />

      <SignupConsents
        value={consents}
        onChange={setConsents}
        error={submitted ? agreeError : undefined}
      />

      {serverError && (
        <p role="alert" className="rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          {serverError}
        </p>
      )}
      <Button type="submit" loading={pending} className="mt-1 w-full">
        가입하고 아이 소개하기
      </Button>
    </form>
  );
}
