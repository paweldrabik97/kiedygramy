import React, { useEffect, useState } from 'react';
import { getSessionGamePool, updateSessionGames } from '../services/sessions';
import { useTranslation } from 'react-i18next';

export const OrganizerGamePicker = ({ sessionId, currentGameIds = [], onGameSelected, onCancel }) => {
    const { t } = useTranslation();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Local state for selected games (initialized from what's already in the session)
    const [selectedIds, setSelectedIds] = useState(currentGameIds);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadPool = async () => {
            try {
                const data = await getSessionGamePool(sessionId);
                // Sorting: highest vote count first
                const sorted = data.sort((a, b) => b.votesCount - a.votesCount);
                setGames(sorted);
            } catch (error) {
                console.error("Failed to fetch game pool:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPool();
    }, [sessionId]);

    // Handle selecting/deselecting (toggle)
    const handleToggle = (gameId) => {
        setSelectedIds(prev => {
            if (prev.includes(gameId)) {
                return prev.filter(id => id !== gameId); // Remove
            } else {
                return [...prev, gameId]; // Add
            }
        });
    };

    // Send list to API
    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Send array of IDs
            await updateSessionGames(sessionId, selectedIds); 
            onGameSelected(); // Refresh parent view
        } catch (error) {
            alert(t('featureComponents.sessions.organizerGamePicker.alerts.saveGamesFailed'));
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm text-gray-500">{t('featureComponents.sessions.organizerGamePicker.loadingSuggestions')}</div>;

    if (games.length === 0) return (
        <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">
            {t('featureComponents.sessions.organizerGamePicker.emptyPool')}
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in-down">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h4 className="font-bold text-sm uppercase text-gray-500">{t('featureComponents.sessions.organizerGamePicker.selectGamesTitle')}</h4>
                    <span className="text-xs text-gray-400">{t('featureComponents.sessions.organizerGamePicker.selectManyHint')}</span>
                </div>
            </div>
            
            {/* GAME LIST */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar mb-4">
                {games.map(game => {
                    // Use game.id (relational backend requires int), with key as fallback
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
                                {/* Visual checkbox */}
                                <div className={`
                                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                                    ${isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}
                                `}>
                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>

                                {/* Image */}
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
                                        {t('featureComponents.sessions.organizerGamePicker.ownerLabel', { owner: game.owners?.[0] || '?' })}
                                    </div>
                                </div>
                            </div>

                            {/* Vote counter */}
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

            {/* SAVE BUTTON */}
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                    {isSubmitting ? t('featureComponents.sessions.organizerGamePicker.buttons.saving') : t('featureComponents.sessions.organizerGamePicker.buttons.saveSelection', { count: selectedIds.length })}
                </button>
            </div>
        </div>
    );
};