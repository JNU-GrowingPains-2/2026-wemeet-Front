// API 함수의 입력 타입 (camelCase). 실제 구현과 목업 구현이 함께 쓴다.
import type { Child, ChildGender, ChildProfile, DiaryDecoration, User, Weather } from "../types";

export interface Credentials {
  email: string;
  password: string;
}

export interface SignupInput extends Credentials {
  // 개인정보 수집·이용과 국외 이전(AI 동화 생성) 필수 동의를 모두 했는지
  agreeToTerms: boolean;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface MeResult {
  user: User;
  children: Child[];
}

export interface ChildInput {
  name: string;
  birthDate?: string | null;
  gender?: ChildGender | null;
  profile?: ChildProfile | null;
}

export interface SaveDiaryInput {
  text: string;
  weather?: Weather | null;
  moodTag?: string | null;
  photoIds: string[];
  decoration?: DiaryDecoration | null;
}

export interface UploadedPhoto {
  photoId: string;
}

export interface CreateStorybookInput {
  periodStart: string;
  periodEnd: string;
  parentMessage: string;
  lessonTag?: string | null;
}
