import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../services/NotificationsContext.jsx";
import { respondToInvite } from "../../sessions/services/invitations.ts";

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
    alert(accept ? "Nie udało się zaakceptować zaproszenia." : "Nie udało się odrzucić zaproszenia.");
  }
};

  return (
    <div className="w-full p-6">
      <div className="max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center mb-5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">
            Powiadomienia
          </h1>
          <p className="text-sm text-gray-500">
            Historia Twoich powiadomień (kliknij kafelek, aby otworzyć).
          </p>
          <div className="text-sm text-gray-600">
            Nieprzeczytane:{" "}
            <span className="font-semibold text-gray-800">{unreadCount}</span>
          </div>
        </div>

        {/* Lista */}
        {notifications.length === 0 ? (
          <div className="rounded-xl p-4 border border-dashed border-gray-300 text-gray-600">
            Brak powiadomień.
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
                    "group relative rounded-xl border bg-white p-4 shadow-sm transition-all",
                    "hover:-translate-y-[1px] hover:shadow-md",
                    n.isRead ? "border-gray-100" : "border-gray-200",
                  ].join(" ")}
                >
                  {/* Klikalny obszar (żeby menu + przyciski mogły stopPropagation) */}
                  <button
                    type="button"
                    onClick={() => onOpen(n)}
                    className="w-full text-left"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_auto] gap-3 sm:gap-4 items-start">
                      {/* Typ + kropka */}
                      <div className="flex items-center gap-3">
                        <span
                          title={n.isRead ? "Przeczytane" : "Nieprzeczytane"}
                          className={[
                            "h-2.5 w-2.5 rounded-full flex-shrink-0",
                            n.isRead ? "bg-gray-200" : "bg-red-500",
                          ].join(" ")}
                        />
                        <span className="text-xs font-extrabold tracking-widest text-gray-700">
                          {label}
                        </span>
                      </div>

                      {/* Treść */}
                      <div className="min-w-0 pr-2 text-center w full">
                        <div
                          className={[
                            "font-semibold truncate",
                            n.isRead ? "text-gray-800" : "text-red-600",
                          ].join(" ")}
                        >
                          {n.title} {n.count > 1 ? `(${n.count})` : ""}
                        </div>

                        {n.message ? (
                          <div
                            className={[
                              "mt-1 text-sm",
                              n.isRead ? "text-gray-600" : "text-gray-700 font-medium",
                              "line-clamp-2 break-words",
                            ].join(" ")}
                          >
                            {n.message}
                          </div>
                        ) : (
                          <div className="mt-1 text-sm text-gray-400 italic">
                            (brak treści)
                          </div>
                        )}
                      </div>

                      {/* Czas */}
                      <div className="text-center sm:text-right text-xs sm:text-sm text-gray-500 whitespace-nowrap w-full">
                        {time}
                      </div>
                    </div>
                  </button>
               
                  {/* Akcje INVITE */}
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
                          "border border-green-200",
                          "bg-green-50 text-green-900",
                          "hover:bg-green-100 hover:-translate-y-[1px] hover:shadow-md",
                          "transition-all",
                        ].join(" ")}
                      >
                        Zaakceptuj
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInviteResponse(n, false);
                        }}
                        className={[
                          "min-w-[140px] px-4 py-2 rounded-xl text-sm font-bold",
                          "border border-red-200",
                          "bg-red-50 text-red-900",
                          "hover:bg-red-100 hover:-translate-y-[1px] hover:shadow-md",
                          "transition-all",
                        ].join(" ")}
                      >
                        Odrzuć
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
