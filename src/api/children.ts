import type { Child } from "../types";
import { request } from "./client";
import type { CharacterInput, ChildInput } from "./types";

export const childrenApi = {
  createChild: (input: ChildInput) => request<Child>("POST", "/children", { body: input }),
  updateChild: (childId: string, input: Partial<ChildInput>) =>
    request<Child>("PATCH", `/children/${childId}`, { body: input }),
  // 지금 프로필(성별, 생일, 외모)로 주인공 캐릭터를 새로 그린다. 그리는 동안 characterStatus 가 queued·processing 이다.
  createCharacter: (childId: string, input: CharacterInput = { mode: "appearance" }) =>
    request<Child>("POST", `/children/${childId}/character`, { body: input }),
  // 고를 수 있는 캐릭터 중 하나를 앞으로 만드는 동화의 주인공으로 정한다.
  selectCharacter: (childId: string, characterId: string) =>
    request<Child>("POST", `/children/${childId}/character/${characterId}/select`),
};

export type ChildrenApi = typeof childrenApi;
