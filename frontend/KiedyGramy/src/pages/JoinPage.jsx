import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/contexts/AuthContext.jsx";
import { joinAsGuest, rejoinAsGuest } from "../features/sessions/services/guest.ts";

const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loginAsGuest } = useAuth();

  const token     = searchParams.get("token");
  const sessionId = searchParams.get("sessionId");

  const [tab, setTab]               = useState("new");
  const [guestName, setGuestName]   = useState("");
  const [guestCode, setGuestCode]   = useState("");
  const [error, setError]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [joinedSession, setJoinedSession] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Auto-join when a logged-in (non-guest) user arrives
  useEffect(() => {
    if (user && !user.isGuest && token) {
      handleJoinAsRegistered();
    }
  }, [user]);

  const handleJoinAsRegistered = async () => {
    setIsLoading(true);
    setError("");
    try {
      await joinAsGuest(token, user.username || "user");
      navigate(sessionId ? `/sessions/${sessionId}` : "/sessions");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleJoinAsGuest = async (e) => {
    e.preventDefault();
    if (guestName.trim().length < 2) {
      setError("Imię musi mieć co najmniej 2 znaki.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await joinAsGuest(token, guestName.trim());
      loginAsGuest(response, guestName.trim());
      setJoinedSession({ ...response.dto, guestCode: response.guestCode });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejoin = async (e) => {
    e.preventDefault();
    if (!guestCode.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      await rejoinAsGuest(guestCode.trim());
      navigate(sessionId ? `/sessions/${sessionId}` : "/sessions");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(joinedSession.guestCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (!token) {
    return (
      <PageShell>
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">Nieprawidłowy link</h2>
          <p className="text-text-muted text-sm">Ten link zaproszenia jest niepoprawny lub wygasł.</p>
        </div>
      </PageShell>
    );
  }

  if (isLoading && user && !user.isGuest) {
    return (
      <PageShell>
        <div className="text-center py-8 text-text-muted text-sm">Dołączam do sesji...</div>
      </PageShell>
    );
  }

  if (joinedSession) {
    return (
      <PageShell>
        <div className="text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-text-main dark:text-white">Dołączyłeś!</h2>
          {joinedSession.title && (
            <p className="text-text-muted text-sm">
              Sesja: <span className="font-semibold text-text-main dark:text-white">{joinedSession.title}</span>
            </p>
          )}
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-2xl p-4">
            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">
              Twój kod gościa — zapisz go!
            </p>
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-violet-100 dark:border-violet-800">
              <span className="font-mono font-bold text-lg text-text-main dark:text-white">{joinedSession.guestCode}</span>
              <button
                onClick={copyCode}
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
              >
                {codeCopied ? "Skopiowano!" : "Kopiuj"}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">Użyj go, żeby wrócić do sesji następnym razem.</p>
          </div>
          <button
            onClick={() => navigate(`/sessions/${joinedSession.id}`)}
            className="w-full bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary-hover hover:to-fuchsia-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 active:scale-95"
          >
            Przejdź do sesji →
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface-card rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-primary to-fuchsia-500 p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-2xl">🎲</div>
            <h1 className="text-2xl font-bold font-display">Dołącz do sesji</h1>
            <p className="text-white/80 mt-1 text-sm">Zostałeś zaproszony na sesję planszówkową</p>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setTab("new")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === "new" ? "bg-white dark:bg-surface-card shadow text-primary" : "text-text-muted"}`}
              >
                Nowy gość
              </button>
              <button
                onClick={() => setTab("returning")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === "returning" ? "bg-white dark:bg-surface-card shadow text-primary" : "text-text-muted"}`}
              >
                Wróć jako gość
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
            )}

            {tab === "new" ? (
              <form onSubmit={handleJoinAsGuest} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Twoje imię</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="np. Marek"
                    minLength={2}
                    maxLength={20}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <p className="text-xs text-text-muted mt-1">Będzie widoczne dla innych uczestników.</p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary-hover hover:to-fuchsia-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 active:scale-95"
                >
                  {isLoading ? "Dołączam..." : "Dołącz do sesji"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRejoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">Twój kod gościa</label>
                  <input
                    type="text"
                    value={guestCode}
                    onChange={(e) => setGuestCode(e.target.value)}
                    placeholder="np. Wolf-4521"
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <p className="text-xs text-text-muted mt-1">Kod dostałeś przy pierwszym dołączeniu.</p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary-hover hover:to-fuchsia-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 active:scale-95"
                >
                  {isLoading ? "Wracam..." : "Wróć do sesji"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PageShell = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
      {children}
    </div>
  </div>
);

export default JoinPage;
