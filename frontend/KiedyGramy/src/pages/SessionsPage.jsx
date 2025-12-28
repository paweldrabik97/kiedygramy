// src/SessionsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessions, createSession, getInvitedSessions } from '../features/sessions/services/sessions.js';
import PrimaryButton from '../components/ui/PrimaryButton';
import CreateSessionModal from '../features/sessions/components/CreateSessionModal.jsx';
import { useNavigate } from 'react-router-dom';
import { getGames } from '../features/games/services/games.js';

const SessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [games, setGames] = useState([]);

    // Pobierz listę gier przy montowaniu komponentu
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await getGames();
                setGames(gamesData);
            } catch (error) {
                console.error("Błąd pobierania gier:", error);
            }
        };
        fetchGames();
    }, []);
    
    const navigate = useNavigate();

    // Pobieranie danych
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pobieramy sesje i gry równolegle
                const [sessionsData, invitationsData] = await Promise.all([
                    getSessions(),
                    getInvitedSessions()
                ]);
                
                setSessions(sessionsData);
                setInvitations(invitationsData);
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    

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

            {/* --- SEKCJA 1: ZAPROSZENIA --- */}
            {invitations.length > 0 && (
                <section className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 animate-fade-in-down">
                    <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                        📩 Oczekujące zaproszenia ({invitations.length})
                    </h2>
                    <div className="grid gap-4">
                        {invitations.map(invite => (
                            <Link 
                                key={invite.id} 
                                to={`/sessions/${invite.id}`}
                                className="block bg-white dark:bg-surface-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-yellow-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{invite.title}</h3>
                                    
                                    <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                                        {/* Data */}
                                        {invite.date && (
                                            <span className="flex items-center gap-1">
                                                📅 {new Date(invite.date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {/* Lokalizacja */}
                                        {invite.location && (
                                            <span className="flex items-center gap-1">
                                                📍 {invite.location}
                                            </span>
                                        )}
                                        {/* Liczba uczestników */}
                                        <span className="flex items-center gap-1">
                                            👥 Uczestników: <b>{invite.attendingCount}</b>
                                        </span>
                                    </div>
                                </div>

                                <span className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold text-center transition-colors shadow-sm shadow-primary/30">
                                    Zobacz i odpowiedz
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

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