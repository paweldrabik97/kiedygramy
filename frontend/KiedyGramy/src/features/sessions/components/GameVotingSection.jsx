import { useState, useEffect } from "react";
import { getSessionGamePool, voteForGames } from "../services/sessions";

export const GameVotingSection = ({ sessionId }) => {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, [sessionId]);

    const loadGames = async () => {
        try {
            const data = await getSessionGamePool(sessionId);
            setGames(data);
        } catch (error) {
            console.error("Błąd pobierania gier:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleVote = async (gameKey) => {
        // 1. Zapamiętujemy, co zmieniamy (żeby wiedzieć co cofnąć w razie błędu)
        const gameIndex = games.findIndex(g => g.key === gameKey);
        if (gameIndex === -1) return;
        const originalGame = games[gameIndex]; // Kopia "starej" gry do rollbacku

        // 2. Optimistic Update (bezpieczny)
        setGames(currentGames => {
            const newGames = [...currentGames];
            const gameToUpdate = newGames[gameIndex];
            
            // Obliczamy nowe wartości
            const newHasVoted = !gameToUpdate.hasVoted;
            const newVotesCount = newHasVoted 
                ? gameToUpdate.votesCount + 1 
                : gameToUpdate.votesCount - 1;

            // Podmieniamy obiekt w tablicy
            newGames[gameIndex] = {
                ...gameToUpdate,
                hasVoted: newHasVoted,
                votesCount: newVotesCount
            };
            
            return newGames;
        });

        // 3. Strzał do API
        try {
            await voteForGames(sessionId, gameKey); 
        } catch (error) {
            console.error("Błąd głosowania:", error);
            
            // 4. Rollback (bezpieczny)
            setGames(latestGames => {
                const rollbackArray = [...latestGames];
                const indexToRollback = rollbackArray.findIndex(g => g.key === gameKey);
                
                if (indexToRollback !== -1) {
                    rollbackArray[indexToRollback] = originalGame; 
                }
                
                return rollbackArray;
            });
            
            alert("Nie udało się zapisać głosu.");
        }
    };

    if (isLoading) return <div className="text-center p-4 animate-pulse">Ładowanie gier...</div>;

    if (games.length === 0) {
        return (
             <div className="text-gray-500 text-center py-6 border border-dashed border-gray-700 rounded-lg">
                Host nie dodał jeszcze żadnych gier do puli.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">W co gramy?</h3>
                <span className="text-xs text-gray-400">Kliknij, aby zagłosować</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {games.map((game) => {
                    const isSelected = game.hasVoted; // Stan bierzemy bezpośrednio z obiektu gry
                    
                    return (
                        <div 
                            key={game.key}
                            onClick={() => handleToggleVote(game.key)}
                            className={`
                                relative cursor-pointer flex gap-3 p-3 rounded-lg border transition-all group select-none
                                ${isSelected 
                                    ? "bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800"}
                            `}
                        >
                            {/* Obrazek gry */}
                            <div className="flex-shrink-0">
                                <img 
                                    src={game.imageUrl} 
                                    alt={game.title} 
                                    className={`w-16 h-16 object-cover rounded shadow-md ${isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`} 
                                />
                            </div>

                            {/* Treść */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-semibold truncate pr-2 ${isSelected ? "text-blue-100" : "text-gray-200"}`}>
                                        {game.title}
                                    </h4>
                                    
                                    {/* Checkbox / Serduszko */}
                                    <div className={`
                                        w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all
                                        ${isSelected ? "bg-blue-500 border-blue-500 scale-110" : "border-gray-500 bg-gray-900"}
                                    `}>
                                        {isSelected && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Metadane */}
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                    <span className="flex items-center gap-1 bg-gray-900 px-1.5 py-0.5 rounded">
                                        👥 {game.minPlayers}-{game.maxPlayers}
                                    </span>
                                    {game.owners.length > 0 && (
                                        <span className="bg-gray-900 px-1.5 py-0.5 rounded text-gray-400 truncate max-w-[100px]">
                                            🎒 {game.owners[0]} {game.owners.length > 1 && `+${game.owners.length - 1}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Licznik głosów */}
                            {game.votesCount > 0 && (
                                <div className={`
                                    absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border transition-colors
                                    ${isSelected ? "bg-blue-600 text-white border-blue-500" : "bg-gray-700 text-gray-300 border-gray-600"}
                                `}>
                                    {game.votesCount}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};