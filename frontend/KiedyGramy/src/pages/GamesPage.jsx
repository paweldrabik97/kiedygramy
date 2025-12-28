import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';
// 1. Dodajemy addGame do importów
import { getGames, deleteGame, updateGame, addGame } from '../features/games/services/games.ts';
import GameModal from '../features/games/components/GameModal.jsx';
import AddGameModal from '../features/games/components/AddGameModal.jsx';

const GamesPage = () => {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    
    // Stan dla edycji/szczegółów
    const [selectedGame, setSelectedGame] = useState(null); 
    
    // 2. NOWY STAN: Czy modal dodawania jest otwarty?
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

    // 3. Otwieranie modala
    const handleNewGame = () => {
        setIsAddModalOpen(true);
    };

    // 4. Obsługa dodawania nowej gry (Logika biznesowa)
    const handleAddGameSubmit = async (newGameData) => {
        try {
            // Wywołujemy API
            const createdGame = await addGame(newGameData);
            
            // Aktualizujemy listę lokalnie (dodajemy nową grę do tablicy)
            // Dzięki temu nie trzeba odświeżać całej listy z serwera
            setGames(prevGames => [...prevGames, createdGame]);
            
            // Zamykamy modal
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Nie udało się dodać gry:", error);
            alert("Wystąpił błąd podczas dodawania gry.");
        }
    };

    const toggleMenu = (id) => {
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
        setIsLoading(true); // Opcjonalnie: Pokaż, że coś się dzieje
        try {
            // 1. Wyślij zapytanie do serwera
            // Załóżmy, że updateGame wysyła PUT/PATCH i zwraca zaktualizowaną grę
            const updatedGame = await updateGame(gameId, newGameData); 
            
            // 2. LOKALNA AKTUALIZACJA STANU (Szybsze niż ponowne pobieranie całości)
            setGames(prevGames =>
                prevGames.map(game => 
                    game.id === gameId ? { ...game, ...newGameData } : game
                )
            );
            // Ustaw selectedGame na nową wersję, żeby podgląd w modalu był poprawny
            setSelectedGame(newGameData); 
        } catch (error) {
            console.error("Błąd zapisu gry:", error);
            alert("Nie udało się zapisać zmian!");
        } finally {
            setOpenMenuId(null);
            setSelectedGame(null);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Ładowanie gier...</div>;
    }
  
    return (
        <div className='z-1 w-full p-6 max-w-7xl mx-auto'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Moje Gry</h1>
                <div className='w-auto'>
                    <PrimaryButton onClick={handleNewGame}>
                        + Dodaj grę
                    </PrimaryButton>
                </div>
            </div>

            <div className='mt-6'>
                {games.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Twoja biblioteka jest pusta.</p>
                        <button onClick={handleNewGame} className="text-primary font-bold hover:underline">Dodaj pierwszą grę</button>
                    </div>
                ) : (
                    <ul>
                        {games.map((game) => (
                            <li key={game.id} className='bg-white dark:bg-gray-800 p-4 my-2 rounded-lg flex justify-between items-center shadow-sm border border-gray-100 dark:border-gray-700'>
                                
                                <div className="flex items-center gap-4">
                                    {/* Opcjonalnie: Miniaturka zdjęcia jeśli masz */}
                                    {game.imageUrl && (
                                        <img src={game.imageUrl} alt="" className="w-10 h-10 rounded object-cover hidden sm:block" />
                                    )}
                                    <div>
                                        <span className="font-bold text-gray-800 dark:text-white block">{game.title}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {game.minPlayers}-{game.maxPlayers} graczy • {game.playTime || '?'} min
                                        </span>
                                    </div>
                                </div>

                                {/* Menu */}
                                <div className="relative">
                                    <button 
                                        onClick={() => toggleMenu(game.id)} 
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    {openMenuId === game.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 py-1">
                                            <button 
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                onClick={() => handleDetailsClick(game)}
                                            >
                                                Szczegóły / Edytuj
                                            </button>
                                            <button 
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleDeleteClick(game.id)}
                                            >
                                                Usuń
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* MODAL EDYCJI (ISTNIEJĄCY) */}
            {selectedGame && (
                <GameModal 
                    game={selectedGame} 
                    onClose={() => setSelectedGame(null)} 
                    onUpdate={handleUpdateGame}
                />
            )}

            {/* 5. MODAL DODAWANIA (NOWY) */}
            {isAddModalOpen && (
                <AddGameModal
                    onClose={() => setIsAddModalOpen(false)}
                    onGameAdded={handleAddGameSubmit} // Tu przekazujemy naszą nową funkcję
                />
            )}

        </div>
    )
}

export default GamesPage