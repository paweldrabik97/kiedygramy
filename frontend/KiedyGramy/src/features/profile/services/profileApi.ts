import { api } from "../../../api";

export type MeResponse = {
  id: number;
  username: string;
  email?: string | null;
  fullName?: string | null;
  city?: string | null;
};

export const profileApi = {
  me: () => api<MeResponse>("/api/auth/me"),

  changeUsername: (dto: { newUserName: string }) =>
    api<void>("/api/auth/change-username", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  changeFullName: (dto: { newfullName: string }) =>
    api<void>("/api/auth/change-fullname", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  changeCity: (dto: { newCity: string }) =>
    api<void>("/api/auth/change-city", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  changePassword: (dto: { currentPassword: string; newPassword: string }) =>
    api<void>("/api/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
};
