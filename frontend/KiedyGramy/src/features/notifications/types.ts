export type NotificationType = string;

export interface NotificationDto {
  id: number;
  type: NotificationType;
  sessionId?: number | null;
  title: string;
  message?: string | null;
  url?: string | null;
  count: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
}

export interface UnreadCountPayload {
  unreadCount: number;
}