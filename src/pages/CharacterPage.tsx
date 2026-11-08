import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { api, errorMessage } from "../api";
import { useCurrentChild } from "../auth/authContext";
import AuthLayout from "../components/Auth/AuthLayout";
import Button from "../components/common/Button";
import { useCreateCharacter } from "../hooks/useAccount";
import { queryKeys } from "../hooks/queryKeys";
import { brandArt, characterArt } from "../assets/art";
import { nameForms } from "../utils/korean";

// 아이별 주인공 캐릭터를 확인하는 화면. 그리는 동안에는 3초마다 상태를 다시 본다.
export default function CharacterPage() {
  const navigate = useNavigate();
  const child = useCurrentChild();
  const createCharacter = useCreateCharacter(child.id);
  const drawing = child.characterStatus === "queued" || child.characterStatus === "processing";
  const forms = nameForms(child.name);

  useQuery({
    queryKey: queryKeys.me,
    queryFn: api.getMe,
    refetchInterval: drawing ? 3_000 : false,
  });

  const image = child.characterImageUrl ?? (child.gender ? characterArt[child.gender].full : null);

  return (
    <AuthLayout
      title={drawing ? `${forms.의} 캐릭터를 그리고 있어요` : `${forms.는} 이런 모습이에요`}
      description={
        drawing
          ? "알려 주신 나이와 생김새로 그림책 주인공을 그려요. 30초쯤 걸려요."
          : "앞으로 만드는 모든 동화에서 이 모습으로 등장해요. 마음에 들지 않으면 다시 그릴 수 있어요."
      }
      illustration={brandArt.welcome}
    >
      <div className="relative mx-auto flex aspect-[2/3] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-2xl bg-paper ring-1 ring-hairline">
        {image && (
          <img
            src={image}
            alt={`${forms.의} 캐릭터`}
            className={`h-full w-full object-contain transition-opacity ${drawing ? "opacity-30 blur-[1px]" : ""}`}
          />
        )}
        {drawing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-brown">
            <LoaderCircle size={32} className="animate-spin" aria-hidden />
            <p className="text-sm font-semibold" role="status">
              그리는 중이에요
            </p>
          </div>
        )}
      </div>

      {child.characterStatus === "failed" && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          <TriangleAlert size={18} className="shrink-0 text-error" aria-hidden />
          캐릭터를 그리지 못했어요. 다시 그려 주세요.
          {child.characterImageUrl ? " 그동안은 이전 캐릭터로 동화를 만들어요." : ""}
        </p>
      )}
      {child.characterStatus === "none" && (
        <p className="mt-5 text-sm text-brown/60">
          주인공 모습을 아직 고르지 않았어요.{" "}
          <Link to="/settings" className="font-semibold text-ocean-deep underline underline-offset-2">
            설정에서 고르기
          </Link>
        </p>
      )}
      {createCharacter.isError && (
        <p role="alert" className="mt-5 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          {errorMessage(createCharacter.error)}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-2">
        <Button size="lg" className="w-full" disabled={drawing} onClick={() => navigate("/", { replace: true })}>
          {drawing ? "다 그려지면 시작할 수 있어요" : `${forms.의} 하루 시작하기`}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            loading={createCharacter.isPending}
            disabled={drawing || child.characterStatus === "none"}
            onClick={() => createCharacter.mutate()}
          >
            <RefreshCw size={16} aria-hidden />
            다시 그리기
          </Button>
          <Link
            to="/settings"
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg text-[15px] font-semibold text-brown/70 hover:bg-sand-light"
          >
            생김새 고치기
          </Link>
        </div>
        <p className="mt-1 text-center text-xs text-brown/45">하루에 5번까지 새로 그릴 수 있어요.</p>
      </div>
    </AuthLayout>
  );
}
