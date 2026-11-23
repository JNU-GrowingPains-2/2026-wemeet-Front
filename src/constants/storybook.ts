// 교훈 카드. 서버의 app/ai/prompts.py LESSON_CARDS 와 같은 이름·순서다. slug 는 그림 파일 이름, tint 는 그림이 뜨기 전 바탕색.
export const LESSON_CARDS = [
  { tag: "나눔", slug: "sharing", tint: "#fbe6cf", hint: "함께 나누는 기쁨", phrase: "나누는 기쁨을 배우는 이야기" },
  { tag: "용기", slug: "courage", tint: "#fbdcd2", hint: "무서워도 한 걸음", phrase: "용기 내는 마음을 배우는 이야기" },
  { tag: "정직", slug: "honesty", tint: "#fbf0c4", hint: "솔직한 마음", phrase: "솔직한 마음을 배우는 이야기" },
  { tag: "배려", slug: "kindness", tint: "#f8d9df", hint: "마음 헤아리기", phrase: "친구를 생각하는 마음을 배우는 이야기" },
  { tag: "끈기", slug: "grit", tint: "#dcefd3", hint: "한 번 더 해 보기", phrase: "포기하지 않는 마음을 배우는 이야기" },
  { tag: "감사", slug: "thanks", tint: "#eadcf0", hint: "고마움 전하기", phrase: "고마운 마음을 전하는 이야기" },
  { tag: "사과", slug: "sorry", tint: "#d8e9f6", hint: "먼저 건네는 미안해", phrase: "먼저 미안하다고 말하는 이야기" },
  { tag: "기다림", slug: "waiting", tint: "#e3def5", hint: "차례를 기다리는 힘", phrase: "기다리는 마음을 배우는 이야기" },
  { tag: "스스로", slug: "myself", tint: "#d8f0ea", hint: "혼자 해 보는 뿌듯함", phrase: "스스로 해 보는 이야기" },
  { tag: "호기심", slug: "curiosity", tint: "#d9e3f8", hint: "궁금한 건 들여다보기", phrase: "궁금한 마음을 따라가는 이야기" },
  { tag: "우정", slug: "friendship", tint: "#fbe0c6", hint: "친구와 마음 맞추기", phrase: "친구와 마음을 맞추는 이야기" },
  { tag: "나다움", slug: "being-me", tint: "#f8ecc8", hint: "있는 그대로의 나", phrase: "있는 그대로의 나를 좋아하는 이야기" },
] as const;

export const LESSON_TAGS = LESSON_CARDS.map((card) => card.tag);

// 카드는 두 장까지 섞는다. 서버에는 "용기·사과"처럼 가운뎃점으로 이어 보내고, 앞의 것이 중심이다.
export const LESSON_MAX = 2;
export const LESSON_JOINER = "·";
export const splitLessons = (lessonTag: string | null | undefined): string[] =>
  (lessonTag ?? "").split(LESSON_JOINER).filter(Boolean);
export const lessonCard = (tag: string) => LESSON_CARDS.find((card) => card.tag === tag);
// 표지와 목록에 쓰는 한 줄. 한 장이면 카드의 문구, 두 장이면 이름을 나란히 적는다.
export const lessonPhrase = (lessonTag: string): string => {
  const tags = splitLessons(lessonTag);
  return tags.length === 1 ? (lessonCard(tags[0])?.phrase ?? `${tags[0]} 이야기`) : `${tags.join(" · ")} 이야기`;
};

export const STORY_MODES = [
  { mode: null, label: "알아서", hint: "기록에 맞춰 골라요" },
  { mode: "daily", label: "있었던 그대로", hint: "기록 속 하루를 따라가요" },
  { mode: "fantasy", label: "상상 한 스푼", hint: "인형이 말을 걸기도 해요" },
] as const;

export const EXTRA_DETAILS_MAX = 300;

// 읽어 주기 목소리. 서버의 app/ai/narration.py VOICES 와 같은 id 다.
export const VOICES = [
  { id: "warm_female", label: "다정한 엄마 목소리" },
  { id: "calm_female", label: "차분한 엄마 목소리" },
  { id: "warm_male", label: "다정한 아빠 목소리" },
  { id: "calm_male", label: "낮고 차분한 아빠 목소리" },
] as const;

// 읽으며 묻는 질문의 갈래별 색
export const QUESTION_KIND_STYLE: Record<string, string> = {
  가리키기: "bg-sand-light text-sand-ink",
  기분: "bg-error-light text-brown",
  예측: "bg-ocean-light text-ocean-deep",
  상상: "bg-forest-light text-forest",
  떠올리기: "bg-paper text-brown/70",
  "내 이야기": "bg-brown text-white",
};

export const PARENT_MESSAGE_MIN = 10;
export const PARENT_MESSAGE_MAX = 300;

export const STORY_PERIOD_DEFAULT_DAYS = 7;
export const STORY_PERIOD_MAX_DAYS = 31;
export const STORY_PERIOD_PRESETS = [3, 7, 14] as const;

export const PARENT_MESSAGE_EXAMPLES = [
  "친구에게 먼저 사과하는 용기를 알려주고 싶어요",
  "작은 것도 나누면 더 즐겁다는 걸 느꼈으면 해요",
  "실수해도 괜찮다고, 다시 해보면 된다고 말해주고 싶어요",
  "솔직하게 말하는 게 멋진 일이라는 걸 알려주고 싶어요",
];
