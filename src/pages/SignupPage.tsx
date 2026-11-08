import { Link } from "react-router-dom";
import { errorMessage } from "../api";
import AuthLayout from "../components/Auth/AuthLayout";
import SignupForm from "../components/Auth/SignupForm";
import { useSignup } from "../hooks/useAccount";
import { brandArt } from "../assets/art";

export default function SignupPage() {
  const signup = useSignup();

  return (
    <AuthLayout
      title="하루동화를 시작해요"
      description="가입하고 나면 아이에 대해 몇 가지만 여쭤볼게요. 아이가 주인공인 그림동화를 만드는 데 쓰여요."
      illustration={brandArt.hero}
    >
      <ol className="mb-6 flex items-center gap-2 text-xs font-semibold text-brown/45" aria-label="가입 단계">
        <li className="rounded-full bg-brown px-3 py-1 text-white" aria-current="step">1 계정 만들기</li>
        <li aria-hidden>→</li>
        <li className="rounded-full bg-white px-3 py-1 ring-1 ring-hairline">2 아이 소개</li>
      </ol>
      <SignupForm
        pending={signup.isPending}
        serverError={signup.isError ? errorMessage(signup.error) : null}
        onSubmit={(input) => signup.mutate(input)}
      />
      <p className="mt-6 text-center text-sm text-brown/60">
        이미 계정이 있나요?{" "}
        <Link to="/login" className="font-semibold text-ocean-deep underline-offset-2 hover:underline">
          로그인
        </Link>
      </p>
    </AuthLayout>
  );
}
