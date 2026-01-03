import React, { useState, useEffect } from "react";
import { useAuth } from "../features/auth/contexts/AuthContext.jsx";
import { Button } from "../components/ui/Button.jsx";

const DashboardPage = () => {
  const { user } = useAuth();
  
  // --- STATE DANYCH Z API ---
  const [stats, setStats] = useState({ 
    upcomingSessionsCount: 0, 
    userGamesCount: 0, 
    hoursPlayed: 0 
  });
  const [nextSession, setNextSession] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // --- POBIERANIE DANYCH ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const fetchOptions = {
            method: 'GET',
            headers: { 
                'Accept': 'application/json'
            }
            // Dzięki Proxy w Vite i ciasteczkom, nie musisz tu nic więcej dodawać
        };

        const [statsRes, nextSessionRes, invitesRes, gamesRes] = await Promise.all([
            fetch("/api/dashboard/stats", fetchOptions),
            fetch("/api/sessions/next", fetchOptions),
            fetch("/api/invitations/pending", fetchOptions),
            fetch("/api/games/recent", fetchOptions)
        ]);

        // Prosta obsługa błędów - jeśli API nie działa, wstawiamy puste dane/zera
        const statsData = statsRes.ok ? await statsRes.json() : {};
        const nextSessionData = nextSessionRes.ok ? await nextSessionRes.json() : null;
        const invitesData = invitesRes.ok ? await invitesRes.json() : [];
        const gamesData = gamesRes.ok ? await gamesRes.json() : [];

        setStats({
            upcomingSessionsCount: statsData.upcomingSessionsCount || 0,
            userGamesCount: statsData.userGamesCount || 0,
            hoursPlayed: statsData.hoursPlayed || 0
        });
        setNextSession(nextSessionData);
        setPendingInvites(invitesData);
        setRecentGames(gamesData);

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
                  <p className="text-text-muted text-sm font-medium">Ładowanie danych...</p>
              </div>
          </div>
      );
  }

  // --- GLÓWNY CONTENT (BEZ NAVBARÓW) ---
  return (
    // Kontener ogranicza szerokość treści i centruje ją, ale nie ma własnego tła/pasków
    <div className="w-full max-w-7xl mx-auto space-y-8 p-6">
      
      {/* 1. SEKCJA POWITANIA I STATYSTYK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-4 mb-2">
           <h2 className="text-2xl font-display font-bold text-text-main dark:text-white">
               Witaj, {user?.fullName || user?.username}!
           </h2>
           <p className="text-text-muted">Rzućmy okiem na to, co dzieje się w Twoich kampaniach.</p>
        </div>
        
        <StatCard 
            label="Nadchodzące sesje" 
            value={stats.upcomingSessionsCount} 
            icon={<CalendarIcon className="w-6 h-6 text-primary" />} 
        />
        <StatCard 
            label="Twoje gry" 
            value={stats.userGamesCount} 
            icon={<DiceIcon className="w-6 h-6 text-secondary" />} 
        />
        <StatCard 
            label="Rozegrane godziny" 
            value={`${stats.hoursPlayed}h`} 
            icon={<ClockIcon className="w-6 h-6 text-blue-500" />} 
        />

         <div className="bg-gradient-to-br from-primary to-purple-700 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center items-start transform transition-transform hover:scale-[1.02] cursor-pointer">
            <p className="font-bold text-lg mb-1">Nowa Sesja</p>
            <p className="text-white/80 text-xs mb-3">Zaplanuj termin i zaproś graczy</p>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Utwórz
            </button>
        </div>
      </div>

      {/* 2. GŁÓWNY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA KOLUMNA (Szersza) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* NAJBLIŻSZA SESJA */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-main dark:text-white">Najbliższa sesja</h3>
              <a href="/calendar" className="text-sm text-primary hover:underline font-medium">Kalendarz &rarr;</a>
            </div>
            
            {nextSession ? (
                <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-surface-card shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="absolute inset-0 h-32 bg-gray-200">
                    <img 
                        src={nextSession.imageUrl || "https://images.unsplash.com/photo-1610890716171-6b1f9f257a07?q=80&w=600&auto=format&fit=crop"} 
                        alt="Session bg" 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>

                  <div className="relative pt-20 px-6 pb-6">
                    <span className="inline-block bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md mb-2 shadow-sm uppercase tracking-wide">
                      {nextSession.systemName || "System RPG"}
                    </span>
                    <h4 className="text-white text-3xl font-display font-bold mb-1 drop-shadow-md">
                        {nextSession.title}
                    </h4>
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-6 bg-white dark:bg-surface-card/95 dark:backdrop-blur-md rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                       <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-300">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            <span className="font-medium">{new Date(nextSession.scheduledAt).toLocaleString([], {weekday: 'long', day:'numeric', month: 'long', hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-300">
                            <MapPinIcon className="w-4 h-4 text-primary" />
                            <span>{nextSession.location || "Online"}</span>
                          </div>
                       </div>

                       <div className="flex items-center justify-between sm:justify-end gap-4">
                          <Button className="bg-primary hover:bg-primary-hover text-white px-6 w-full sm:w-auto">Szczegóły sesji</Button>
                       </div>
                    </div>
                  </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-surface-card p-10 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <CalendarIcon className="w-8 h-8" />
                    </div>
                    <p className="text-text-main dark:text-white font-bold text-lg">Brak zaplanowanych sesji</p>
                    <p className="text-text-muted mb-6">Wygląda na to, że masz wolny wieczór. Może coś zaplanujesz?</p>
                    <Button variant="outline">Zaplanuj grę</Button>
                </div>
            )}
          </section>

          {/* OSTATNIO DODANE GRY */}
          <section>
             <h3 className="font-bold text-lg mb-4 text-text-main dark:text-white">Ostatnio dodane gry</h3>
             {recentGames.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recentGames.map((game) => (
                      <div key={game.id} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl relative overflow-hidden group cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all">
                        {game.coverUrl ? (
                            <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                <DiceIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-text-muted">{game.title}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-bold truncate w-full">{game.title}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Placeholder "Dodaj grę" */}
                    <div className="aspect-[2/3] bg-gray-50 dark:bg-surface-card/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-colors text-text-muted group">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <span className="text-xl font-bold">+</span>
                        </div>
                        <span className="text-xs font-medium">Dodaj tytuł</span>
                    </div>
                 </div>
             ) : (
                 <p className="text-text-muted text-sm">Twoja biblioteka jest pusta.</p>
             )}
          </section>
        </div>

        {/* PRAWA KOLUMNA (Węższa) */}
        <div className="space-y-8">
          
          {/* ZAPROSZENIA */}
          <div className="bg-white dark:bg-surface-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-text-main dark:text-white">Zaproszenia</h3>
                {pendingInvites.length > 0 && <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingInvites.length}</span>}
            </div>
            
            <div className="space-y-4">
              {pendingInvites.length > 0 ? pendingInvites.map((invite) => (
                <div key={invite.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                   <p className="text-sm font-bold text-primary mb-1 line-clamp-1">{invite.sessionTitle}</p>
                   <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                       Zaprasza: <span className="font-medium text-text-main dark:text-white">{invite.hostName}</span>
                   </p>
                   <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => handleInviteAction(invite.id, 'accept')}
                        className="bg-white dark:bg-gray-700 hover:bg-green-500 hover:text-white hover:border-green-500 dark:hover:bg-green-600 text-green-600 border border-gray-200 dark:border-gray-600 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm"
                     >
                       Akceptuj
                     </button>
                     <button 
                        onClick={() => handleInviteAction(invite.id, 'reject')}
                        className="bg-white dark:bg-gray-700 hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:bg-red-600 text-red-500 border border-gray-200 dark:border-gray-600 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm"
                     >
                       Odrzuć
                     </button>
                   </div>
                </div>
              )) : (
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                    <p className="text-text-muted text-sm">Brak nowych zaproszeń.</p>
                </div>
              )}
            </div>
          </div>

          {/* STATUS SYSTEMU */}
          <div className="bg-gradient-to-b from-primary/5 to-transparent dark:from-white/5 p-6 rounded-3xl border border-primary/10 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-2 text-text-main dark:text-white">Status Systemu</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Wszystkie systemy sprawne</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                  Wersja 1.0.2. Masz pomysł na nową funkcję? <a href="#" className="text-primary hover:underline font-medium">Zgłoś sugestię</a>.
              </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS (StatCard i Ikony) ---

const StatCard = ({ label, value, icon }) => (
    <div className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-text-main dark:text-white">
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold font-display text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-text-muted font-medium">{label}</p>
        </div>
    </div>
);

// --- IKONY SVG ---
const DiceIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>);
const CalendarIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const UsersIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MapPinIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const ClockIcon = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

export default DashboardPage;