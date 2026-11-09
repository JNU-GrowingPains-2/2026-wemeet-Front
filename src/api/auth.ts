import { request } from "./client";
import type { AuthResult, Credentials, MeResult, PasswordChangeInput, SignupInput } from "./types";

export const authApi = {
  signup: (input: SignupInput) =>
    request<AuthResult>("POST", "/auth/signup", { body: input, auth: false }),
  login: (input: Credentials) =>
    request<AuthResult>("POST", "/auth/login", { body: input, auth: false }),
  changePassword: (input: PasswordChangeInput) => request<void>("POST", "/auth/password", { body: input }),
  getMe: () => request<MeResult>("GET", "/me"),
};

export type AuthApi = typeof authApi;
