import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { 
    getSession, getSessionParticipants, inviteUser, respondToSession, 
    getMyAvailability, updateAvailability, getAvailabilitySummary, 
    ParticipantStatus
} from '../features/sessions/services/sessions';

// Import komponentów
import { AvailabilityCalendar } from '../features/sessions/components/AvailabilityCalendar.jsx';
import { AvailabilityWindowForm } from '../features/sessions/components/AvailabilityWindowForm.jsx';
import { GameVotingSection } from '../features/sessions/components/GameVotingSection.jsx';
import { OrganizerGamePicker } from '../features/sessions/components/OrganizerGamePicker.jsx';

const SessionDetailsPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    
    // --- STANY ---
    const [session, setSession] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Zapraszanie
    const [inviteQuery, setInviteQuery] = useState("");
    
    // Dostępność
    const [myDates, setMyDates] = useState([]); 
    const [summaryDates, setSummaryDates] = useState([]);
    
    // Wybór gry (UI)
    const [isGamePickerOpen, setIsGamePickerOpen] = useState(false);

    const isOrganizer = session?.ownerId === user?.id;
    const myParticipantData = participants.find(p => p.userId === user?.id);
    const isAccepted = myParticipantData?.status === ParticipantStatus.Accepted;

    // --- ŁADOWANIE DANYCH ---
    const fetchData = async () => {
        try {
            const [sData, pData] = await Promise.all([
                getSession(id),
                getSessionParticipants(id)
            ]);
            
            setSession(sData);
            setParticipants(pData);

            // Jeśli użytkownik jest uczestnikiem lub organizatorem -> pobierz szczegóły
            const me = pData.find(p => p.userId === user?.id);
            
            if (me?.status === ParticipantStatus.Accepted || sData.ownerId === user?.id) {
                
                // Pobieranie dostępności
                try {
                    const myAvail = await getMyAvailability(id);
                    setMyDates(myAvail.dates.map(d => d.split('T')[0]));
                    
                    const summary = await getAvailabilitySummary(id);
                    setSummaryDates(summary.days || []);
                } catch (err) {
                    console.warn("Błąd pobierania dostępności:", err);
                }
                // Usunąłem stąd pobieranie gier 'myGames' - robi to teraz OrganizerGamePicker
            }

        } catch (error) {
            console.error("Krytyczny błąd pobierania sesji:", error);
            alert("Nie udało się załadować sesji.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- HANDLERY ---

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await inviteUser(id, inviteQuery);
            setInviteQuery("");
            const pData = await getSessionParticipants(id);
            setParticipants(pData);
            alert("Zaproszenie wysłane!");
        } catch (error) {
            alert("Nie udało się zaprosić użytkownika.");
        }
    };

    const handleRespond = async (statusBool) => {
        try {
            await respondToSession(id, statusBool);
            fetchData(); 
        } catch (error) {
            console.error(error);
        }
    };

    const toggleDate = async (dateStr) => {
        const newDates = myDates.includes(dateStr)
            ? myDates.filter(d => d !== dateStr)
            : [...myDates, dateStr];
        
        setMyDates(newDates); 
        
        try {
            const datesForBackend = newDates.map(d => `${d}T00:00:00`);
            await updateAvailability(id, datesForBackend);
            const summary = await getAvailabilitySummary(id);
            setSummaryDates(summary.days || []);
        } catch (error) {
            console.error("Błąd zapisu dostępności");
        }
    };

    const handleGameSelected = () => {
        setIsGamePickerOpen(false);
        fetchData(); // Odśwież sesję, żeby zaktualizować tytuł wybranej gry w nagłówku/karcie
    };

    if (loading) return <div className="p-10 text-center">Ładowanie sesji...</div>;
    if (!session) return <div className="p-10 text-center">Nie znaleziono sesji.</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
            
            {/* --- NAGŁÓWEK --- */}
            <header className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">{session.title}</h1>
                        <p className="text-text-muted flex flex-wrap items-center gap-3 text-sm">
                            <span>👑 Host: <span className="font-semibold text-primary">{session.ownerUserName}</span></span>
                            {session.date && <span>📅 {new Date(session.date).toLocaleDateString()}</span>}
                            {session.location && <span>📍 {session.location}</span>}
                        </p>
                    </div>
                    
                    {/* Przyciski RSVP */}
                    {!isOrganizer && (
                        <div className="flex gap-2">
                            {myParticipantData?.status === ParticipantStatus.Pending && (
                                <>
                                    <button onClick={() => handleRespond(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-sm transition-all">Będę!</button>
                                    <button onClick={() => handleRespond(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all">Odpuszczam</button>
                                </>
                            )}
                            {myParticipantData?.status === ParticipantStatus.Accepted && (
                                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200 flex items-center gap-2">
                                    ✅ Bierzesz udział
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* --- GŁÓWNY GRID (ZAMIANA KOLUMN) --- */}
            {/* Main Content (2 cols) jest teraz pierwszy w kodzie, ale w Gridzie layout jest kontrolowany przez kolejność divów */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. KOLUMNA GŁÓWNA (LEWA - 2/3 szerokości) */}
                {(isAccepted || isOrganizer) ? (
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* --- SEKCJA 1: WYBÓR GRY --- */}
                        <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold font-display text-xl text-slate-900 dark:text-white">W co gramy?</h3>
                                {isOrganizer && (
                                    <button 
                                        onClick={() => setIsGamePickerOpen(!isGamePickerOpen)}
                                        className="text-sm text-primary font-bold hover:text-primary-hover transition-colors flex items-center gap-1"
                                    >
                                        {isGamePickerOpen ? '❌ Anuluj' : '✏️ Wybierz gry'}
                                    </button>
                                )}
                            </div>

                            {/* Komponent wyboru gry (Widoczny po kliknięciu "Zmień") */}
                            {isOrganizer && isGamePickerOpen && (
                                <div className="mb-6">
                                    <OrganizerGamePicker 
                                        sessionId={id}
                                        currentGameIds={session.games ? session.games.map(g => g.id) : []}
                                        onGameSelected={handleGameSelected}
                                        onCancel={() => setIsGamePickerOpen(false)}
                                    />
                                </div>
                            )}

                            {/* Wyświetlanie wybranych gier */}
                            {session.games && session.games.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {session.games.map(game => (
                                        <div key={game.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border">
                                            {/* Obrazek */}
                                            {game.imageUrl ? (
                                                <img src={game.imageUrl} className="w-12 h-12 rounded object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">🎲</div>
                                            )}

                                            {/* Tytuł */}
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800 dark:text-white">{game.title}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-xl">
                                    <p className="text-gray-400">Organizator jeszcze nie wybrał gier.</p>
                                    {isOrganizer && !isGamePickerOpen && (
                                        <p className="text-sm text-primary mt-2 cursor-pointer hover:underline" onClick={() => setIsGamePickerOpen(true)}>
                                            Kliknij tutaj, aby wybrać grę na podstawie głosów
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* --- SEKCJA 2: DOSTĘPNOŚĆ --- */}
                        <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            
                            {/* Formularz konfiguracji okna czasowego */}
                            {isOrganizer && (
                                <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                     <AvailabilityWindowForm 
                                        sessionId={session.id}
                                        currentSettings={{
                                            availabilityFrom: session.availabilityFrom,
                                            availabilityTo: session.availabilityTo,
                                            availabilityDeadline: session.availabilityDeadline
                                        }}
                                        onSuccess={fetchData}
                                    />
                                </div>
                            )}

                            {/* Kalendarz */}
                            <AvailabilityCalendar 
                                session={session}
                                myDates={myDates}
                                summaryDates={summaryDates}
                                participantsCount={participants.length}
                                onToggleDate={toggleDate}
                            />
                        </section>

                        {/* --- SEKCJA 3: GŁOSOWANIE NA GRY (Game Pool) --- */}
                        <div className="mt-8">
                            <GameVotingSection sessionId={id} />
                        </div>

                    </div>
                ) : (
                    /* WIDOK DLA NIEZDECYDOWANYCH */
                    <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center h-fit">
                        <div className="text-5xl mb-4">👋</div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Cześć! Wpadniesz?</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Aby zobaczyć propozycje gier, zagłosować na termin i uczestniczyć w dyskusji, musisz potwierdzić swoją obecność.
                        </p>
                        <Button onClick={() => handleRespond(true)} className="w-full sm:w-auto text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all">
                            Wchodzę w to! 🚀
                        </Button>
                    </div>
                )}


                {/* 2. KOLUMNA BOCZNA (PRAWA - 1/3 szerokości) - UCZESTNICY */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold font-display text-lg text-slate-900 dark:text-white">Drużyna ({participants.length})</h3>
                        </div>
                        
                        <ul className="space-y-3 mb-6">
                            {participants.map(p => (
                                <li key={p.userId} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border
                                            ${p.role === 1 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-primary/10 border-primary/20 text-primary'}
                                        `}>
                                            {p.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                                                {p.userName}
                                            </span>
                                            {p.role === 1 && <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider">Organizator</span>}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold">
                                        {p.status === ParticipantStatus.Pending && <span className="text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Oczekuje</span>}
                                        {p.status === ParticipantStatus.Accepted && <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">Będzie</span>}
                                        {p.status === ParticipantStatus.Rejected && <span className="text-red-500 bg-red-100 px-2 py-1 rounded-full">Odpada</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {isOrganizer && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Zaproś znajomego</p>
                                <form onSubmit={handleInvite} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Nick lub email..." 
                                        className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={inviteQuery}
                                        onChange={e => setInviteQuery(e.target.value)}
                                    />
                                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-all">
                                        +
                                    </button>
                                </form>
                            </div>
                        )}
                    </section>
                </div>

            </div>
        </div>
    );
};

export default SessionDetailsPage;