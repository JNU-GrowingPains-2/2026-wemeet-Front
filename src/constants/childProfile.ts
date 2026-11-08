// 온보딩·설정의 아이 소개 선택지. 고르지 않아도 되고, 고른 것만 동화의 작은 디테일로 쓰인다.
export const PERSONALITY_OPTIONS = [
  "호기심 많은",
  "다정한",
  "씩씩한",
  "수줍은",
  "활발한",
  "차분한",
  "장난꾸러기",
  "웃음이 많은",
  "꼼꼼한",
  "겁이 조금 많은",
] as const;

export const LIKE_OPTIONS = [
  "공룡",
  "자동차",
  "동물",
  "공주·왕자",
  "블록 놀이",
  "그림 그리기",
  "노래·춤",
  "그림책",
  "바깥놀이",
  "물놀이",
  "요리 놀이",
  "곤충",
] as const;

export const FAMILY_OPTIONS = [
  "엄마",
  "아빠",
  "형",
  "오빠",
  "누나",
  "언니",
  "동생",
  "할머니",
  "할아버지",
  "반려동물",
] as const;

export const DAYCARE_OPTIONS = ["집에서 지내요", "어린이집", "유치원", "초등학교"] as const;

export const PROFILE_LIMITS = {
  personality: 3,
  likes: 10,
  family: 10,
  itemLength: 20,
  note: 300,
} as const;
