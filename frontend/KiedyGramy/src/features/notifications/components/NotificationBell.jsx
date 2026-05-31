import React from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../contexts/NotificationsContext.jsx";


export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-white flex items-center justify-center hover:ring-2 hover:ring-primary-light transition-all shadow-md">
        <Bell className="w-5 h-5" />
      </div>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
