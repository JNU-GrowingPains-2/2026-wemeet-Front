import type { ChildProfile } from "../types";

export const EMPTY_PROFILE: ChildProfile = {
  personality: [],
  likes: [],
  family: [],
  daycare: null,
  note: null,
};

export function toProfileForm(profile: ChildProfile | null): ChildProfile {
  return profile ? { ...EMPTY_PROFILE, ...profile } : EMPTY_PROFILE;
}

export function isProfileEmpty(profile: ChildProfile): boolean {
  return (
    !profile.personality.length &&
    !profile.likes.length &&
    !profile.family.length &&
    !profile.daycare &&
    !profile.note?.trim()
  );
}

export function sameProfile(a: ChildProfile | null, b: ChildProfile | null): boolean {
  const normalize = (p: ChildProfile | null) => {
    const form = toProfileForm(p);
    return JSON.stringify({ ...form, note: form.note?.trim() || null });
  };
  return normalize(a) === normalize(b);
}
