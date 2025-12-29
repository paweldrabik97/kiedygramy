import React from "react";
import { useNotifications } from "../contexts/NotificationsContext.jsx";


export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      🔔
      {unreadCount > 0 && (
        <span style={{
          position: "absolute",
          top: -6,
          right: -10,
          background: "red",
          color: "white",
          fontSize: 12,
          padding: "2px 6px",
          borderRadius: 999
        }}>
          {unreadCount}
        </span>
      )}
    </div>
  );
}
