import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import PrimaryButton from '../components/ui/PrimaryButton.jsx'
import { getGames, deleteGame, updateGame } from '../services/games.ts'
import { useEffect, useState } from 'react';
import GameModal from '../components/ui/GameModal.jsx';



const GamesPage = () => {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null); // Stan dla modala
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

    if (isLoading) {
        return <div>Loading games...</div>;
    }


    const handleNewGame = () => {
        navigate('/games/new');
    }

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
  
    return (
    <div className='z-1 w-full p-6'>
        <div className='my-4 w-full max-w-xs'>
        <PrimaryButton onClick={handleNewGame}>
          Dodaj swoją grę!
        </PrimaryButton>
        </div>
        <div className='mt-6'>
            <ul>
                {games.map((game) => (
                    <li key={game.id} className='bg-white p-4 my-2 rounded-lg flex justify-between items-center shadow-sm'>

                        {/* Nazwa gry */}
                        <span className="font-medium text-gray-700">{game.title}</span> 

                        {/* Kontener menu (Relative, żeby dropdown był pozycjonowany względem niego) */}
                        <div className="relative">
                            <button 
                                onClick={() => toggleMenu(game.id)} 
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                {/* Ikona 3 kropek (SVG dla lepszego wyglądu) */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu (Tailwind) */}
                            {openMenuId === game.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1">
                                    <button 
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => handleDetailsClick(game)}
                                    >
                                        Szczegóły
                                    </button>
                                    <button 
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        </div>
        <GameModal 
                game={selectedGame} 
                onClose={() => setSelectedGame(null)} 
                onUpdate={handleUpdateGame}
            />
    </div>
    
  )
}

export default GamesPage