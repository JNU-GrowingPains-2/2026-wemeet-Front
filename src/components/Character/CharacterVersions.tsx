import { useQuery } from "@tanstack/react-query";
import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { api, errorMessage } from "../../api";
import { characterArt } from "../../assets/art";
import { queryKeys } from "../../hooks/queryKeys";
import { useSelectCharacter } from "../../hooks/useAccount";
import type { CharacterMode, Child } from "../../types";

export const CHARACTER_MODE_LABEL: Record<CharacterMode, { title: string; hint: string }> = {
  appearance: { title: "생김새로 그린 캐릭터", hint: "알려 주신 나이와 생김새로 그렸어요" },
  photo: { title: "얼굴 사진 캐릭터", hint: "아이 얼굴에 그림책 몸을 입혔어요" },
};

export const isCharacterDrawing = (child: Child) =>
  child.characterStatus === "queued" || child.characterStatus === "processing";

// 지금까지 그린 캐릭터를 보여 주고, 눌러서 주인공을 고른다. 그리는 동안에는 3초마다 상태를 다시 본다.
export default function CharacterVersions({ child, columns = 2 }: { child: Child; columns?: 2 | 3 }) {
  const selectCharacter = useSelectCharacter(child.id);
  const drawing = isCharacterDrawing(child);

  useQuery({
    queryKey: queryKeys.me,
    queryFn: api.getMe,
    refetchInterval: drawing ? 3_000 : false,
  });

  const fallback = child.gender ? characterArt[child.gender].full : null;
  const versions = child.characters;

  return (
    <div>
      <div className={`grid gap-3 ${columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
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
                <span className="block text-sm font-bold text-brown">{CHARACTER_MODE_LABEL[version.mode].title}</span>
                <span className="block text-xs text-brown/55">{CHARACTER_MODE_LABEL[version.mode].hint}</span>
              </span>
              {selected ? (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-brown px-2.5 py-1 text-xs font-semibold text-white">
                  <Check size={13} aria-hidden />
                  사용 중
                </span>
              ) : (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brown/70 ring-1 ring-hairline">
                  이걸로 고르기
                </span>
              )}
            </button>
          );
        })}
      </div>

      {drawing && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-sand-light px-4 py-3 text-sm text-brown">
          <LoaderCircle size={18} className="animate-spin" aria-hidden />
          새 캐릭터를 그리고 있어요. 30초쯤 걸리고, 그동안은 지금 캐릭터를 써요.
        </p>
      )}
      {child.characterStatus === "failed" && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          <TriangleAlert size={18} className="shrink-0 text-error" aria-hidden />
          마지막 캐릭터를 그리지 못했어요. 다시 만들어 주세요.
        </p>
      )}
      {selectCharacter.isError && (
        <p role="alert" className="mt-4 rounded-xl bg-error-light px-4 py-3 text-sm text-brown">
          {errorMessage(selectCharacter.error)}
        </p>
      )}
    </div>
  );
}
