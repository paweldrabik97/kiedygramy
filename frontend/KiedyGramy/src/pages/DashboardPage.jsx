import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/contexts/AuthContext.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useTranslation } from "react-i18next";
import { getGames, addGame, importBggGame, updateGame, deleteGame } from "../features/games/services/games.ts";
import GameModal from "../features/games/components/GameModal.jsx";
import { getSessions } from "../features/sessions/services/sessions.ts";
import AddGameModal from "../features/games/components/AddGameModal.jsx";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // --- API DATA STATE ---
  const [stats, setStats] = useState({ 
    upcomingSessionsCount: 0, 
    userGamesCount: 0, 
    hoursPlayed: 0 
  });
  const [nextSession, setNextSession] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const fetchOptions = {
            method: 'GET',
            headers: { 
                'Accept': 'application/json'
            }            
        };

        const [statsRes, invitesRes, sessionsData, gamesData] = await Promise.all([
            fetch("/api/dashboard/stats", fetchOptions),
            fetch("/api/invitations/pending", fetchOptions),
            getSessions(),
            getGames()
        ]);

        const statsData = statsRes.ok ? await statsRes.json() : {};
        const invitesData = invitesRes.ok ? await invitesRes.json() : [];

        const now = new Date();
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        const futureSessions = (sessionsData ?? [])
            .filter(s => s.date && new Date(s.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const nextSessionData = futureSessions.find(s => new Date(s.date) <= endOfWeek)
            ?? futureSessions[0]
            ?? null;

        setStats({
            upcomingSessionsCount: futureSessions.length,
            userGamesCount: (gamesData ?? []).length,
            hoursPlayed: statsData.hoursPlayed || 0
        });
        setNextSession(nextSessionData);
        setPendingInvites(invitesData);
        setRecentGames((gamesData ?? []).slice(0, 4));

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
        fetchDashboardData();
    }
  }, [user]);

  // --- HANDLERS ---
  const handleUpdateGame = async (gameId, newGameData) => {
    try {
      await updateGame(gameId, newGameData);
      setRecentGames(prev => prev.map(g => g.id === gameId ? { ...g, ...newGameData } : g));
    } catch (error) {
      console.error("Failed to update game:", error);
    } finally {
      setSelectedGame(null);
    }
  };

  const handleAddGameSubmit = async (newGameData) => {
    try {
      let createdGame;
      if (newGameData.action === 'BGG') {
        createdGame = await importBggGame(newGameData.data);
      } else if (newGameData.action === 'CUSTOM') {
        createdGame = await addGame(newGameData.data);
      }
      if (createdGame) {
        setRecentGames(prev => [...prev, createdGame].slice(0, 4));
      }
      setIsAddGameModalOpen(false);
    } catch (error) {
      console.error("Failed to add game:", error);
    }
  };

  const handleInviteAction = async (inviteId, action) => {
    try {
        const response = await fetch(`/api/invitations/${inviteId}/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
        }
    } catch (err) {
        console.error(err);
    }
  };

  // --- LOADING STATE ---
  if (isLoading) {
      return (
          <div className="w-full h-96 flex items-center justify-center text-primary">
              <div className="flex flex-col items-center gap-4">
                  <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                    <p className="text-text-muted text-sm font-medium">{t("dashboard.loadingData")}</p>
              </div>
          </div>
      );
  }

  // --- MAIN CONTENT (WITHOUT NAVBARS) ---
  return (
    <>
    <div className="w-full max-w-7xl mx-auto space-y-8 p-6">
      
      {/* 1. WELCOME AND STATS SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-main dark:text-white">
            {t("dashboard.welcomeUser", { name: user?.fullName || user?.username })}
          </h2>
          <p className="text-text-muted">{t("dashboard.intro")}</p>
        </div>
        <button
          onClick={() => navigate('/sessions', { state: { openCreate: true } })}
          className="shrink-0 bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary-hover hover:to-fuchsia-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/30 active:scale-95"
        >
          {t("dashboard.newSessionCard.createButton")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
            label={t("dashboard.stats.upcomingSessions")}
            value={stats.upcomingSessionsCount}
            icon={<CalendarIcon className="w-6 h-6 text-primary" />}
            accent="violet"
        />
        <StatCard
            label={t("dashboard.stats.yourGames")}
            value={stats.userGamesCount}
            icon={<CollectionIcon className="w-6 h-6 text-secondary" />}
            accent="amber"
        />
        <StatCard
            label={t("dashboard.stats.hoursPlayed")}
            value={`${stats.hoursPlayed}h`}
            icon={<ClockIcon className="w-6 h-6 text-blue-500" />}
            accent="blue"
        />
      </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* UPCOMING SESSION */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-main dark:text-white">{t("dashboard.upcomingSessionTitle")}</h3>
              <a href="/calendar" className="text-sm text-primary hover:underline font-medium">{t("dashboard.calendarLink")}</a>
            </div>

            {nextSession ? (
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-violet-50 to-white dark:from-violet-900/30 dark:to-surface-card border border-violet-300 dark:border-violet-600/60 shadow-[0_0_24px_rgba(139,92,246,0.25)] dark:shadow-[0_0_28px_rgba(139,92,246,0.35)] p-8 transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(139,92,246,0.4)] dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                  {/* NEXT UP badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    NEXT UP
                  </div>
                  <h4 className="text-xl font-display font-bold text-text-main dark:text-white mb-4 pr-24">
                      {nextSession.title}
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-300">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span className="font-medium">{new Date(nextSession.date).toLocaleString([], { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-300">
                        <MapPinIcon className="w-4 h-4 text-primary" />
                        <span>{nextSession.location || "Online"}</span>
                      </div>
                    </div>
                    <div className="flex items-center sm:justify-end">
                      <Button onClick={() => navigate(`/sessions/${nextSession.id}`)} className="bg-primary hover:bg-primary-hover text-white px-6 w-full sm:w-auto">{t("dashboard.sessionDetails")}</Button>
                    </div>
                  </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-surface-card p-10 rounded-3xl text-center shadow-md border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <CalendarIcon className="w-8 h-8" />
                    </div>
                      <p className="text-text-main dark:text-white font-bold text-lg">{t("dashboard.noSessionsTitle")}</p>
                      <p className="text-text-muted">{t("dashboard.noSessionsSubtitle")}</p>
                </div>
            )}
          </section>

          {/* RECENTLY ADDED GAMES */}
          <section>
                   <h3 className="font-bold text-lg mb-4 text-text-main dark:text-white">{t("dashboard.recentGamesTitle")}</h3>
             {recentGames.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recentGames.map((game) => (
                      <div key={game.id} onClick={() => setSelectedGame(game)} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl relative overflow-hidden group cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all">
                        {game.imageUrl ? (
                            <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                <CollectionIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-text-muted">{game.title}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-bold truncate w-full">{game.title}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* "Add game" placeholder — visible only when fewer than 4 games */}
                    {recentGames.length < 4 && (
                      <div
                        onClick={() => setIsAddGameModalOpen(true)}
                        className="aspect-[2/3] bg-gray-50 dark:bg-surface-card/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-colors text-text-muted group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                          <span className="text-xl font-bold">+</span>
                        </div>
                        <span className="text-xs font-medium">{t("dashboard.addTitle")}</span>
                      </div>
                    )}
                 </div>
             ) : (
                   <p className="text-text-muted text-sm">{t("dashboard.emptyLibrary")}</p>
             )}
          </section>
        </div>

        {/* RIGHT COLUMN (Narrower) */}
        <div className="space-y-8">
          
          {/* INVITATIONS */}
          <div className="bg-white dark:bg-surface-card p-6 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-text-main dark:text-white">{t("dashboard.invitationsTitle")}</h3>
                {pendingInvites.length > 0 && <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingInvites.length}</span>}
            </div>
            
            <div className="space-y-4">
              {pendingInvites.length > 0 ? pendingInvites.map((invite) => (
                <div key={invite.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                   <p className="text-sm font-bold text-primary mb-1 line-clamp-1">{invite.sessionTitle}</p>
                   <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                       {t("dashboard.invitedBy")} <span className="font-medium text-text-main dark:text-white">{invite.hostName}</span>
                   </p>
                   <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => handleInviteAction(invite.id, 'accept')}
                        className="bg-white dark:bg-gray-700 hover:bg-green-500 hover:text-white hover:border-green-500 dark:hover:bg-green-600 text-green-600 border border-gray-200 dark:border-gray-600 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm"
                     >
                       {t("dashboard.accept")}
                     </button>
                     <button 
                        onClick={() => handleInviteAction(invite.id, 'reject')}
                        className="bg-white dark:bg-gray-700 hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:bg-red-600 text-red-500 border border-gray-200 dark:border-gray-600 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm"
                     >
                       {t("dashboard.reject")}
                     </button>
                   </div>
                </div>
              )) : (
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                    <p className="text-text-muted text-sm">{t("dashboard.noInvitations")}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>

    {selectedGame && (
      <GameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onUpdate={handleUpdateGame}
        onDelete={async (id) => { await deleteGame(id); setRecentGames(prev => prev.filter(g => g.id !== id)); setSelectedGame(null); }}
      />
    )}
    {isAddGameModalOpen && (
      <AddGameModal
        onClose={() => setIsAddGameModalOpen(false)}
        onGameAdded={handleAddGameSubmit}
      />
    )}
    </>
  );
};

// --- SUB-COMPONENTS (StatCard and Icons) ---

const STAT_ACCENT = {
  violet: {
    card:   "from-violet-100 to-white dark:from-violet-900/50 dark:to-surface-card",
    iconBg: "bg-violet-200/70 dark:bg-violet-800/50",
  },
  amber: {
    card:   "from-amber-100 to-white dark:from-amber-900/50 dark:to-surface-card",
    iconBg: "bg-amber-200/70 dark:bg-amber-800/50",
  },
  blue: {
    card:   "from-blue-100 to-white dark:from-blue-900/50 dark:to-surface-card",
    iconBg: "bg-blue-200/70 dark:bg-blue-800/50",
  },
};

const StatCard = ({ label, value, icon, accent = "violet" }) => {
  const { card, iconBg } = STAT_ACCENT[accent];
  return (
    <div className={`bg-gradient-to-b ${card} p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700/50 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg duration-300`}>
        <div className={`p-3 ${iconBg} rounded-xl`}>
            {icon}
        </div>
        <div className="flex-1 text-center">
            <p className="text-3xl font-bold font-display text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-text-muted font-medium">{label}</p>
        </div>
    </div>
  );
};

// --- SVG ICONS ---
const CollectionIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const CalendarIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const UsersIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MapPinIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const ClockIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

export default DashboardPage;