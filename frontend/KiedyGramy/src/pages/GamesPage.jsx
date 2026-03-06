import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { getGames, deleteGame, updateGame, importBggGame, addGame } from '../features/games/services/games.ts';
import GameModal from '../features/games/components/GameModal.jsx';
import AddGameModal from '../features/games/components/AddGameModal.jsx';
import { useTranslation } from 'react-i18next';

// =====================================================================
// HELPER COMPONENT: Star Rating System
// =====================================================================
const StarRating = ({ rating, onRate, t }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform hover:scale-110"
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    title={t('gamesPage.rateStar', { star })}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 ${star <= (hover || rating) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600'} transition-colors duration-200`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

// =====================================================================
// MAIN COMPONENT: GamesPage
// =====================================================================
const GamesPage = () => {
    const { t } = useTranslation();
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    
    const [selectedGame, setSelectedGame] = useState(null); 
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const navigate = useNavigate();

    const fetchGames = async () => {
        try {
            const data = await getGames();
            setGames(data);
        } catch (error) {
            console.error("Error fetching games:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const handleNewGame = () => setIsAddModalOpen(true);

    const handleAddGameSubmit = async (newGameData) => {
        try {
            let createdGame;
            if (newGameData.action === 'BGG') {
                createdGame = await importBggGame(newGameData.data);
            } else if (newGameData.action === 'CUSTOM') {
                createdGame = await addGame(newGameData.data);
            }

            if (createdGame) {
                setGames(prevGames => [...prevGames, createdGame]);
            }
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to add game:", error);
            alert(t('gamesPage.errors.addGameFailed'));
        }
    };

    // Handle rating change (Stars)
    const handleRatingChange = async (gameId, newRating) => {
        // 1. Optimistic update (UI reacts immediately)
        setGames(prevGames => prevGames.map(game => 
            game.id === gameId ? { ...game, rating: newRating } : game
        ));

        // 2. Send to server
        try {
            await updateGame(gameId, { rating: newRating });
        } catch (error) {
            console.error("Failed to save rating:", error);
            alert(t('gamesPage.errors.ratingSaveFailed'));
            // Optional: revert rating if the API returns an error
        }
    };

    const toggleMenu = (id, e) => {
        e.stopPropagation(); // Prevents menu from closing when clicking the button itself
        setOpenMenuId(prevId => (prevId === id ? null : id));
    };

    const handleDetailsClick = (game) => {
        setSelectedGame(game);
        setOpenMenuId(null);
    };

    const handleDeleteClick = async (id) => {
        try {
            await deleteGame(id);
            setGames(prevGames => prevGames.filter(game => game.id !== id));
        } catch (error) {
            console.error("Error deleting game:", error);
        }
        setOpenMenuId(null);
    };

    const handleUpdateGame = async (gameId, newGameData) => {
        setIsLoading(true); 
        try {
            const updatedGame = await updateGame(gameId, newGameData); 
            
            setGames(prevGames =>
                prevGames.map(game => 
                    game.id === gameId ? { ...game, ...newGameData } : game
                )
            );
            setSelectedGame(newGameData); 
        } catch (error) {
            console.error("Failed to save game:", error);
            alert(t('gamesPage.errors.saveChangesFailed'));
        } finally {
            setOpenMenuId(null);
            setSelectedGame(null);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">{t('gamesPage.loadingLibrary')}</div>;
    }
  
    return (
        <div className='z-1 w-full p-6 max-w-7xl mx-auto'>
            <div className='flex justify-between items-center mb-8'>
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">{t('gamesPage.title')}</h1>
                <Button onClick={handleNewGame} variant="primary">
                    {t('gamesPage.addGame')}
                </Button>
            </div>

            {games.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 mb-4 text-lg">{t('gamesPage.emptyLibrary')}</p>
                    <button onClick={handleNewGame} className="text-violet-600 dark:text-violet-400 font-bold hover:underline text-lg">
                        {t('gamesPage.addFirstBggGame')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {games.map((game) => (
                        <div key={game.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-lg transition-all relative group">
                            
                            {/* Top section - Cover */}
                            <div className="h-48 bg-slate-100 dark:bg-slate-700 relative">
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">{t('gamesPage.noCover')}</div>
                                )}
                                
                                {/* Invisible overlay to close the menu when clicking outside */}
                                {openMenuId === game.id && (
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                )}

                                {/* Menu button on the cover (top-right corner) */}
                                <div className="absolute top-2 right-2 z-20">
                                    <button 
                                        onClick={(e) => toggleMenu(game.id, e)} 
                                        className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-xl transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openMenuId === game.id && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl py-1 overflow-hidden origin-top-right animate-in fade-in zoom-in-95">
                                            <button 
                                                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                onClick={() => handleDetailsClick(game)}
                                            >
                                                {t('gamesPage.editGame')}
                                            </button>
                                            <button 
                                                className="block w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleDeleteClick(game.id)}
                                            >
                                                {t('gamesPage.removeFromCollection')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom section - Game information */}
                            <div className="p-5 flex-1 flex flex-col cursor-pointer" onClick={() => handleDetailsClick(game)}>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
                                    {game.localTitle || game.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    {t('gamesPage.playersAndTime', { min: game.minPlayers, max: game.maxPlayers, playTime: game.playTime || t('gamesPage.unknownPlayTime') })}
                                </p>
                                
                                {/* Built-in rating system at the bottom of the card */}
                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('gamesPage.yourRating')}</span>
                                    <StarRating t={t} rating={game.rating || 0} onRate={(val) => handleRatingChange(game.id, val)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT MODAL */}
            {selectedGame && (
                <GameModal 
                    game={selectedGame} 
                    onClose={() => setSelectedGame(null)} 
                    onUpdate={handleUpdateGame}
                />
            )}

            {/* ADD NEW GAME MODAL */}
            {isAddModalOpen && (
                <AddGameModal
                    onClose={() => setIsAddModalOpen(false)}
                    onGameAdded={handleAddGameSubmit}
                />
            )}

        </div>
    )
}

export default GamesPage;