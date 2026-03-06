// src/SessionsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessions, createSession, getInvitedSessions } from '../features/sessions/services/sessions.js';
import { Button } from '../components/ui/Button.jsx';
import CreateSessionModal from '../features/sessions/components/CreateSessionModal.jsx';
import { useNavigate } from 'react-router-dom';
import { getGames } from '../features/games/services/games.js';
import { useTranslation } from 'react-i18next';

const SessionsPage = () => {
    const { t } = useTranslation();
    const [sessions, setSessions] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [games, setGames] = useState([]);

    // Fetch the list of games when the component mounts
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await getGames();
                setGames(gamesData);
            } catch (error) {
                console.error("Failed to fetch games:", error);
            }
        };
        fetchGames();
    }, []);
    
    const navigate = useNavigate();

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sessions and invitations in parallel
                const [sessionsData, invitationsData] = await Promise.all([
                    getSessions(),
                    getInvitedSessions()
                ]);
                
                setSessions(sessionsData);
                setInvitations(invitationsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    

    // Handle session creation
    const handleCreateSession = async (newSessionData) => {
        try {
            console.log("Tworzenie sesji z danymi:", newSessionData);
            await createSession(newSessionData);
            // After success, refresh the session list
            const updatedSessions = await getSessions();
            setSessions(updatedSessions);
            setIsModalOpen(false); // Close modal
            
            // Redirect to the newly created session
            const createdSession = updatedSessions.find(
                session => session.title === newSessionData.title
            );
            if (createdSession) {
                navigate(`/sessions/${createdSession.id}`);
            }

        } catch (error) {
            console.error("Failed to create session:", error);
            alert(t('sessionsPage.errors.createSessionFailed'));
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">{t('sessionsPage.loading')}</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sessionsPage.title')}</h1>
                <Button onClick={() => setIsModalOpen(true)} variant="primary">
                    {t('sessionsPage.planSession')}
                </Button>
            </div>

            {/* --- SECTION 1: INVITATIONS --- */}
            {invitations.length > 0 && (
                <section className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 animate-fade-in-down">
                    <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                        {t('sessionsPage.pendingInvites', { count: invitations.length })}
                    </h2>
                    <div className="grid gap-4">
                        {invitations.map(invite => (
                            <Link 
                                key={invite.id} 
                                to={`/sessions/${invite.id}`}
                                className="bg-white dark:bg-surface-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-yellow-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{invite.title}</h3>
                                    
                                    <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                                        {/* Date */}
                                        {invite.date && (
                                            <span className="flex items-center gap-1">
                                                📅 {new Date(invite.date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {/* Location */}
                                        {invite.location && (
                                            <span className="flex items-center gap-1">
                                                📍 {invite.location}
                                            </span>
                                        )}
                                        {/* Number of participants */}
                                        <span className="flex items-center gap-1">
                                            <b>{t('sessionsPage.participants', { count: invite.attendingCount })}</b>
                                        </span>
                                    </div>
                                </div>

                                <span className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold text-center transition-colors shadow-sm shadow-primary/30">
                                    {t('sessionsPage.viewAndRespond')}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {sessions.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{t('sessionsPage.noPlannedSessions')}</p>
                    <Button onClick={() => setIsModalOpen(true)} variant="primary">{t('sessionsPage.planFirst')}</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <div 
                            key={session.id || Math.random()} // Fallback key if ID is missing
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
                                {session.location || t('sessionsPage.locationFallback')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <CreateSessionModal 
                    games={games} // Pass games to the dropdown list
                    onClose={() => setIsModalOpen(false)} 
                    onCreate={handleCreateSession} 
                />
            )}
        </div>
    );
};

export default SessionsPage;