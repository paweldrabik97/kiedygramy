import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { 
    getSession, getSessionParticipants, inviteUser, respondToSession, 
    getMyAvailability, updateAvailability, getAvailabilitySummary, 
    ParticipantStatus,
    removeUserFromSession
} from '../features/sessions/services/sessions';
import { SessionChat } from '../features/sessions/components/SessionChat.jsx';
import { useTranslation } from 'react-i18next';

// Component imports
import { AvailabilityCalendar } from '../features/sessions/components/AvailabilityCalendar.jsx';
import { AvailabilityWindowForm } from '../features/sessions/components/AvailabilityWindowForm.jsx';
import { GameVotingSection } from '../features/sessions/components/GameVotingSection.jsx';
import { OrganizerGamePicker } from '../features/sessions/components/OrganizerGamePicker.jsx';
import { OrganizerDatePicker } from '../features/sessions/components/OrganizerDatePicker.jsx';

const SessionDetailsPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    
    // --- STATE ---
    const [session, setSession] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('board');
    
    // Inviting
    const [inviteQuery, setInviteQuery] = useState("");
    
    // Availability
    const [myDates, setMyDates] = useState([]); 
    const [summaryDates, setSummaryDates] = useState([]);
    
    // Game selection (UI)
    const [isGamePickerOpen, setIsGamePickerOpen] = useState(false);

    // --- NEW TEAM STATE ---
    const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
    const [isKickMode, setIsKickMode] = useState(false);

    const isOrganizer = session?.ownerId === user?.id;
    const myParticipantData = participants.find(p => p.userId === user?.id);
    const isAccepted = myParticipantData?.status === ParticipantStatus.Accepted;

    // --- DATA LOADING ---
    const fetchData = async () => {
        try {
            const [sData, pData] = await Promise.all([
                getSession(id),
                getSessionParticipants(id)
            ]);
            
            setSession(sData);
            setParticipants(pData);

            const me = pData.find(p => p.userId === user?.id);
            
            if (me?.status === ParticipantStatus.Accepted || sData.ownerId === user?.id) {
                try {
                    const myAvail = await getMyAvailability(id);
                    setMyDates(myAvail.dates.map(d => d.split('T')[0]));
                    
                    const summary = await getAvailabilitySummary(id);
                    setSummaryDates(summary.days || []);
                } catch (err) {
                    console.warn("Failed to fetch availability:", err);
                }
            }

        } catch (error) {
            console.error("Critical session fetch error:", error);
            alert(t('sessionDetails.errors.sessionLoadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- HANDLERS ---

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await inviteUser(id, inviteQuery);
            setInviteQuery("");
            const pData = await getSessionParticipants(id);
            setParticipants(pData);
            alert(t('sessionDetails.inviteSent'));
        } catch (error) {
            alert(t('sessionDetails.errors.inviteUserFailed'));
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
            console.error("Failed to save availability");
        }
    };

    const handleGameSelected = () => {
        setIsGamePickerOpen(false);
        fetchData();
    };

    // --- NEW HANDLERS FOR KICK MODE ---

    const activateKickMode = () => {
        setIsTeamMenuOpen(false); // Close dropdown
        setIsKickMode(true);      // Enable kick mode
    };

    const cancelKickMode = () => {
        setIsKickMode(false);
    };

    const handleKickPlayer = async (participantId, participantName) => {
        if (!window.confirm(t('sessionDetails.kickConfirm', { name: participantName }))) {
            return;
        }

        try {
            // Call the service function here (you need to add it there!)
            await removeUserFromSession(id, participantId);
            
            // Refresh the list
            const pData = await getSessionParticipants(id);
            setParticipants(pData);
            
            // If no one is left after removing a player (unlikely because host exists),
            // or simply for UX, we could disable kick mode, but let's keep it enabled,
            // so multiple users can be removed one after another.
        } catch (error) {
            alert(t('sessionDetails.errors.kickPlayerFailed'));
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center">{t('sessionDetails.loadingSession')}</div>;
    if (!session) return <div className="p-10 text-center">{t('sessionDetails.sessionNotFound')}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
            
            {/* --- HEADER --- */}
            <header className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">{session.title}</h1>
                        <p className="text-text-muted flex flex-wrap items-center gap-3 text-sm">
                            <span>{t('sessionDetails.hostLabel')} <span className="font-semibold text-primary">{session.ownerUserName}</span></span>
                            {session.date && <span>📅 {new Date(session.date).toLocaleDateString()}</span>}
                            {session.location && <span>📍 {session.location}</span>}
                        </p>
                    </div>
                    
                    {!isOrganizer && (
                        <div className="flex gap-2">
                            {myParticipantData?.status === ParticipantStatus.Pending && (
                                <>
                                    <button onClick={() => handleRespond(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-sm transition-all">{t('sessionDetails.respond.accept')}</button>
                                    <button onClick={() => handleRespond(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all">{t('sessionDetails.respond.decline')}</button>
                                </>
                            )}
                            {myParticipantData?.status === ParticipantStatus.Accepted && (
                                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200 flex items-center gap-2">
                                    {t('sessionDetails.respond.acceptedBadge')}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. MAIN COLUMN */}
                {(isAccepted || isOrganizer) ? (
                    <div className="lg:col-span-2 space-y-8">

                        {/* --- TABS --- */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                            <button
                                onClick={() => setActiveTab('board')}
                                className={`flex-1 pb-4 text-center font-bold text-sm transition-colors relative ${
                                    activeTab === 'board' 
                                        ? 'text-primary' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {t('sessionDetails.tabs.board')}
                                {/* Active underline bar */}
                                {activeTab === 'board' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                                )}
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('discussion')}
                                className={`flex-1 pb-4 text-center font-bold text-sm transition-colors relative ${
                                    activeTab === 'discussion' 
                                        ? 'text-primary' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {t('sessionDetails.tabs.discussion')}
                                {activeTab === 'discussion' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                                )}
                            </button>
                        </div>

                        {/* --- TAB-DEPENDENT CONTENT --- */}
                        
                        {activeTab === 'board' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Put everything that was previously in the left column here */}

                                {/* SECTION 0: FINAL DATE PICKER (FOR ORGANIZER) */}
                                {isOrganizer && (
                                    <OrganizerDatePicker 
                                        sessionId={session.id} 
                                        currentFinalDate={session.date} // If needed, prefill field when a date already exists
                                        onSuccess={(newDate) => { 
                                            fetchData(); // Refresh session data to show the new date
                                        }} 
                                    />
                                )}


                                {/* SECTION 1: GAME SELECTION */}
                                <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold font-display text-xl text-slate-900 dark:text-white">{t('sessionDetails.whatToPlayTitle')}</h3>
                                        {isOrganizer && (
                                            <button 
                                                onClick={() => setIsGamePickerOpen(!isGamePickerOpen)}
                                                className="text-sm text-primary font-bold hover:text-primary-hover transition-colors flex items-center gap-1"
                                            >
                                                {isGamePickerOpen ? t('sessionDetails.cancel') : t('sessionDetails.selectGames')}
                                            </button>
                                        )}
                                    </div>

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

                                    {session.games && session.games.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {session.games.map(game => (
                                                <div key={game.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border">
                                                    {game.imageUrl ? (
                                                        <img src={game.imageUrl} className="w-12 h-12 rounded object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">🎲</div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{game.title}</h4>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed rounded-xl">
                                            <p className="text-gray-400">{t('sessionDetails.noGamesYet')}</p>
                                            {isOrganizer && !isGamePickerOpen && (
                                                <p className="text-sm text-primary mt-2 cursor-pointer hover:underline" onClick={() => setIsGamePickerOpen(true)}>
                                                    {t('sessionDetails.clickToSelectByVotes')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* SECTION 2: AVAILABILITY */}
                                <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                                    <AvailabilityCalendar 
                                        session={session}
                                        myDates={myDates}
                                        summaryDates={summaryDates}
                                        participantsCount={participants.length}
                                        onToggleDate={toggleDate}
                                    />
                                </section>

                                {/* SECTION 3: VOTING */}
                                <div className="mt-8">
                                    <GameVotingSection sessionId={id} />
                                </div>
                            </div>
                        ) : (
                            // --- DISCUSSION VIEW ---
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <SessionChat sessionId={id} />
                            </div>
                        )}

                    </div>
                ) : (
                    /* VIEW FOR UNDECIDED USERS */
                    <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center h-fit">
                        <div className="text-5xl mb-4">👋</div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('sessionDetails.undecided.title')}</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            {t('sessionDetails.undecided.description')}
                        </p>
                        <Button onClick={() => handleRespond(true)} className="w-full sm:w-auto text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all">
                            {t('sessionDetails.undecided.cta')}
                        </Button>
                    </div>
                )}
                
                


                {/* 2. SIDEBAR COLUMN - PARTICIPANTS */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
                        {/* TEAM SECTION HEADER */}
                        <div className="flex items-center justify-between mb-4 relative">
                            <h3 className="font-bold font-display text-lg text-slate-900 dark:text-white">{t('sessionDetails.teamTitle', { count: participants.length })}</h3>
                            
                            {/* --- ORGANIZER MENU (3 DOTS / CANCEL) --- */}
                            {isOrganizer && (
                                <div className="relative">
                                    {isKickMode ? (
                                        <button 
                                            onClick={cancelKickMode}
                                            className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full transition-colors"
                                        >
                                            {t('sessionDetails.cancelButton')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setIsTeamMenuOpen(!isTeamMenuOpen)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                        </button>
                                    )}

                                    {/* DROPDOWN MENU */}
                                    {isTeamMenuOpen && !isKickMode && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-20 overflow-hidden">
                                            <button 
                                                onClick={activateKickMode}
                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                                                {t('sessionDetails.removePlayerFromSession')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                            {p.role === 1 && <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider">{t('sessionDetails.organizer')}</span>}
                                        </div>
                                    </div>

                                    {/* --- STATUS OR KICK-BUTTON DISPLAY LOGIC --- */}
                                    {isKickMode && p.userId !== user.id ? (
                                        // KICK MODE: Show button (unless it's me)
                                        <button 
                                            onClick={() => handleKickPlayer(p.userId, p.userName)}
                                            className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-colors shadow-sm"
                                        >
                                            {t('sessionDetails.removeButton')}
                                        </button>
                                    ) : (
                                        // NORMAL MODE: Show status
                                        <span className="text-xs font-bold">
                                            {p.status === ParticipantStatus.Pending && <span className="text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{t('sessionDetails.status.pending')}</span>}
                                            {p.status === ParticipantStatus.Accepted && <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">{t('sessionDetails.status.accepted')}</span>}
                                            {p.status === ParticipantStatus.Rejected && <span className="text-red-500 bg-red-100 px-2 py-1 rounded-full">{t('sessionDetails.status.rejected')}</span>}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {isOrganizer && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('sessionDetails.inviteFriend')}</p>
                                <form onSubmit={handleInvite} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder={t('sessionDetails.invitePlaceholder')} 
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