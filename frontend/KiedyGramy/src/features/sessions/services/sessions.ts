import { api } from "../../../api.ts";

// --- DATA TYPES (DTO) ---

export type SessionGame = {
    id: number;
    title: string;
    imageUrl?: string;
};

export type SessionDetails = {
    id: number;
    title: string;
    date?: string; // DateTime from C# comes as an ISO string
    location?: string;
    description?: string;
    ownerId: number;
    ownerUserName: string;
    games: SessionGame[];
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
    key: string;       // This is your game ID (e.g. "7 wonders") or a numeric ID
    count: number;     // How many copies are available
    owners: string[];  // Who owns the game (e.g. ["pawel", "tomek"])
    imageUrl: string;
    minPlayers: number;
    maxPlayers: number;
    votesCount: number; // How many people have already voted
    hasVoted: boolean;  // Whether I already voted (true/false)
    id?: number;        // Optional numeric game ID, if needed for mapping
};

// --- INTERFEJSY ---

export interface ChatMessage {
    id: number;
    sessionId: number;
    authorId: number;
    authorName: string;
    text: string;
    createdAt: string; 
}

export interface SessionParticipant {
    userId: number;
    userName: string;
    role: number;
    status: ParticipantStatus;
}

// --- ENDPOINTS ---

// 1. Get session details
export async function getSession(id: string) {
    return api<SessionDetails>(`/api/my/sessions/${id}`, { method: "GET" });
}

// 2. Get list of my sessions
export async function getSessions() {
    return api<SessionDetails[]>(`/api/my/sessions`, { method: "GET" });
}

// 3. Create a new session
export async function createSession(session: {
    title: string;
    date?: string;
    location?: string;
    description?: string;
    gameIds?: number[];
}) {
    return api<SessionDetails>(`/api/my/sessions`, {
        method: "POST",
        body: JSON.stringify(session)
    });
}

// 4. Get participants
export async function getSessionParticipants(id: string) {
    return api<Participant[]>(`/api/my/sessions/${id}/participants`, { method: "GET" });
}

// 5. Invite user (by nickname or email)
export async function inviteUser(sessionId: string, usernameOrEmail: string) {
    return api<void>(`/api/my/sessions/${sessionId}/invite`, {
        method: "POST",
        body: JSON.stringify({ usernameOrEmail })
    });
}

// 6. Respond to invitation (RSVP - Going / Not going)
export async function respondToSession(sessionId: string, isAccepted: boolean) {
    return api<void>(`/api/my/sessions/${sessionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ accept: isAccepted })
    });
}

// 7. Get my availability (what I voted for)
export async function getMyAvailability(sessionId: string) {
    return api<{ dates: string[] }>(`/api/my/sessions/${sessionId}/availability/me`, { method: "GET" });
}

// 8. Vote for dates (send date list)
export async function updateAvailability(sessionId: string, dates: string[]) {
    return api<void>(`/api/my/sessions/${sessionId}/availability`, {
        method: "PUT",
        body: JSON.stringify({ Dates: dates })
    });
}

// 9. Get availability summary (for organizer)
export async function getAvailabilitySummary(sessionId: string) {
    return api<AvailabilitySummary>(`/api/my/sessions/${sessionId}/availability/summary`, { method: "GET" });
}

// 10. Set GAMES (for organizer - update game list)
export async function updateSessionGames(sessionId: string, gameIds: number[]) {
    return api<void>(`/api/my/sessions/${sessionId}/games`, { 
        method: "PUT", 
        body: JSON.stringify({ gameIds }) 
    });
}

// 11. Get sessions I was invited to
export async function getInvitedSessions() {
    return api<InvitedSessionDto[]>("/api/my/sessions/invited", { method: "GET" });
}

// 12. Set availability window (for organizer)
export async function setAvailabilityWindow(
    sessionId: string, 
    from: string,     // Format YYYY-MM-DD
    to: string,       // Format YYYY-MM-DD
    deadline: string  // Format YYYY-MM-DD
) {
    return api<void>(`/api/my/sessions/${sessionId}/availability/window`, {
        method: "POST",
        body: JSON.stringify({
            From: `${from}T00:00:00`,
            To: `${to}T23:59:59`,
            Deadline: `${deadline}T23:59:59`
        })
    });
}

// 13. Get game pool for voting
export async function getSessionGamePool(sessionId: string) {
    return api<GamePoolItem[]>(`/api/my/sessions/${sessionId}/game-pool`, { 
        method: "GET" 
    });
}

// 14. Send game votes (single toggle)
export async function voteForGames(sessionId: string, gameKey: string) {
    console.log("Voting for game:", gameKey, "in session:", sessionId);
    return api<void>(`/api/my/sessions/${sessionId}/game-pool/votes`, {
        method: "POST",
        body: JSON.stringify({ key: gameKey })
    }); 
}

// 15. Remove user from session (for organizer)
export async function removeUserFromSession(sessionId: string, userId: number) {
    return api<void>(`/api/my/sessions/${sessionId}/participants/${userId}`, {
        method: "DELETE"
    });
}


// 16. CHAT - Get chat messages
export const getChatMessages = async (
    sessionId: number | string, 
    limit: number = 20, 
    beforeMessageId: number | null = null
): Promise<ChatMessage[]> => {
    
    const params = new URLSearchParams({ limit: limit.toString() });
    
    if (beforeMessageId !== null) {
        params.append("beforeMessageId", beforeMessageId.toString());
    }

    return api<ChatMessage[]>(`/api/my/sessions/${sessionId}/chat/messages?${params.toString()}`, {
        method: 'GET',
        headers: {
        }
    });
};

// 17. CHAT - Send chat message
export const sendChatMessage = async (
    sessionId: number | string, 
    text: string
): Promise<ChatMessage | null> => {
    
    return api<ChatMessage | null>(`/api/my/sessions/${sessionId}/chat/messages`, {
        method: 'POST',
        headers: {
        },
        body: JSON.stringify({ text })
    });
};

// 18. Set DATE (for organizer - updating game list)
export async function setFinalDate(sessionId: string, date: string) {
    return api<void>(`/api/my/sessions/${sessionId}/final-date`, {
        method: "POST",
        body: JSON.stringify({ dateTime: date })
    });
}