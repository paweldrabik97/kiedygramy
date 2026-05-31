import { useState, useEffect } from "react";
import { getSessionGamePool, voteForGames } from "../services/sessions";
import { useTranslation } from 'react-i18next';

export const GameVotingSection = ({ sessionId }) => {
    const { t } = useTranslation();
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
            console.error("Failed to fetch games:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleVote = async (gameKey) => {
        // 1. Save what we change (to know what to roll back on error)
        const gameIndex = games.findIndex(g => g.key === gameKey);
        if (gameIndex === -1) return;
        const originalGame = games[gameIndex]; // Copy of the old game for rollback

        // 2. Optimistic update (safe)
        setGames(currentGames => {
            const newGames = [...currentGames];
            const gameToUpdate = newGames[gameIndex];
            
            // Calculate new values
            const newHasVoted = !gameToUpdate.hasVoted;
            const newVotesCount = newHasVoted 
                ? gameToUpdate.votesCount + 1 
                : gameToUpdate.votesCount - 1;

            // Replace object in array
            newGames[gameIndex] = {
                ...gameToUpdate,
                hasVoted: newHasVoted,
                votesCount: newVotesCount
            };
            
            return newGames;
        });

        // 3. API call
        try {
            await voteForGames(sessionId, gameKey); 
        } catch (error) {
            console.error("Voting request failed:", error);
            
            // 4. Rollback (safe)
            setGames(latestGames => {
                const rollbackArray = [...latestGames];
                const indexToRollback = rollbackArray.findIndex(g => g.key === gameKey);
                
                if (indexToRollback !== -1) {
                    rollbackArray[indexToRollback] = originalGame; 
                }
                
                return rollbackArray;
            });
            
            alert(t('featureComponents.sessions.gameVotingSection.alerts.voteSaveFailed'));
        }
    };

    if (isLoading) return <div className="text-center p-4 animate-pulse">{t('featureComponents.sessions.gameVotingSection.loadingGames')}</div>;

    if (games.length === 0) {
        return (
            <div className="text-text-muted text-center py-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                {t('featureComponents.sessions.gameVotingSection.emptyPool')}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('featureComponents.sessions.gameVotingSection.title')}</h3>
                <span className="text-xs text-text-muted">{t('featureComponents.sessions.gameVotingSection.clickToVote')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {games.map((game) => {
                    const isSelected = game.hasVoted;

                    return (
                        <div
                            key={game.key}
                            onClick={() => handleToggleVote(game.key)}
                            className={`
                                relative cursor-pointer flex gap-3 p-3 rounded-xl border transition-all group select-none shadow-sm
                                ${isSelected
                                    ? "bg-gradient-to-b from-violet-100 to-white dark:from-violet-900/40 dark:to-violet-900/20 border-primary dark:border-violet-500 shadow-primary/10"
                                    : "bg-gradient-to-b from-slate-100 to-white dark:from-gray-800/80 dark:to-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary/40 dark:hover:border-gray-600"}
                            `}
                        >
                            {/* Game image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={game.imageUrl}
                                    alt={game.title}
                                    className={`w-16 h-16 object-cover rounded-lg shadow-sm ${isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-semibold truncate pr-2 ${isSelected ? "text-primary dark:text-violet-200" : "text-slate-800 dark:text-gray-200"}`}>
                                        {game.title}
                                    </h4>

                                    {/* Checkbox */}
                                    <div className={`
                                        w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all
                                        ${isSelected ? "bg-primary border-primary scale-110" : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-900"}
                                    `}>
                                        {isSelected && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                                        👥 {game.minPlayers}-{game.maxPlayers}
                                    </span>
                                    {game.owners.length > 0 && (
                                        <span className="bg-slate-100 dark:bg-gray-900 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                            🎒 {game.owners[0]} {game.owners.length > 1 && `+${game.owners.length - 1}`}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Vote counter */}
                            {game.votesCount > 0 && (
                                <div className={`
                                    absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border transition-colors
                                    ${isSelected ? "bg-primary text-white border-primary" : "bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"}
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