import { api } from "../../../api";

// --- TYPY ---

export type Genre = {
    id: number;
    name: string;
};

// Zaktualizowany DTO pod Twoje wymagania
export type CreateGameDto = {
    title: string;
    genreIds: number[]; // <--- Tablica liczb!
    minPlayers: number;
    maxPlayers: number;
    imageUrl?: string;
    playTime?: string;
};

// To co wraca z backendu (lista gier)
export type Game = {
    id: number;
    title: string;
    genreIds: number[];
    minPlayers: number;
    maxPlayers: number;
    imageUrl?: string;
    playTime?: string;
};

export type BggGame = {
    title: string;
    genres: string[]; // BGG zwraca stringi!
    minPlayers: number;
    maxPlayers: number;
    imageUrl: string;
    playTime: string;
    sourceId: string;
};

// --- SERWISY ---

// 1. Pobieranie słownika gatunków (NOWE)
// Zakładam, że masz taki endpoint. Jeśli nie, musisz go dorobić w backendzie.
export async function getGenres() { 
    return api<Genre[]>("/api/genres", { method: "GET" });
}

export async function getGames() {
    return api<Game[]>("/api/my/games", { method: "GET" });
}

export async function addGame(data: CreateGameDto) {
    return api<Game>("/api/my/games", { 
        method: "POST", 
        body: JSON.stringify(data) 
    });
}

export async function deleteGame(id: number) {
    return api<void>(`/api/my/games/${id}`, { method: "DELETE" });
}

export async function updateGame(id: number, data: Partial<CreateGameDto>) {
    return api<Game>(`/api/my/games/${id}`, { 
        method: "PUT", 
        body: JSON.stringify(data) 
    });
}

// --- ZEWNĘTRZNE SERWISY (INTEGRACJE) ---

/**
 * 1. Wyszukiwanie gier w BGG przez Twój backend (Proxy).
 * Zakładam, że stworzysz endpoint GET /api/bgg/search?query=...
 * Jeśli zrobisz to w kontrolerze gier, np. /api/games/lookup, to zmień tutaj URL.
 */
export async function searchBggGames(query: string, skip: number = 0, take: number = 10) {
    const params = new URLSearchParams({ query, skip: skip.toString(), take: take.toString() });
    // Zwraca tablicę obiektów BggGame
    return api<BggGame[]>(`/api/external/games/search?${params.toString()}`, { method: "GET" });
}

/**
 * 2. Tłumaczenie tytułu przez Wikidata (SPARQL).
 * Wywoływane bezpośrednio z przeglądarki (Client-side fetch).
 * @param bggId - ID gry z BGG (sourceId)
 */
export async function fetchWikiTitle(bggId: string): Promise<string | null> {
    // Zapytanie SPARQL: Znajdź obiekt z property P3501 (BGG ID) == bggId i daj etykietę PL/EN
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
                // Wikidata prosi o User-Agent w nagłówku, aby nie blokować botów
                // Wpisz tu nazwę swojej apki lub po prostu 'KiedyGramyApp'
                'User-Agent': 'KiedyGramyApp/1.0 (hobby project)' 
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        
        // Wyciągamy wartość z odpowiedzi Wikidaty
        // Struktura: results -> bindings -> [0] -> gameLabel -> value
        const title = data.results?.bindings?.[0]?.gameLabel?.value;
        
        return title || null;
    } catch (error) {
        console.warn("Błąd pobierania tytułu z Wikidaty:", error);
        return null;
    }
}