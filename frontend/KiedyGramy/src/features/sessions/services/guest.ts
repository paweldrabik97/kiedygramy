import { api } from "../../../api.ts";

export type InviteLinkResponse = {
  token: string;
  expiresAt: string | null;
};

export type JoinAsGuestResponse = {
  guestCode: string;
  token: string;
  dto: {
    id: number;
    title: string;
    date?: string;
    location?: string;
  };
};

export const generateInviteLink = (sessionId: number): Promise<InviteLinkResponse> =>
  api(`/api/guest/${sessionId}/generate-invite-link`, { method: "POST" });

export const joinAsGuest = (token: string, guestName: string): Promise<JoinAsGuestResponse> =>
  api(`/api/guest/join-as-guest?token=${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify({ guestName }),
  });

export const rejoinAsGuest = (guestCode: string): Promise<void> =>
  api("/api/guest/rejoin-as-guest", {
    method: "POST",
    body: JSON.stringify({ guestCode }),
  });
