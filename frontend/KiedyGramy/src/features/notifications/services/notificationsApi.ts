import { api } from "../../../api";
import type { NotificationDto } from "../types";

export const getMyNotifications = (take = 100) => 
    api<NotificationDto[]>(`/api/notification?take=${take}`, {method: "GET"});

export const getUnreadCount = () => 
    api<number>(`/api/notification/unread-count`, { method: "GET" });

export const markAsRead = (id: number) =>
  api<void>(`/api/notification/${id}/read`, { method: "POST" });