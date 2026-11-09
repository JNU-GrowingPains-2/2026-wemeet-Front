import { Link, useNavigate } from "react-router-dom";
import { Paintbrush } from "lucide-react";
import { errorMessage } from "../api";
import { useCurrentChild } from "../auth/authContext";
import AuthLayout from "../components/Auth/AuthLayout";
import CharacterVersions, { isCharacterDrawing } from "../components/Character/CharacterVersions";
import PhotoCharacterForm from "../components/Character/PhotoCharacterForm";
import Button from "../components/common/Button";
import { useCreateCharacter } from "../hooks/useAccount";
import { brandArt } from "../assets/art";
import { nameForms } from "../utils/korean";

// 가입 직후 주인공 캐릭터를 확인하고 고르는 화면. 같은 고르기·만들기는 설정의 프로필에서도 할 수 있다.
export default function CharacterPage() {
  const navigate = useNavigate();
  const child = useCurrentChild();
  const createCharacter = useCreateCharacter(child.id);
  const drawing = isCharacterDrawing(child);
  const forms = nameForms(child.name);
  const versions = child.characters;

  return (
    <AuthLayout
      title={drawing ? `${forms.의} 캐릭터를 그리고 있어요` : `${forms.의} 캐릭터를 골라 주세요`}
      description={
        drawing
          ? "30초쯤 걸려요. 다 그려지면 여기에 나타나요."
          : "고른 캐릭터가 앞으로 만드는 모든 동화의 주인공이 돼요. 언제든 바꿀 수 있어요."
      }
      illustration={brandArt.welcome}
    >
      <CharacterVersions child={child} />
      {createCharacter.isError && (
        <p role="alert" className="mt-4 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          {errorMessage(createCharacter.error)}
        </p>
      )}

      <Button size="lg" className="mt-6 w-full" disabled={drawing && versions.length === 0} onClick={() => navigate("/", { replace: true })}>
        {drawing && versions.length === 0 ? "다 그려지면 시작할 수 있어요" : `${forms.의} 하루 시작하기`}
      </Button>

      {/* 새로 만들기 */}
      <section className="mt-8 border-t border-hairline pt-6">
        <h2 className="text-sm font-bold text-brown">캐릭터 새로 만들기</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            className="flex-1"
            loading={createCharacter.isPending}
            disabled={drawing || child.characterStatus === "none"}
            onClick={() => createCharacter.mutate({ mode: "appearance" })}
          >
            <Paintbrush size={16} aria-hidden />
            생김새로 다시 그리기
          </Button>
          <Link
            to="/settings#character"
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg text-[15px] font-semibold text-brown/70 hover:bg-sand-light"
          >
            생김새 고치기
          </Link>
        </div>

        <div className="mt-5">
          <PhotoCharacterForm child={child} />
        </div>
        <p className="mt-3 text-center text-xs text-brown/45">캐릭터는 하루에 5번까지 새로 만들 수 있어요.</p>
      </section>
    </AuthLayout>
  );
}
