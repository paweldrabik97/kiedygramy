import { api } from "../../../api";

// --- TYPY ---

export type Genre = {
    id: number;
    name: string;
};



export type CreateCustomGameDto = {
    title: string;
    minPlayers: number;
    maxPlayers: number;
    playTime?: string;
    imageUrl?: string;
    genreIds: number[];
};

export type ImportBggGameDto = {
    sourceId: string;
    localTitle?: string;
};

// What comes back from the backend (game list)
export type Game = {
    id: number;
    title: string;
    localTitle?: string;
    genreIds: number[];
    minPlayers: number;
    maxPlayers: number;
    imageUrl?: string;
    playTime?: string;
    rating?: number;
    isCustom: boolean;
};

export type UpdateGameDto = {
    title?: string;
    localTitle?: string;
    genreIds?: number[];
    minPlayers?: number;
    maxPlayers?: number;
    imageUrl?: string;
    playTime?: string;
    rating?: number;
};

export type BggGame = {
    title: string;
    genres: string[]; // BGG returns strings!
    minPlayers: number;
    maxPlayers: number;
    imageUrl: string;
    playTime: string;
    sourceId: string;
};

// --- SERWISY ---

// 1. Fetch genre dictionary (NEW)
// Assuming you have such an endpoint. If not, you need to add it in the backend.
export async function getGenres() { 
    return api<Genre[]>("/api/genres", { method: "GET" });
}

export async function getGames() {
    return api<Game[]>("/api/my/games", { method: "GET" });
}

export async function addGame(data: CreateCustomGameDto) {
    return api<Game>("/api/my/games", { 
        method: "POST", 
        body: JSON.stringify(data) 
    });
}

export async function deleteGame(id: number) {
    return api<void>(`/api/my/games/${id}`, { method: "DELETE" });
}

export async function updateGame(id: number, data: Partial<UpdateGameDto>) {
    return api<Game>(`/api/my/games/${id}`, { 
        method: "PUT", 
        body: JSON.stringify(data) 
    });
}

// --- EXTERNAL SERVICES (INTEGRATIONS) ---

/**
 * 1. Search games in BGG through your backend (Proxy).
 * Assuming you create endpoint GET /api/bgg/search?query=...
 * If you do it in the games controller, e.g. /api/games/lookup, change the URL here.
 */
export async function searchBggGames(query: string, skip: number = 0, take: number = 10) {
    const params = new URLSearchParams({ query, skip: skip.toString(), take: take.toString() });
    // Returns an array of BggGame objects
    return api<BggGame[]>(`/api/external/games/search?${params.toString()}`, { method: "GET" });
}

/**
 * 2. Translate title through Wikidata (SPARQL).
 * Called directly from the browser (client-side fetch).
 * @param bggId - Game ID from BGG (sourceId)
 */
export async function fetchWikiTitle(bggId: string): Promise<string | null> {
    // SPARQL query: Find entity with property P2339 (BGG ID) == bggId and return PL/EN label
    const sparqlQuery = `
        SELECT ?gameLabel WHERE {
            ?game wdt:P2339 "${bggId}" .
            SERVICE wikibase:label { bd:serviceParam wikibase:language "pl,en". }
        }
        LIMIT 1
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'KiedyGramyApp/1.0 (hobby project)' 
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        
        // Extract value from Wikidata response
        // Structure: results -> bindings -> [0] -> gameLabel -> value
        const title = data.results?.bindings?.[0]?.gameLabel?.value;
        
        return title || null;
    } catch (error) {
        console.warn("Failed to fetch title from Wikidata:", error);
        return null;
    }
}

export async function importBggGame(data: ImportBggGameDto) {
    return api<Game>("/api/my/games/from-external", { 
        method: "POST", 
        body: JSON.stringify(data) 
    });
}