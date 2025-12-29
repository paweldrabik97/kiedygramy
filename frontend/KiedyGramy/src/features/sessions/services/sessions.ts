// src/features/sessions/services/sessions.ts
import { api } from "../../../api.ts";
import { Game } from "../../games/services/games.ts";

// --- TYPY DANYCH (DTO) ---

export type SessionDetails = {
    id: number;
    title: string;
    date?: string; // DateTime z C# przychodzi jako string ISO
    location?: string;
    description?: string;
    ownerId: number;
    ownerUserName: string;
    gameId?: number;
    gameTitle?: string;
};

export enum ParticipantStatus {
    Pending = "Invited",
    Accepted = "Confirmed",
    Rejected = "Declined"
}

export enum ParticipantRole {
    Member = 0,
    Organizer = 1
}

export type Participant = {
    userId: number;
    userName: string;
    role: ParticipantRole;
    status: ParticipantStatus;
};

export type AvailabilitySummary = {
    days: { date: string; availabilityCount: number }[];
};

export type InvitedSessionDto = {
    id: number;
    title: string;
    date?: string;
    location?: string;
    attendingCount: number;
};

export type GamePoolItem = {
    title: string;
    key: string;       // To jest Twoje ID gry (np. "7 cudów świata")
    count: number;     // Ile egzemplarzy jest dostępnych
    owners: string[];  // Kto posiada grę (np. ["pawel", "tomek"])
    imageUrl: string;
    minPlayers: number;
    maxPlayers: number;
    votesCount: number; // Ile osób już zagłosowało
    hasVoted: boolean;  // Czy JA już zagłosowałem (true/false)
};

// --- ENDPOINTY ---

// 1. Pobierz szczegóły sesji
export async function getSession(id: string) {
    return api<SessionDetails>(`/api/my/sessions/${id}`, { method: "GET" });
}

// 2. Pobierz listę moich sesji
export async function getSessions() {
    return api<SessionDetails[]>(`/api/my/sessions`, { method: "GET" });
}

// 3. Utwórz nową sesję
export async function createSession(session: {
    title: string;
    date?: string;
    location?: string;
    description?: string;
    gameId?: number;
}) {
    return api<SessionDetails>(`/api/my/sessions`, {
        method: "POST",
        body: JSON.stringify(session)
    });
}

// 4. Pobierz uczestników
export async function getSessionParticipants(id: string) {
    return api<Participant[]>(`/api/my/sessions/${id}/participants`, { method: "GET" });
}

// 5. Zaproś użytkownika (po nicku lub emailu)
export async function inviteUser(sessionId: string, usernameOrEmail: string) {
    return api<void>(`/api/my/sessions/${sessionId}/invite`, {
        method: "POST",
        body: JSON.stringify({ usernameOrEmail })
    });
}

// 6. Odpowiedz na zaproszenie (RSVP - Będę / Nie będę)
export async function respondToSession(sessionId: string, isAccepted: boolean) {
    // Zakładam, że backend przyjmuje status lub boolean. 
    // Dostosuj body zależnie od tego co przyjmuje endpoint /respond
    // Tutaj zakładam wysłanie prostego obiektu statusu
    return api<void>(`/api/my/sessions/${sessionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ accept: isAccepted })
    });
}

// 7. Pobierz moją dostępność (na co zagłosowałem)
export async function getMyAvailability(sessionId: string) {
    return api<{ dates: string[] }>(`/api/my/sessions/${sessionId}/availability/me`, { method: "GET" });
}

// 8. Zagłosuj na terminy (Wyślij listę dat)
export async function updateAvailability(sessionId: string, dates: string[]) {
    return api<void>(`/api/my/sessions/${sessionId}/availability`, {
        method: "PUT",
        body: JSON.stringify({ Dates: dates })
    });
}

// 9. Pobierz podsumowanie dostępności (dla organizatora)
export async function getAvailabilitySummary(sessionId: string) {
    return api<AvailabilitySummary>(`/api/my/sessions/${sessionId}/availability/summary`, { method: "GET" });
}

// 10. Ustaw grę (Dla organizatora - aktualizacja sesji)
export async function updateSessionGame(sessionId: string, gameId: number) {
    return api<void>(`/api/my/sessions/${sessionId}`, { // Tutaj endpoint edycji sesji
        method: "PUT", 
        body: JSON.stringify({ gameId }) // Backend musi obsłużyć partial update lub pełny obiekt
    });
}

// 11. Pobierz sesje, na które zostałem zaproszony
export async function getInvitedSessions() {
    return api<InvitedSessionDto[]>("/api/my/sessions/invited", { method: "GET" });
}

// 12. Ustaw okno dostępności (Dla organizatora)
export async function setAvailabilityWindow(
    sessionId: string, 
    from: string,     // Format YYYY-MM-DD
    to: string,       // Format YYYY-MM-DD
    deadline: string  // Format YYYY-MM-DD
) {
    return api<void>(`/api/my/sessions/${sessionId}/availability/window`, {
        method: "POST",
        body: JSON.stringify({
            // Backend oczekuje pełnego ISO DateTime, więc doklejamy czas
            From: `${from}T00:00:00`,
            To: `${to}T23:59:59`,
            Deadline: `${deadline}T23:59:59`
        })
    });
}

// 13. Pobierz pulę gier do głosowania
export async function getSessionGamePool(sessionId: string) {
    return api<GamePoolItem[]>(`/api/my/sessions/${sessionId}/game-pool`, { 
        method: "GET" 
    });
}

// 14. Wyślij głosy na gry
export async function voteForGames(sessionId: string, gameKey: string) {
    console.log("Głosowanie na grę:", gameKey, "w sesji:", sessionId);
    return api<void>(`/api/my/sessions/${sessionId}/game-pool/votes`, {
        method: "POST",
        body: JSON.stringify({ key: gameKey })
    }); 
}