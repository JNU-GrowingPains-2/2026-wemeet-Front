import type { ChildAppearance, ChildProfile } from "../types";

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

export const EMPTY_APPEARANCE: ChildAppearance = { hair: null, features: [], note: null };

export function toAppearanceForm(appearance: ChildAppearance | null): ChildAppearance {
  return appearance ? { ...EMPTY_APPEARANCE, ...appearance } : EMPTY_APPEARANCE;
}

export function isAppearanceEmpty(appearance: ChildAppearance): boolean {
  return !appearance.hair && !appearance.features.length && !appearance.note?.trim();
}

export function sameAppearance(a: ChildAppearance | null, b: ChildAppearance | null): boolean {
  const normalize = (value: ChildAppearance | null) => {
    const form = toAppearanceForm(value);
    return JSON.stringify({ ...form, note: form.note?.trim() || null });
  };
  return normalize(a) === normalize(b);
}
