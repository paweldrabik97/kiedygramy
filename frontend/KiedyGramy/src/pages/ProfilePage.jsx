import { useEffect, useState } from "react";
import { profileApi } from "../features/profile/services/profileApi";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../features/landing/components/LanguageSelector";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [infoMsg, setInfoMsg] = useState(""); // success/info
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
        setErrorMsg(e?.message ?? t("profile.errors.unknown"));
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
      setErrorMsg(e?.message ?? t("profile.errors.unknown"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {loading && (
        <div className="mt-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card p-6 text-base opacity-80 text-center">
          {t("profile.loading")}
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
            {errorMsg ? t("profile.errorTitle") : t("profile.savedTitle")}
          </div>
          <div className="text-sm opacity-80 mt-1">
            {errorMsg || infoMsg}
          </div>
        </div>
      )}

      {!loading && me && (
        <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card shadow-xl p-10 mt-10">
          {/* Header in the same block */}
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
            {t("profile.profileData")}
          </h1>

          <div className="grid gap-6">
            {/* LOGIN */}
            <ProfileFieldCard
              title={t("profile.fields.login")}
              value={me.username ?? "—"}
              isEditing={editing === "username"}
              disabled={saving}
              editLabel={t("profile.edit.changeLogin")}
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
                  t("profile.success.usernameChanged")
                )
              }
            >
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("profile.placeholders.newLogin")}
                disabled={saving}
              />
            </ProfileFieldCard>

            {/* FULL NAME */}
            <ProfileFieldCard
              title={t("profile.fields.fullName")}
              value={me.fullName ?? "—"}
              isEditing={editing === "fullName"}
              disabled={saving}
              editLabel={t("profile.edit.changeName")}
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
                  t("profile.success.fullNameChanged")
                )
              }
            >
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("profile.placeholders.fullName")}
                disabled={saving}
              />
            </ProfileFieldCard>

            {/* CITY */}
            <ProfileFieldCard
              title={t("profile.fields.city")}
              value={me.city ?? "—"}
              isEditing={editing === "city"}
              disabled={saving}
              editLabel={t("profile.edit.changeCity")}
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
                  t("profile.success.cityChanged")
                )
              }
            >
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("profile.placeholders.city")}
                disabled={saving}
              />
            </ProfileFieldCard>

            {/* PASSWORD */}
            <ProfileFieldCard
              title={t("profile.fields.password")}
              value="••••••••"
              isEditing={editing === "password"}
              disabled={saving}
              editLabel={t("profile.edit.changePassword")}
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
                // Check whether passwords match
                if (newPassword !== confirmNewPassword) {
                  setErrorMsg(t("profile.errors.passwordsMustMatch"));
                  return;
                }
                
                // Check whether password is not empty
                if (!newPassword) {
                    setErrorMsg(t("profile.errors.newPasswordEmpty"));
                    return;
                }

                runSave(
                  () =>
                    profileApi.changePassword({
                      currentPassword,
                      newPassword,
                    }),
                  t("profile.success.passwordChanged")
                );
              }}
            >
              <div className="grid gap-3">
                <input
                  type="password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t("profile.placeholders.currentPassword")}
                  autoComplete="current-password"
                  disabled={saving}
                />
                <input
                  type="password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("profile.placeholders.newPassword")}
                  autoComplete="new-password"
                  disabled={saving}
                />
                <input
                  type="password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-lg bg-white dark:bg-surface-dark"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder={t("profile.placeholders.repeatNewPassword")}
                  autoComplete="new-password"
                  disabled={saving}
                />
              </div>
            </ProfileFieldCard>
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t("profile.fields.language")}
                </label>
                {/* isLogged={true} sprawi, że wywoła się funkcja zapisu do bazy C# */}
                <LanguageSelector variant="default" isLogged={true} />
            </div>
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
  editLabel = "Change",
  disabled = false,
}) {
  const { t } = useTranslation();

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
              {t("profile.save")}
            </button>
            <button
              className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-base font-semibold hover:bg-surface-light dark:hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onCancel}
              disabled={disabled}
            >
              {t("profile.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
