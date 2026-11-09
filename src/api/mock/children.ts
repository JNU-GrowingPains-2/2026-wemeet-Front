import type { ChildrenApi } from "../children";
import type { CharacterVersion, Child, ChildAppearance, ChildProfile } from "../../types";
import { characterArt } from "../../assets/art";
import { loadDb, newId, saveDb, type MockChild } from "./db";
import { fail, requireChild, requireUser, simulateNetwork } from "./util";

// 목업에서는 캐릭터를 새로 그리지 않고, 고른 성별의 기본 캐릭터를 완성된 캐릭터로 보여 준다.
// 얼굴 사진 캐릭터는 실제로 그리지 않고 기본 캐릭터의 얼굴 그림으로 대신한다.
export const toChild = ({ id, name, birthDate, gender, profile, appearance, photoCharacterAt, selectedMode }: MockChild): Child => {
  const characters: CharacterVersion[] = gender
    ? [{ id: `mock-${gender}`, mode: "appearance", imageUrl: characterArt[gender].full, createdAt: new Date(0).toISOString() }]
    : [];
  if (gender && photoCharacterAt) {
    characters.push({ id: `mock-${gender}-photo`, mode: "photo", imageUrl: characterArt[gender].portrait, createdAt: photoCharacterAt });
  }
  const selected = characters.find((c) => c.mode === (selectedMode ?? "appearance")) ?? characters[0] ?? null;
  return {
    id,
    name,
    birthDate,
    gender: gender ?? null,
    profile: profile ?? null,
    appearance: appearance ?? null,
    characterStatus: gender ? "ready" : "none",
    // 기본 캐릭터는 프로필 사진(portrait)이 따로 있어서, 생김새 캐릭터일 때는 아이별 그림 자리를 비워 둔다.
    characterImageUrl: selected?.mode === "photo" ? selected.imageUrl : null,
    characters,
    selectedCharacterId: selected?.id ?? null,
  };
};

function cleanAppearance(appearance: ChildAppearance | null | undefined): ChildAppearance | null {
  if (!appearance) return null;
  const cleaned: ChildAppearance = {
    hair: appearance.hair?.trim() || null,
    features: [...new Set((appearance.features ?? []).map((v) => v.trim()).filter(Boolean))],
    note: appearance.note?.trim() || null,
  };
  return cleaned.hair || cleaned.features.length || cleaned.note ? cleaned : null;
}

// 서버와 같이 공백·중복을 정리하고, 아무것도 없으면 null 로 둔다.
function cleanProfile(profile: ChildProfile | null | undefined): ChildProfile | null {
  if (!profile) return null;
  const items = (values: string[]) => [...new Set(values.map((v) => v.trim()).filter(Boolean))];
  const cleaned: ChildProfile = {
    personality: items(profile.personality ?? []),
    likes: items(profile.likes ?? []),
    family: items(profile.family ?? []),
    daycare: profile.daycare?.trim() || null,
    note: profile.note?.trim() || null,
  };
  const empty =
    !cleaned.personality.length && !cleaned.likes.length && !cleaned.family.length && !cleaned.daycare && !cleaned.note;
  return empty ? null : cleaned;
}

function validateName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 20) {
    fail(400, "INVALID_CHILD_NAME", "아이 이름은 1~20자로 입력해 주세요.");
  }
  return trimmed;
}

export const mockChildrenApi: ChildrenApi = {
  async createChild(input) {
    await simulateNetwork();
    const db = loadDb();
    const user = requireUser(db);
    if (db.children.some((c) => c.userId === user.id)) {
      fail(409, "CHILD_ALREADY_EXISTS", "지금은 아이 한 명만 등록할 수 있어요.");
    }
    const child: MockChild = {
      id: newId("child"),
      userId: user.id,
      name: validateName(input.name),
      birthDate: input.birthDate || null,
      gender: input.gender ?? null,
      profile: cleanProfile(input.profile),
      appearance: cleanAppearance(input.appearance),
    };
    db.children.push(child);
    saveDb(db);
    return toChild(child);
  },

  async updateChild(childId, input) {
    await simulateNetwork();
    const db = loadDb();
    const child = requireChild(childId, db);
    if (input.name !== undefined) child.name = validateName(input.name);
    if (input.birthDate !== undefined) child.birthDate = input.birthDate || null;
    if (input.gender !== undefined) child.gender = input.gender ?? null;
    if (input.profile !== undefined) child.profile = cleanProfile(input.profile);
    if (input.appearance !== undefined) child.appearance = cleanAppearance(input.appearance);
    saveDb(db);
    return toChild(child);
  },

  async selectCharacter(childId, characterId) {
    await simulateNetwork();
    const db = loadDb();
    const child = requireChild(childId, db);
    const version = toChild(child).characters.find((c) => c.id === characterId);
    if (!version) fail(404, "CHARACTER_NOT_FOUND", "고른 캐릭터를 찾지 못했어요.");
    child.selectedMode = version.mode;
    saveDb(db);
    return toChild(child);
  },

  async createCharacter(childId, input) {
    await simulateNetwork();
    const db = loadDb();
    const child = requireChild(childId, db);
    if (!child.gender) fail(400, "GENDER_REQUIRED", "주인공 모습(여자아이·남자아이)을 먼저 골라 주세요.");
    if (input?.mode === "photo" && !input.faceConsent) {
      fail(400, "FACE_CONSENT_REQUIRED", "얼굴 사진을 AI로 보내는 데 동의해 주셔야 만들 수 있어요.");
    }
    // 서버처럼 새로 만든 캐릭터를 바로 주인공으로 고른다.
    const mode = input?.mode ?? "appearance";
    if (mode === "photo") child.photoCharacterAt = new Date().toISOString();
    child.selectedMode = mode;
    saveDb(db);
    return toChild(child);
  },
};
