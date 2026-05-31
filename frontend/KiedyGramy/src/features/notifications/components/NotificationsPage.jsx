import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import { respondToInvite } from "../../sessions/services/invitations.ts";
import { useTranslation } from 'react-i18next';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

function typeLabel(type) {
  if (!type) return "INFO";
  if (String(type).toLowerCase().includes("chat")) return "CHAT";
  if (String(type).toLowerCase().includes("invite")) return "INVITE";
  return "INFO";
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { notifications, markRead } = useNotifications();
  const navigate = useNavigate();

  const [openMenuId, setOpenMenuId] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const onOpen = async (n) => {
    if (!n.isRead) await markRead(n.id);
    if (n.url) navigate(n.url);
  };

  const onMarkAsReadOnly = async (n) => {
    if (!n.isRead) await markRead(n.id);
    setOpenMenuId(null);
  };

  const handleInviteResponse = async (n, accept) => {
  try {
    await respondToInvite(n.sessionId, accept);
    if (!n.isRead) await markRead(n.id);
  } catch (e) {
    console.error(e);
    alert(accept ? t('featureComponents.notifications.page.errors.acceptInviteFailed') : t('featureComponents.notifications.page.errors.rejectInviteFailed'));
  }
};

  return (
    <div className="w-full p-6">
      <div className="max-w-5xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-slate-100 to-white dark:from-slate-800 dark:to-surface-card shadow-md p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center mb-5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-white">
            {t('featureComponents.notifications.page.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('featureComponents.notifications.page.subtitle')}
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('featureComponents.notifications.page.unreadLabel')}{" "}
            <span className="font-semibold text-gray-800 dark:text-white">{unreadCount}</span>
          </div>
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
            {t('featureComponents.notifications.page.empty')}
          </div>
        ) : (
          <div className="grid gap-2.5">
            {notifications.map((n) => {
              const label = typeLabel(n.type);
              const time = formatTime(n.updatedAt);

              const isInvite = label === "INVITE";

              return (
                <div
                  key={n.id}
                  className={[
                    "group relative rounded-xl border bg-gradient-to-b from-slate-100 to-white dark:from-slate-700/50 dark:to-surface-card p-4 shadow-sm transition-all",
                    "hover:-translate-y-[1px] hover:shadow-md",
                    n.isRead ? "border-gray-100 dark:border-gray-700" : "border-gray-200 dark:border-gray-600",
                  ].join(" ")}
                >
                  {/* Clickable area (so menu and buttons can use stopPropagation) */}
                  <button
                    type="button"
                    onClick={() => onOpen(n)}
                    className="w-full text-left"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_auto] gap-3 sm:gap-4 items-start">
                      {/* Type + dot */}
                      <div className="flex items-center gap-3">
                        <span
                          title={n.isRead ? t('featureComponents.notifications.page.read') : t('featureComponents.notifications.page.unread')}
                          className={[
                            "h-2.5 w-2.5 rounded-full flex-shrink-0",
                            n.isRead ? "bg-gray-200 dark:bg-gray-600" : "bg-red-500",
                          ].join(" ")}
                        />
                        <span className="text-xs font-extrabold tracking-widest text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 pr-2 text-center w full">
                        <div
                          className={[
                            "font-semibold truncate",
                            n.isRead ? "text-gray-800 dark:text-gray-100" : "text-red-600 dark:text-red-400",
                          ].join(" ")}
                        >
                          {n.title} {n.count > 1 ? `(${n.count})` : ""}
                        </div>

                        {n.message ? (
                          <div
                            className={[
                              "mt-1 text-sm",
                              n.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-700 dark:text-gray-300 font-medium",
                              "line-clamp-2 break-words",
                            ].join(" ")}
                          >
                            {n.message}
                          </div>
                        ) : (
                          <div className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">
                            {t('featureComponents.notifications.page.noContent')}
                          </div>
                        )}
                      </div>

                      {/* Time */}
                      <div className="text-center sm:text-right text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap w-full">
                        {time}
                      </div>
                    </div>
                  </button>

                  {/* INVITE actions */}
                  {isInvite && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("notification.id", n.id, "notification.sessionId", n.sessionId, "url", n.url);
                          handleInviteResponse(n, true);
                        }}
                        className={[
                          "w-full sm:w-auto sm:min-w-[140px] px-4 py-2 rounded-xl text-sm font-bold",
                          "border border-green-200 dark:border-green-700",
                          "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300",
                          "hover:bg-green-100 dark:hover:bg-green-900/40 hover:-translate-y-[1px] hover:shadow-md",
                          "transition-all",
                        ].join(" ")}
                      >
                        {t('featureComponents.notifications.page.accept')}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInviteResponse(n, false);
                        }}
                        className={[
                          "min-w-[140px] px-4 py-2 rounded-xl text-sm font-bold",
                          "border border-red-200 dark:border-red-700",
                          "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300",
                          "hover:bg-red-100 dark:hover:bg-red-900/40 hover:-translate-y-[1px] hover:shadow-md",
                          "transition-all",
                        ].join(" ")}
                      >
                        {t('featureComponents.notifications.page.reject')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
