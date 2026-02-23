import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const BASE_URL = (import.meta as any).env.VITE_API_URL || "";

export const createNotificationConnection = () => {
    return new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/notificationHub` , {withCredentials: true})
    .configureLogging(LogLevel.Warning)
    .withAutomaticReconnect()
    .build();   
};