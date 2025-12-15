import { api } from "../../../api";

export type Session = {
    id: number;
    title: string;
    date?: string;
    location?: string;
    description?: string;
    gameId?: number;
}

export async function getSessions() {
    return api<Session[]>("/api/my/sessions", { method: "GET" });
}

export async function createSession(data: {
    title?: string;
    date?: string;
    location?: string;
    description?: string;
    gameId?: number;
}) {
    return api<Session>("/api/my/sessions", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteSession(id: number) {
    return api<void>(`/api/my/sessions/${id}`, { method: "DELETE" });
}

export async function updateSession(id: number, data: {
    date?: string;
    location?: string;
    description?: string;
    gameId?: number;
}) {
    return api<Session>(`/api/my/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function getSessionDetails(id:number) {
    return api<Session>(`/api/my/sessions/${id}`, { method: "GET" });
}
