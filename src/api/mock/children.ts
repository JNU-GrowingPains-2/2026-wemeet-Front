import type { ChildrenApi } from "../children";
import type { Child, ChildProfile } from "../../types";
import { loadDb, newId, saveDb, type MockChild } from "./db";
import { fail, requireChild, requireUser, simulateNetwork } from "./util";

export const toChild = ({ id, name, birthDate, gender, profile }: MockChild): Child => ({
  id,
  name,
  birthDate,
  gender: gender ?? null,
  profile: profile ?? null,
});

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
    saveDb(db);
    return toChild(child);
  },
};
