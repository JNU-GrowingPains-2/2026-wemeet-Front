export type Weather = "sunny" | "cloudy" | "rainy" | "snowy";

export interface User {
  id: string;
  email: string;
  // 가입 시각(ISO). 홈의 "함께한 지 N일"은 이 날부터 센다.
  createdAt?: string | null;
}

// 동화 속 주인공 캐릭터. girl = 서아 캐릭터, boy = 도윤 캐릭터
export type ChildGender = "girl" | "boy";

// 온보딩에서 받는 아이 소개. 모두 선택 항목이고, 동화 글의 작은 디테일로 쓰인다.
export interface ChildProfile {
  personality: string[];
  likes: string[];
  family: string[];
  daycare: string | null;
  note: string | null;
}

// 주인공 캐릭터를 그릴 외모 특징
export interface ChildAppearance {
  hair: string | null;
  features: string[];
  note: string | null;
}

// none: 아직 없음, queued·processing: 그리는 중, ready: 완성, failed: 마지막 시도 실패
export type CharacterStatus = "none" | "queued" | "processing" | "ready" | "failed";

// appearance: 생김새로 그린 캐릭터, photo: 아이 얼굴 사진과 캐릭터 몸을 합친 캐릭터
export type CharacterMode = "appearance" | "photo";

export interface CharacterVersion {
  id: string;
  mode: CharacterMode;
  imageUrl: string;
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  birthDate: string | null; // YYYY-MM-DD
  gender: ChildGender | null;
  profile: ChildProfile | null;
  appearance: ChildAppearance | null;
  characterStatus: CharacterStatus;
  // 지금 쓰는 주인공 캐릭터 그림. 없으면 성별 기본 캐릭터를 쓴다.
  characterImageUrl: string | null;
  // 고를 수 있는 캐릭터(방식별 최신 1개씩)와 지금 쓰는 캐릭터
  characters: CharacterVersion[];
  selectedCharacterId: string | null;
}

export interface DiaryPhoto {
  id: string;
  url: string; // 표시용 URL (CloudFront 또는 목업 objectURL/dataURL)
}

export type PaperTheme = "lined" | "grid" | "dot" | "blossom" | "kraft";
export type PhotoFrame = "polaroid" | "tape" | "round";

// 일기 위에 붙이는 스티커. x는 종이 너비의 %, y는 종이 위쪽에서부터의 거리를 종이 너비의 %로 나타낸다.
export interface DiarySticker {
  id: string;
  kind: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

export interface DiaryDecoration {
  paper: PaperTheme;
  frame: PhotoFrame;
  stickers: DiarySticker[];
}

export interface DiaryEntry {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD, 아이별로 날짜당 1개
  text: string;
  weather: Weather | null;
  moodTag: string | null;
  photos: DiaryPhoto[];
  decoration: DiaryDecoration | null;
  createdAt: string;
  updatedAt: string;
}

export type StorybookStatus = "queued" | "processing" | "completed" | "failed";

export type QuestionKind = "가리키기" | "기분" | "예측" | "상상" | "떠올리기" | "내 이야기";

export interface StorybookPage {
  pageNo: number;
  text: string;
  imageUrl: string;
  // 이 쪽을 읽고 아이에게 묻는 질문. 예전에 만든 동화에는 없다.
  question?: string | null;
  questionKind?: QuestionKind | null;
  // 아이 대답을 받아 넓혀 줄 부모의 한마디 예시
  questionTip?: string | null;
  childAnswer?: string | null;
  // 읽어 주기 음성(mp3). 만들기 전에는 없다.
  audioUrl?: string | null;
}

export type StoryMode = "daily" | "fantasy";
export type StoryReaction = "loved" | "liked" | "meh";

export interface StorybookSummary {
  id: string;
  childId: string;
  title: string | null; // 완성 전에는 null
  status: StorybookStatus;
  periodStart: string;
  periodEnd: string;
  parentMessage: string;
  lessonTag: string | null;
  themeTag?: string | null;
  storyMode?: StoryMode | null;
  coverImageUrl: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Storybook extends StorybookSummary {
  pages: StorybookPage[]; // completed일 때만 채워짐
  // 다 읽고 아이와 나눌 질문. completed일 때만 채워지고, 없으면 빈 배열
  questions: string[];
  errorMessage: string | null;
  // 마지막 쪽에 싣는 부모의 편지. 예전 동화에는 없어서 부모 메시지를 대신 보여 준다.
  letter?: string | null;
  // questions 와 같은 순서. 적지 않은 대답은 빈 문자열
  childAnswers?: string[];
  reaction?: StoryReaction | null;
  readCount?: number;
  narrationVoice?: string | null;
}

export interface StorybookOptions {
  lessonTags: string[];
  themeTags: string[];
  storyModes: StoryMode[];
  voices: { id: string; label: string }[];
}

// 고른 기간의 기록이 동화 재료로 넉넉한지. 만들기 전에 보여 준다.
export interface StoryReadiness {
  diaryCount: number;
  textLength: number;
  photoCount: number;
  level: "empty" | "thin" | "ok" | "rich";
  hints: string[];
  questions: string[];
}
