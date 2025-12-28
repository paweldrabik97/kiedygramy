import { data } from "react-router";
import { api } from "../../../api";

export async function respondToInvite(sessionId: number, accept: boolean): Promise<void> {
  await api<void>(`/api/my/sessions/${sessionId}/respond`, {
    method: "POST",
    body: JSON.stringify({ accept } ),
  });
}