// src/SessionsPage.jsx
import React, { useEffect, useState } from 'react';
import { getSessions, createSession } from '../features/sessions/services/sessions.js';
import { getGames } from '../features/games/services/games.js'; // <-- Importujemy też serwis gier!
import PrimaryButton from '../components/ui/PrimaryButton';
import CreateSessionModal from '../features/sessions/components/CreateSessionModal.jsx';
import { useNavigate } from 'react-router-dom';

const SessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [games, setGames] = useState([]); // Lista gier do wyboru i wyświetlania nazw
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const navigate = useNavigate();

    // Pobieranie danych
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pobieramy sesje i gry równolegle
                const [sessionsData, gamesData] = await Promise.all([
                    getSessions(),
                    getGames()
                ]);
                
                setSessions(sessionsData);
                setGames(gamesData);
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Funkcja pomocnicza: Znajdź nazwę gry po ID
    const getGameTitle = (gameId) => {
        const game = games.find(g => g.id === gameId);
        return game ? game.title : 'Nieznana gra';
    };

    // Obsługa tworzenia sesji
    const handleCreateSession = async (newSessionData) => {
        try {
            console.log("Tworzenie sesji z danymi:", newSessionData);
            await createSession(newSessionData);
            // Po sukcesie odśwież listę sesji
            const updatedSessions = await getSessions();
            setSessions(updatedSessions);
            setIsModalOpen(false); // Zamknij modal
        } catch (error) {
            console.error("Błąd tworzenia sesji:", error);
            alert("Nie udało się utworzyć sesji.");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Ładowanie...</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Moje Sesje</h1>
                <PrimaryButton onClick={() => setIsModalOpen(true)}>
                    + Zaplanuj Sesję
                </PrimaryButton>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Nie masz jeszcze żadnych zaplanowanych sesji.</p>
                    <PrimaryButton onClick={() => setIsModalOpen(true)}>Zaplanuj pierwszą!</PrimaryButton>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <div 
                            key={session.id || Math.random()} // Fallback key jeśli ID brak
                            onClick={() => navigate(`/sessions/${session.id}`)}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    {getGameTitle(session.gameId)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(session.date).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                                {session.title}
                            </h3>
                            
                            
                            
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {session.location || 'Online / Nie podano'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <CreateSessionModal 
                    games={games} // Przekazujemy gry do listy rozwijanej
                    onClose={() => setIsModalOpen(false)} 
                    onCreate={handleCreateSession} 
                />
            )}
        </div>
    );
};

export default SessionsPage;