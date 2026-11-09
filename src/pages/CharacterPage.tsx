import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Check, LoaderCircle, Paintbrush, TriangleAlert } from "lucide-react";
import { PHOTO_LIMITS, api, errorMessage } from "../api";
import { useCurrentChild } from "../auth/authContext";
import AuthLayout from "../components/Auth/AuthLayout";
import Button from "../components/common/Button";
import { useCreateCharacter, useSelectCharacter } from "../hooks/useAccount";
import { queryKeys } from "../hooks/queryKeys";
import { brandArt, characterArt } from "../assets/art";
import type { CharacterMode } from "../types";
import { nameForms } from "../utils/korean";

const MODE_LABEL: Record<CharacterMode, { title: string; hint: string }> = {
  appearance: { title: "생김새로 그린 캐릭터", hint: "알려 주신 나이와 생김새로 그렸어요" },
  photo: { title: "얼굴 사진 캐릭터", hint: "아이 얼굴에 그림책 몸을 입혔어요" },
};

// 아이별 주인공 캐릭터를 확인하고 고르는 화면. 그리는 동안에는 3초마다 상태를 다시 본다.
export default function CharacterPage() {
  const navigate = useNavigate();
  const child = useCurrentChild();
  const createCharacter = useCreateCharacter(child.id);
  const selectCharacter = useSelectCharacter(child.id);
  const fileInput = useRef<HTMLInputElement>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const drawing = child.characterStatus === "queued" || child.characterStatus === "processing";
  const forms = nameForms(child.name);

  useQuery({
    queryKey: queryKeys.me,
    queryFn: api.getMe,
    refetchInterval: drawing ? 3_000 : false,
  });

  const fallback = child.gender ? characterArt[child.gender].full : null;
  const versions = child.characters;

  const pickFace = (file: File | undefined) => {
    setPhotoError(null);
    if (!file) return;
    if (!(PHOTO_LIMITS.contentTypes as readonly string[]).includes(file.type)) {
      setPhotoError("JPG, PNG, HEIC, WEBP 사진만 쓸 수 있어요.");
      return;
    }
    if (file.size > PHOTO_LIMITS.maxBytes) {
      setPhotoError("사진 한 장은 10MB까지 쓸 수 있어요.");
      return;
    }
    setFaceFile(file);
    setFacePreview(URL.createObjectURL(file));
  };

  const makePhotoCharacter = async () => {
    if (!faceFile || !consent || uploading) return;
    setUploading(true);
    setPhotoError(null);
    try {
      const { photoId } = await api.uploadPhoto(faceFile);
      await createCharacter.mutateAsync({ mode: "photo", facePhotoId: photoId, faceConsent: true });
      setFaceFile(null);
      setFacePreview(null);
      setConsent(false);
    } catch (error) {
      setPhotoError(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

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
      {/* 고를 수 있는 캐릭터 */}
      <div className="grid grid-cols-2 gap-3">
        {versions.length === 0 && (
          <div className="col-span-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-paper ring-1 ring-hairline">
            {fallback && <img src={fallback} alt="" className="h-full object-contain opacity-40" />}
          </div>
        )}
        {versions.map((version) => {
          const selected = version.id === child.selectedCharacterId;
          return (
            <button
              key={version.id}
              type="button"
              aria-pressed={selected}
              disabled={selectCharacter.isPending}
              onClick={() => !selected && selectCharacter.mutate(version.id)}
              className={[
                "relative flex flex-col overflow-hidden rounded-2xl bg-paper text-left transition-all",
                selected ? "ring-[3px] ring-brown" : "ring-1 ring-hairline hover:ring-sand",
              ].join(" ")}
            >
              <img src={version.imageUrl} alt="" className="aspect-[2/3] w-full object-contain" />
              <span className="px-3 pb-3 pt-1">
                <span className="block text-sm font-bold text-brown">{MODE_LABEL[version.mode].title}</span>
                <span className="block text-xs text-brown/55">{MODE_LABEL[version.mode].hint}</span>
              </span>
              {selected && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-brown px-2.5 py-1 text-xs font-semibold text-white">
                  <Check size={13} aria-hidden />
                  사용 중
                </span>
              )}
            </button>
          );
        })}
      </div>

      {drawing && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-sand-light px-4 py-3 text-sm text-brown">
          <LoaderCircle size={18} className="animate-spin" aria-hidden />
          새 캐릭터를 그리고 있어요. 그동안은 지금 캐릭터를 써요.
        </p>
      )}
      {child.characterStatus === "failed" && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          <TriangleAlert size={18} className="shrink-0 text-error" aria-hidden />
          마지막 캐릭터를 그리지 못했어요. 다시 만들어 주세요.
        </p>
      )}
      {(createCharacter.isError || selectCharacter.isError) && !photoError && (
        <p role="alert" className="mt-4 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          {errorMessage(createCharacter.error ?? selectCharacter.error)}
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
            loading={createCharacter.isPending && !uploading}
            disabled={drawing || child.characterStatus === "none" || uploading}
            onClick={() => createCharacter.mutate({ mode: "appearance" })}
          >
            <Paintbrush size={16} aria-hidden />
            생김새로 다시 그리기
          </Button>
          <Link
            to="/settings"
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg text-[15px] font-semibold text-brown/70 hover:bg-sand-light"
          >
            생김새 고치기
          </Link>
        </div>

        <div className="mt-5 rounded-xl bg-canvas p-4 ring-1 ring-hairline/70">
          <p className="text-sm font-bold text-brown">아이 얼굴 사진으로 만들기 <span className="font-normal text-brown/45">선택</span></p>
          <p className="mt-1 text-xs leading-relaxed text-brown/55">
            정면 얼굴이 잘 보이는 사진 한 장을 고르면, 아이 얼굴에 그림책 캐릭터 몸을 입혀 그려요.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/webp,.heic"
            className="sr-only"
            onChange={(e) => pickFace(e.target.files?.[0])}
          />
          <div className="mt-3 flex items-center gap-3">
            {facePreview && <img src={facePreview} alt="고른 얼굴 사진" className="h-16 w-16 rounded-xl object-cover" />}
            <Button variant="secondary" size="sm" disabled={drawing || uploading} onClick={() => fileInput.current?.click()}>
              <Camera size={15} aria-hidden />
              {facePreview ? "다른 사진 고르기" : "얼굴 사진 고르기"}
            </Button>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-brown/70">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brown)]"
            />
            <span>
              <span className="font-semibold text-brown">[필수] 얼굴 사진 이용에 동의해요.</span> 캐릭터를 그리기 위해 이 사진이 미국의 AI
              서비스(OpenAI)로 전송돼요. 사진은 캐릭터를 그린 직후 지우고, 완성된 캐릭터 그림은 동화 삽화를 그릴 때 함께 전송돼요.{" "}
              <a href="/privacy#overseas" target="_blank" rel="noreferrer" className="font-semibold text-ocean-deep underline underline-offset-2">
                자세히 보기
              </a>
            </span>
          </label>
          {photoError && (
            <p role="alert" className="mt-3 text-sm text-error">
              {photoError}
            </p>
          )}
          <Button
            className="mt-4 w-full"
            loading={uploading}
            disabled={!faceFile || !consent || drawing}
            onClick={() => void makePhotoCharacter()}
          >
            얼굴 사진으로 캐릭터 만들기
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-brown/45">캐릭터는 하루에 5번까지 새로 만들 수 있어요.</p>
      </section>
    </AuthLayout>
  );
}
