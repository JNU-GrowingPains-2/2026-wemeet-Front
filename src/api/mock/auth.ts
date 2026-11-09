import type { AuthApi } from "../auth";
import type { Credentials } from "../types";
import type { Child, User } from "../../types";
import { loadDb, newId, nowIso, saveDb } from "./db";
import { clone, fail, requireUser, simulateNetwork, tokenForUser } from "./util";
import { ensureDemoAccount } from "./seed";
import { toChild } from "./children";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }: Credentials) {
  if (!EMAIL_PATTERN.test(email)) fail(400, "INVALID_EMAIL", "이메일 형식을 확인해 주세요.");
  if (password.length < 8) fail(400, "WEAK_PASSWORD", "비밀번호는 8자 이상이어야 해요.");
}

const publicUser = (u: { id: string; email: string; createdAt?: string }): User => ({
  id: u.id,
  email: u.email,
  createdAt: u.createdAt ?? null,
});

export const mockAuthApi: AuthApi = {
  async signup(input) {
    await simulateNetwork();
    validate(input);
    if (!input.agreeToTerms) fail(400, "TERMS_NOT_AGREED", "필수 항목에 모두 동의해 주세요.");
    const db = loadDb();
    const email = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) {
      fail(409, "EMAIL_TAKEN", "이미 가입된 이메일이에요.");
    }
    const user = { id: newId("user"), email, password: input.password, createdAt: nowIso() };
    db.users.push(user);
    saveDb(db);
    return { accessToken: tokenForUser(user.id), user: publicUser(user) };
  },

  async login(input) {
    await simulateNetwork();
    ensureDemoAccount();
    const db = loadDb();
    const email = input.email.trim().toLowerCase();
    const user = db.users.find((u) => u.email === email && u.password === input.password);
    if (!user) fail(401, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 맞지 않아요.");
    return { accessToken: tokenForUser(user.id), user: publicUser(user) };
  },

  async changePassword(input) {
    await simulateNetwork();
    const db = loadDb();
    const user = requireUser(db);
    if (user.password !== input.currentPassword) fail(400, "WRONG_PASSWORD", "지금 비밀번호가 맞지 않아요.");
    if (input.newPassword.length < 8 || input.newPassword.length > 128) {
      fail(400, "WEAK_PASSWORD", "비밀번호는 8~128자로 입력해 주세요.");
    }
    if (input.newPassword === input.currentPassword) fail(400, "SAME_PASSWORD", "지금과 다른 비밀번호로 바꿔 주세요.");
    user.password = input.newPassword;
    saveDb(db);
  },

  async getMe() {
    await simulateNetwork();
    const db = loadDb();
    const user = requireUser(db);
    const children: Child[] = db.children
      .filter((c) => c.userId === user.id)
      .map(toChild);
    return clone({ user: publicUser(user), children });
  },
};
