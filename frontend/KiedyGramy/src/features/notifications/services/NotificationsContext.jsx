import React, {createContext, useContext, useEffect, useState} from "react";
import { createNotificationConnection } from "./notificationConnection";
import { getMyNotifications, getUnreadCount, markAsRead } from "./notificationsApi";

const NotificationsContext = createContext(null);

export const useNotifications = () => {
    const ctx = useContext(NotificationsContext);
    if(!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
    return ctx;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const conn = createNotificationConnection();

            conn.on("NotificationUpserted", (n) => {
                setNotifications((prev) => {
                const idx = prev.findIndex(x => x.id === n.id);

    
                if (idx === -1) {
                    return [n, ...prev].sort((a, b) =>
                    a.updatedAt < b.updatedAt ? 1 : -1
                );
            }

        
                const copy = [...prev];
                copy[idx] = n;
                return copy.sort((a, b) =>
                    a.updatedAt < b.updatedAt ? 1 : -1
                );
            });
        });

        conn.on("UnreadCountUpdated", ({ unreadCount }) => {
            setUnreadCount(unreadCount);
        });

        (async () => {
            setNotifications(await getMyNotifications());
            setUnreadCount(await getUnreadCount());
        })();

        conn.start();
        return () => conn.stop();
        }, []);

    const markRead = async (id) => {
        await markAsRead(id);
        setUnreadCount(await getUnreadCount());
        setNotifications(await getMyNotifications());
    };

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, markRead }}>
        {children}
        </NotificationsContext.Provider>
    );
};