// 주인공 캐릭터를 그릴 외모 선택지. 사진 대신 이 특징으로 아이와 닮은 캐릭터를 그린다.
export const HAIR_OPTIONS = ["짧은 머리", "단발", "어깨까지 오는 머리", "긴 머리", "묶은 머리", "곱슬머리"] as const;

export const FEATURE_OPTIONS = [
  "안경",
  "동그란 얼굴",
  "통통한 볼",
  "큰 눈",
  "쌍꺼풀 없는 눈",
  "주근깨",
  "보조개",
  "앞니가 빠졌어요",
  "앞머리 있음",
  "머리핀·리본",
] as const;

export const APPEARANCE_LIMITS = { features: 6, note: 100, itemLength: 20 } as const;

// 그림책 주인공으로 그리는 나이 범위(서버와 같다)
export const MAX_CHILD_AGE = 12;
