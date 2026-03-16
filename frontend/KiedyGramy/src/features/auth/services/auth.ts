import { api } from "../../../api";

export type Me = {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  city?: string;
};

export async function register(data: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  city?: string;
}) {
  return api<{ id: number; username: string; email: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function login(usernameOrEmail: string, password: string) {
  return api<void>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ usernameOrEmail, password }),
  });
}

export async function googleLogin(credential: string) {
  return api<void>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export async function discordLogin(code: string, language: string) {
  return api<void>("/api/auth/discord", {
    method: "POST",
    body: JSON.stringify({ code, language }),
  });
}

export async function me() {
  return api<Me>("/api/auth/me");
}

export async function logout() {
  return api<void>("/api/auth/logout", { method: "POST" });
}
