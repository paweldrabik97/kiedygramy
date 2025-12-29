import React, { useEffect, useState } from 'react';
import { getSessionGamePool, updateSessionGames } from '../services/sessions';

export const OrganizerGamePicker = ({ sessionId, currentGameIds = [], onGameSelected, onCancel }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Stan lokalny dla zaznaczonych gier (inicjowany tym, co już jest w sesji)
    const [selectedIds, setSelectedIds] = useState(currentGameIds);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Obsługa zaznaczania/odznaczania (Toggle)
    const handleToggle = (gameId) => {
        setSelectedIds(prev => {
            if (prev.includes(gameId)) {
                return prev.filter(id => id !== gameId); // Usuń
            } else {
                return [...prev, gameId]; // Dodaj
            }
        });
    };

    // Wysyłanie listy do API
    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Wysyłamy tablicę ID
            await updateSessionGames(sessionId, selectedIds); 
            onGameSelected(); // Odśwież widok rodzica
        } catch (error) {
            alert("Nie udało się zapisać gier.");
            setIsSubmitting(false);
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
                <div>
                    <h4 className="font-bold text-sm uppercase text-gray-500">Wybierz gry:</h4>
                    <span className="text-xs text-gray-400">Możesz zaznaczyć wiele</span>
                </div>
            </div>
            
            {/* LISTA GIER */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar mb-4">
                {games.map(game => {
                    // Używamy game.id (bo backend relacyjny wymaga int), ale fallback na key w razie czego
                    const id = game.id || game.key; 
                    const isSelected = selectedIds.includes(id);

                    return (
                        <div
                            key={id}
                            onClick={() => handleToggle(id)}
                            className={`
                                w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none group
                                ${isSelected 
                                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-500" 
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-primary"}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {/* Checkbox wizualny */}
                                <div className={`
                                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                                    ${isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}
                                `}>
                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>

                                {/* Obrazek */}
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">🎲</div>
                                )}
                                
                                <div>
                                    <div className={`font-bold transition-colors ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-gray-200"}`}>
                                        {game.title}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Właściciel: {game.owners?.[0] || "?"}
                                    </div>
                                </div>
                            </div>

                            {/* Licznik głosów */}
                            <div className={`
                                flex flex-col items-center justify-center w-10 h-10 rounded-lg font-bold text-sm
                                ${game.votesCount > 0 
                                    ? "bg-primary/10 text-primary border border-primary/20" 
                                    : "bg-gray-100 text-gray-400"}
                            `}>
                                <span>{game.votesCount}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* PRZYCISK ZAPISU */}
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                    {isSubmitting ? "Zapisywanie..." : `Zapisz wybór (${selectedIds.length})`}
                </button>
            </div>
        </div>
    );
};