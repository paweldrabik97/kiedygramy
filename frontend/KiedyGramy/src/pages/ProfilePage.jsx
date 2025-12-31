import { useEffect, useState } from "react";
import { profileApi } from "../features/profile/services/profileApi";

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [infoMsg, setInfoMsg] = useState(""); // sukces/info
  const [saving, setSaving] = useState(false);

  // 'username' | 'fullName' | 'city' | 'password' | null
  const [editing, setEditing] = useState(null);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const refreshMe = async () => {
    const data = await profileApi.me();
    setMe(data);

    setUsername(data?.username ?? "");
    setFullName(data?.fullName ?? "");
    setCity(data?.city ?? "");
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg("");
      setInfoMsg("");

      try {
        await refreshMe();
      } catch (e) {
        setMe(null);
        setErrorMsg(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const runSave = async (fn, successText) => {

    setSaving(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      await fn();
      await refreshMe();
      setEditing(null);
      setInfoMsg(successText);
    } catch (e) {
      setErrorMsg(e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {loading && (
        <div className="mt-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card p-6 text-base opacity-80 text-center">
          Loading...
        </div>
      )}

      {!loading && (errorMsg || infoMsg) && (
        <div
          className={`mt-10 rounded-2xl border p-5 text-center ${
            errorMsg
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-green-300 bg-green-50 dark:bg-green-900/20"
          }`}
        >
          <div className="text-base font-semibold">
            {errorMsg ? "Błąd" : "Zapisano"}
          </div>
          <div className="text-sm opacity-80 mt-1">
            {errorMsg || infoMsg}
          </div>
        </div>
      )}

      {!loading && me && (
        <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card shadow-xl p-10 mt-10">
          {/* Header w tym samym bloczku */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-36 h-36 rounded-full bg-primary/10 flex items-center justify-center shadow-md">
              <svg
                className="w-20 h-20 text-primary"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
                <path d="M50 5 L20 40 L80 40 Z" />
                <path d="M20 40 L50 85 L80 40" />
                <path d="M20 40 L7 72" />
                <path d="M80 40 L93 72" />
              </svg>
            </div>

            <div className="mt-5 text-3xl font-extrabold font-display text-text-main dark:text-text-inverse">
              {me.username ?? "—"}
            </div>
          </div>

          <h1 className="text-3xl font-bold font-display text-text-main dark:text-text-inverse mb-8 text-center">
            Dane profilu
          </h1>

          <div className="grid gap-6">
            {/* LOGIN */}
            <ProfileFieldCard
              title="Login"
              value={me.username ?? "—"}
              isEditing={editing === "username"}
              disabled={saving}
              editLabel="Zmień login"
              onEdit={() => {
                setInfoMsg("");
                setErrorMsg("");
                setEditing("username");
              }}
              onCancel={() => {
                setUsername(me.username ?? "");
                setEditing(null);
              }}
              onSave={() =>
                runSave(
                  () => profileApi.changeUsername({ newUserName: username.trim() }),
                  "Zmieniono login."
                )
              }
            >
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nowy login"
                disabled={saving}
              />
            </ProfileFieldCard>

            {/* FULL NAME */}
            <ProfileFieldCard
              title="Imię i nazwisko"
              value={me.fullName ?? "—"}
              isEditing={editing === "fullName"}
              disabled={saving}
              editLabel="Zmień nazwę"
              onEdit={() => {
                setInfoMsg("");
                setErrorMsg("");
                setEditing("fullName");
              }}
              onCancel={() => {
                setFullName(me.fullName ?? "");
                setEditing(null);
              }}
              onSave={() =>
                runSave(
                  () => profileApi.changeFullName({ NewFullName: fullName.trim() }),
                  "Zmieniono imię i nazwisko."
                )
              }
            >
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Twoje imię i nazwisko"
                disabled={saving}
              />
            </ProfileFieldCard>

            {/* CITY */}
            <ProfileFieldCard
              title="Miasto"
              value={me.city ?? "—"}
              isEditing={editing === "city"}
              disabled={saving}
              editLabel="Zmień miasto"
              onEdit={() => {
                setInfoMsg("");
                setErrorMsg("");
                setEditing("city");
              }}
              onCancel={() => {
                setCity(me.city ?? "");
                setEditing(null);
              }}
              onSave={() =>
                runSave(
                  () => profileApi.changeCity({ NewCity: city.trim() }),
                  "Zmieniono miasto."
                )
              }
            >
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Twoje miasto"
                disabled={saving}
              />
            </ProfileFieldCard>

            {/* PASSWORD */}
            <ProfileFieldCard
              title="Hasło"
              value="••••••••"
              isEditing={editing === "password"}
              disabled={saving}
              editLabel="Zmień hasło"
              onEdit={() => {
                setInfoMsg("");
                setErrorMsg("");
                setEditing("password");
              }}
              onCancel={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setEditing(null);
              }}
              onSave={() => {
                // Sprawdzenie czy hasła się zgadzają
                if (newPassword !== confirmNewPassword) {
                  setErrorMsg("Nowe hasła muszą być identyczne.");
                  return;
                }
                
                // sprawdzenie czy hasło nie jest puste
                if (!newPassword) {
                    setErrorMsg("Nowe hasło nie może być puste.");
                    return;
                }

                runSave(
                  () =>
                    profileApi.changePassword({
                      currentPassword,
                      newPassword,
                    }),
                  "Zmieniono hasło."
                );
              }}
            >
              <div className="grid gap-3">
                <input
                  type="password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Aktualne hasło"
                  autoComplete="current-password"
                  disabled={saving}
                />
                <input
                  type="password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nowe hasło"
                  autoComplete="new-password"
                  disabled={saving}
                />
                <input
                  type="password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Powtórz nowe hasło"
                  autoComplete="new-password"
                  disabled={saving}
                />
              </div>
            </ProfileFieldCard>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileFieldCard({
  title,
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children,
  editLabel = "Zmień",
  disabled = false,
}) {
  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-wide text-text-muted">{title}</div>
          <div className="mt-2 text-2xl font-bold text-text-main dark:text-text-inverse">
            {value}
          </div>
        </div>

        {!isEditing && (
          <button
            className="shrink-0 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-base font-semibold hover:bg-surface-light dark:hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onEdit}
            disabled={disabled}
          >
            {editLabel}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="mt-6">
          <div className="mb-4">{children}</div>

          <div className="flex gap-2">
            <button
              className="px-6 py-3 rounded-2xl bg-black text-white text-base font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onSave}
              disabled={disabled}
            >
              Zapisz
            </button>
            <button
              className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-base font-semibold hover:bg-surface-light dark:hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onCancel}
              disabled={disabled}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
