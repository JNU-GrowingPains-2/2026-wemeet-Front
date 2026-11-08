import { characterArt } from "../../assets/art";
import type { ChildGender } from "../../types";

interface CharacterAvatarProps {
  gender: ChildGender | null;
  // 아이별 캐릭터 그림. 없으면 성별 기본 캐릭터를 쓴다.
  imageUrl?: string | null;
  className?: string;
  ring?: boolean;
}

// 아이 프로필 자리에 쓰는 동화 캐릭터 얼굴
export default function CharacterAvatar({ gender, imageUrl, className = "h-10 w-10", ring = true }: CharacterAvatarProps) {
  const art = characterArt[gender ?? "girl"];
  return (
    <span
      className={[
        "block shrink-0 overflow-hidden rounded-full bg-paper",
        ring ? "ring-2 ring-white shadow-sm" : "",
        className,
      ].join(" ")}
    >
      <img
        src={imageUrl ?? art.portrait}
        alt=""
        className={
          imageUrl
            ? "h-full w-full scale-[2.2] object-cover object-[50%_14%]"
            : "h-full w-full scale-[1.35] object-cover object-[50%_22%]"
        }
        draggable={false}
      />
    </span>
  );
}
