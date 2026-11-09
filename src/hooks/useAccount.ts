import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CharacterInput, type ChildInput, type Credentials, type MeResult, type SignupInput } from "../api";
import { useAuth } from "../auth/authContext";
import type { Child } from "../types";
import { queryKeys } from "./queryKeys";

export function useLogin() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: async (input: Credentials) => signIn(await api.login(input)),
  });
}

export function useSignup() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: async (input: SignupInput) => signIn(await api.signup(input)),
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChildInput) => api.createChild(input),
    onSuccess: (child) =>
      queryClient.setQueryData<MeResult>(queryKeys.me, (me) =>
        me ? { ...me, children: [child] } : me,
      ),
  });
}

function useReplaceChild() {
  const queryClient = useQueryClient();
  return (child: Child) =>
    queryClient.setQueryData<MeResult>(queryKeys.me, (me) =>
      me ? { ...me, children: me.children.map((c) => (c.id === child.id ? child : c)) } : me,
    );
}

export function useSelectCharacter(childId: string) {
  const replaceChild = useReplaceChild();
  return useMutation({
    mutationFn: (characterId: string) => api.selectCharacter(childId, characterId),
    onSuccess: replaceChild,
  });
}

export function useCreateCharacter(childId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: CharacterInput) => api.createCharacter(childId, input),
    onSuccess: (child) =>
      queryClient.setQueryData<MeResult>(queryKeys.me, (me) =>
        me ? { ...me, children: me.children.map((c) => (c.id === child.id ? child : c)) } : me,
      ),
  });
}

export function useUpdateChild(childId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ChildInput>) => api.updateChild(childId, input),
    onSuccess: (child) =>
      queryClient.setQueryData<MeResult>(queryKeys.me, (me) =>
        me ? { ...me, children: me.children.map((c) => (c.id === child.id ? child : c)) } : me,
      ),
  });
}
