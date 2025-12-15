import { api } from "../../../api";

export type Game = {
    id: number;
    title: string;
    genre?: string;
    minPlayers?: number;
    maxPlayers?: number;
};

export async function getGames() {
    return api<Game[]>("/api/my/games", { method: "GET" });
}

export async function addGame(data: {
    title: string;
    genre?: string;
    minPlayers?: number;
    maxPlayers?: number;
}) {
    return api<Game>("/api/my/games", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteGame(id: number) {
    return api<void>(`/api/my/games/${id}`, { method: "DELETE" });
}

export async function updateGame(id: number, data: {
    title?: string;
    genre?: string;
    minPlayers?: number;
    maxPlayers?: number;
}) {
    return api<Game>(`/api/my/games/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
