import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionDetails } from '../features/sessions/services/sessions';
import { getGames } from '../features/games/services/games'; 
import PrimaryButton from '../components/ui/PrimaryButton';

const SessionDetailsPage = () => {
    const { id } = useParams(); // Pobieramy ID z paska adresu (np. '12')
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [game, setGame] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // 1. Pobierz szczegóły sesji
                const sessionData = await getSessionDetails(id);
                setSession(sessionData);

                // 2. Jeśli mamy gameId, pobierzmy dane gry (żeby wyświetlić tytuł)
                // (Optymalizacja: w dużej aplikacji pobrałbyś to z cache lub Reduxa)
                if (sessionData.gameId) {
                    const gamesList = await getGames();
                    const foundGame = gamesList.find(g => g.id === sessionData.gameId);
                    setGame(foundGame);
                }

            } catch (err) {
                console.error("Błąd:", err);
                setError("Nie udało się pobrać szczegółów sesji.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center">Ładowanie szczegółów...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!session) return <div className="p-8 text-center">Nie znaleziono sesji.</div>;

    // Formatowanie daty na czytelną
    const formattedDate = new Date(session.date).toLocaleString('pl-PL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="max-w-5xl mx-auto w-full">
            {/* --- NAGŁÓWEK --- */}
            <div className="mb-6">
                <button 
                    onClick={() => navigate('/sessions')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 flex items-center text-sm"
                >
                    ← Wróć do listy
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            {session.title}
                        </h1>
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-semibold">
                            {game ? game.title : `Gra ID: ${session.gameId}`}
                        </span>
                    </div>
                    
                    <div className="flex gap-2">
                         {/* Tu w przyszłości dodamy przyciski Edytuj / Zaproś */}
                        <PrimaryButton onClick={() => alert("Otwieranie okna zapraszania...")}>
                            Zaproś graczy
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* --- LEWA KOLUMNA (Szczegóły) --- */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Karta Informacyjna */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            Informacje
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-8 mt-1 text-gray-400">
                                    {/* Ikona Kalendarza */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex">Kiedy?</p>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200 capitalize">
                                        {formattedDate}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-8 mt-1 text-gray-400">
                                    {/* Ikona Mapy */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex">Gdzie?</p>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        {session.location || 'Nie podano lokalizacji'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-8 mt-1 text-gray-400">
                                     {/* Ikona Opisu */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex">Opis</p>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {session.description || 'Brak dodatkowego opisu.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PRAWA KOLUMNA (Uczestnicy / Status) --- */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            Uczestnicy
                        </h2>
                        {/* Tutaj w następnym kroku pobierzemy listę z endpointu /participants */}
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            Lista uczestników pojawi się tutaj.
                        </p>
                        <button className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 transition-colors text-sm font-medium">
                            Zarządzaj dostępnością
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SessionDetailsPage;