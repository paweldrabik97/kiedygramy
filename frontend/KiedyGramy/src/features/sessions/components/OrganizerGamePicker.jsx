import React, { useEffect, useState } from 'react';
import { getSessionGamePool, updateSessionGame } from '../services/sessions'; // Upewnij się co do ścieżki

export const OrganizerGamePicker = ({ sessionId, currentGameId, onGameSelected, onCancel }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);

    useEffect(() => {
        const loadPool = async () => {
            try {
                const data = await getSessionGamePool(sessionId);
                // Sortowanie: Najpierw te z największą liczbą głosów
                const sorted = data.sort((a, b) => b.votesCount - a.votesCount);
                setGames(sorted);
            } catch (error) {
                console.error("Błąd pobierania puli gier:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPool();
    }, [sessionId]);

    const handleSelect = async (game) => {
        if (submittingId) return;
        setSubmittingId(game.id); // Blokada przycisków
        try {
            // Zakładam, że Twoja funkcja przyjmuje (sessionId, gameId)
            // Jeśli w puli 'id' to 'key' lub 'id', dostosuj tutaj:
            await updateSessionGame(sessionId, game.id || game.key); 
            onGameSelected(); // Odśwież widok rodzica
        } catch (error) {
            alert("Nie udało się wybrać gry.");
            setSubmittingId(null);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm text-gray-500">Ładowanie propozycji...</div>;

    if (games.length === 0) return (
        <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">
            Brak gier w puli. Dodaj coś w sekcji głosowania!
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in-down">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm uppercase text-gray-500">Wybierz zwycięzcę:</h4>
                <button onClick={onCancel} className="text-xs text-red-500 hover:underline">Anuluj</button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {games.map(game => {
                    const isSelected = game.id === currentGameId; // lub game.key
                    const isSubmitting = submittingId === (game.id || game.key);

                    return (
                        <button
                            key={game.id || game.key}
                            onClick={() => handleSelect(game)}
                            disabled={isSubmitting}
                            className={`
                                w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group
                                ${isSelected 
                                    ? "bg-green-50 border-green-500 ring-1 ring-green-500" 
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-primary hover:shadow-md"}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {/* Obrazek */}
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">🎲</div>
                                )}
                                
                                <div>
                                    <div className="font-bold text-slate-700 dark:text-gray-200 group-hover:text-primary transition-colors">
                                        {game.title}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Właściciel: {game.owners?.[0] || "?"}
                                    </div>
                                </div>
                            </div>

                            {/* Licznik głosów (Badge) */}
                            <div className={`
                                flex flex-col items-center justify-center w-10 h-10 rounded-lg font-bold text-sm
                                ${game.votesCount > 0 
                                    ? "bg-primary/10 text-primary border border-primary/20" 
                                    : "bg-gray-100 text-gray-400"}
                            `}>
                                <span>{game.votesCount}</span>
                                <span className="text-[9px] font-normal uppercase">Głosy</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};