import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { 
    getSession, getSessionParticipants, inviteUser, respondToSession, 
    getMyAvailability, updateAvailability, getAvailabilitySummary, 
    ParticipantStatus, updateSessionGame
} from '../features/sessions/services/sessions';
import { getGames } from '../features/games/services/games'; 
import { AvailabilityCalendar } from '../features/sessions/components/AvailabilityCalendar.jsx';
import { AvailabilityWindowForm } from '../features/sessions/components/AvailabilityWindowForm.jsx';

const SessionDetailsPage = () => {
    const { id } = useParams(); // ID sesji z URL
    const { user } = useAuth(); // Zalogowany użytkownik
    
    // --- STANY ---
    const [session, setSession] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Zapraszanie
    const [inviteQuery, setInviteQuery] = useState("");
    
    // Dostępność (Terminy)
    const [myDates, setMyDates] = useState([]); // Moje głosy
    const [summaryDates, setSummaryDates] = useState([]); // Podsumowanie głosów
    
    // Wybór gry (dla organizatora)
    const [myGames, setMyGames] = useState([]); 
    const [isGamePickerOpen, setIsGamePickerOpen] = useState(false);

    
    // Czy jestem organizatorem?
    const isOrganizer = session?.ownerId === user?.id;
    
    // Mój status w sesji
    const myParticipantData = participants.find(p => p.userId === user?.id);
    const isAccepted = myParticipantData?.status === ParticipantStatus.Accepted;

    // --- ŁADOWANIE DANYCH ---
    const fetchData = async () => {
        try {
            // 1. KROK KRYTYCZNY: Pobierz sesję i uczestników
            // Jeśli to się nie uda, nie ma sensu wyświetlać strony
            const [sData, pData] = await Promise.all([
                getSession(id),
                getSessionParticipants(id)
            ]);
            
            setSession(sData);
            setParticipants(pData);

            // 2. KROK OPCJONALNY: Pobierz dostępność
            // Wykonujemy to w osobnych blokach try/catch, żeby błąd 500 z backendu 
            // nie zablokował wyświetlania reszty strony (tytułu, uczestników itp.)
            const me = pData.find(p => p.userId === user?.id);
            
            if (me?.status === ParticipantStatus.Accepted || sData.ownerId === user?.id) {
                
                // Pobieranie moich głosów
                try {
                    const myAvail = await getMyAvailability(id);
                    setMyDates(myAvail.dates.map(d => d.split('T')[0]));
                } catch (err) {
                    console.warn("Nie udało się pobrać Twojej dostępności (może to nowa sesja?)", err);
                }

                // Pobieranie podsumowania (To co teraz rzuca błąd 500)
                try {
                    const summary = await getAvailabilitySummary(id);
                    setSummaryDates(summary.days || []);
                } catch (err) {
                    console.error("Błąd pobierania podsumowania dostępności (Backend 500):", err);
                    // Ustawiamy pustą listę, żeby kalendarz się wyrenderował bez błędów
                    setSummaryDates([]); 
                }
                
                // Pobieranie gier organizatora
                if (sData.ownerId === user?.id) {
                     try {
                        const games = await getGames();
                        setMyGames(games);
                     } catch (err) {
                        console.error("Błąd pobierania gier", err);
                     }
                }
            }

        } catch (error) {
            // Ten catch łapie tylko błędy krytyczne (np. brak sesji / brak internetu)
            console.error("Krytyczny błąd pobierania sesji:", error);
            alert("Nie udało się załadować sesji.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- AKCJE ---

    // 1. Zapraszanie
    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await inviteUser(id, inviteQuery);
            setInviteQuery("");
            // Odśwież uczestników
            const pData = await getSessionParticipants(id);
            setParticipants(pData);
            alert("Zaproszenie wysłane!");
        } catch (error) {
            alert("Nie udało się zaprosić użytkownika.");
        }
    };

    // 2. RSVP (Będę / Nie będę)
    const handleRespond = async (statusBool) => {
        try {
            await respondToSession(id, statusBool);
            fetchData(); // Przeładuj wszystko (zmieni się widok)
        } catch (error) {
            console.error(error);
        }
    };

    // 3. Głosowanie na daty
    const toggleDate = async (dateStr) => {
        // Dodaj lub usuń datę z listy
        const newDates = myDates.includes(dateStr)
            ? myDates.filter(d => d !== dateStr)
            : [...myDates, dateStr];
        
        setMyDates(newDates); // Optimistic UI update
        
        try {
            const datesForBackend = newDates.map(d => `${d}T00:00:00`);
            // Backend oczekuje pełnych dat, więc wysyłamy
            await updateAvailability(id, datesForBackend);
            // Odświeżamy podsumowanie, żeby zobaczyć głosy innych (opcjonalne, można rzadziej)
            const summary = await getAvailabilitySummary(id);
            setSummaryDates(summary.days || []);
        } catch (error) {
            console.error("Błąd zapisu dostępności");
        }
    };

    // 4. Wybór gry (Organizator)
    const handleSelectGame = async (gameId) => {
        try {
            // Tutaj logika aktualizacji sesji. 
            // Ponieważ nie podałeś DTO do update, zakładam że wiesz jak wygląda endpoint PUT
            await updateSessionGame(id, gameId);
            setIsGamePickerOpen(false);
            fetchData(); // Odśwież, żeby pokazać wybraną grę
        } catch (error) {
            alert("Błąd wyboru gry");
        }
    };



    if (loading) return <div className="p-10 text-center">Ładowanie sesji...</div>;
    if (!session) return <div className="p-10 text-center">Nie znaleziono sesji.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
            
            {/* --- NAGŁÓWEK --- */}
            <header className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">{session.title}</h1>
                        <p className="text-text-muted flex items-center gap-2">
                            <span>👑 Organizator: <span className="font-bold text-primary">{session.ownerUserName}</span></span>
                            {session.date && <span>📅 {new Date(session.date).toLocaleDateString()}</span>}
                        </p>
                    </div>
                    {/* Status RSVP dla uczestnika */}
                    {!isOrganizer && (
                        <div className="flex gap-2">
                            {myParticipantData?.status === ParticipantStatus.Pending && (
                                <>
                                    <button onClick={() => handleRespond(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold">Będę!</button>
                                    <button onClick={() => handleRespond(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold">Odpuszczam</button>
                                </>
                            )}
                            {myParticipantData?.status === ParticipantStatus.Accepted && (
                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold border border-green-200">✅ Bierzesz udział</span>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEWA KOLUMNA: Uczestnicy --- */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold font-display text-lg mb-4 text-slate-900 dark:text-white">Drużyna</h3>
                        
                        <ul className="space-y-3 mb-6">
                            {participants.map(p => (
                                <li key={p.userId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {p.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium dark:text-gray-200">{p.userName}</span>
                                    </div>
                                    <span className="text-xs font-bold">
                                        {p.role === 1 && <span className="text-yellow-500 mr-2">👑</span>}
                                        {p.status === ParticipantStatus.Pending && <span className="text-gray-400">?</span>}
                                        {p.status === ParticipantStatus.Accepted && <span className="text-green-500">✓</span>}
                                        {p.status === ParticipantStatus.Rejected && <span className="text-red-500">✕</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {isOrganizer && (
                            <form onSubmit={handleInvite} className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Nick lub email..." 
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                                    value={inviteQuery}
                                    onChange={e => setInviteQuery(e.target.value)}
                                />
                                <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-sm font-bold">+</button>
                            </form>
                        )}
                    </section>
                </div>

                {/* --- PRAWA KOLUMNA: Głosowania (Widoczne tylko dla zaakceptowanych) --- */}
                {(isAccepted || isOrganizer) ? (
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. Wybór GRY */}
                        <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold font-display text-xl text-slate-900 dark:text-white">W co gramy?</h3>
                                {isOrganizer && (
                                    <button 
                                        onClick={() => setIsGamePickerOpen(!isGamePickerOpen)}
                                        className="text-sm text-primary font-bold hover:underline"
                                    >
                                        {isGamePickerOpen ? 'Anuluj' : 'Zmień grę'}
                                    </button>
                                )}
                            </div>

                            {/* Wyświetlanie wybranej gry */}
                            {session.gameTitle ? (
                                <div className="flex items-center gap-4 bg-surface-light dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <div className="text-4xl">🎲</div>
                                    <div>
                                        <h4 className="font-bold text-lg text-primary">{session.gameTitle}</h4>
                                        <p className="text-sm text-text-muted">Gra wybrana przez organizatora</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                    <p className="text-text-muted">Jeszcze nie wybrano gry.</p>
                                </div>
                            )}

                            {/* Lista wyboru (tylko dla organizatora) */}
                            {isOrganizer && isGamePickerOpen && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-down">
                                    {myGames.map(game => (
                                        <button 
                                            key={game.id}
                                            onClick={() => handleSelectGame(game.id)}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                                        >
                                            {game.imageUrl ? (
                                                <img src={game.imageUrl} className="w-10 h-10 object-cover rounded" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                            )}
                                            <span className="font-bold text-sm dark:text-white">{game.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* --- SEKCJA 2: DOSTĘPNOŚĆ --- */}
                        <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            

                            {/* FORMULARZ KONFIGURACJI (Tylko dla Organizatora) */}
                            {isOrganizer && (
                                <AvailabilityWindowForm 
                                    sessionId={session.id}
                                    currentSettings={{
                                        availabilityFrom: session.availabilityFrom, // lub z dużej litery, zależnie co przychodzi z API
                                        availabilityTo: session.availabilityTo,
                                        availabilityDeadline: session.availabilityDeadline
                                    }}
                                    onSuccess={fetchData} // Przekazujemy funkcję odświeżania danych
                                />
                            )}

                            {/* Wybór TERMINU (Kalendarz głosowania) */}
                            <AvailabilityCalendar 
                                session={session}
                                myDates={myDates}
                                summaryDates={summaryDates}
                                participantsCount={participants.length}
                                onToggleDate={toggleDate}
                            />
                        </section>

                    </div>
                ) : (
                    /* Widok dla niezdecydowanych (Oczekujący) */
                    <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-10">
                        <h3 className="text-xl font-bold text-text-muted mb-2">Potwierdź obecność</h3>
                        <p className="text-gray-500 mb-6 text-center max-w-md">
                            Aby zobaczyć propozycje gier i zagłosować na termin, musisz najpierw zaakceptować zaproszenie do tej sesji.
                            
                        </p>
                        <div className="flex gap-4">
                            <Button onClick={() => handleRespond(true)}>Wchodzę w to!</Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SessionDetailsPage;