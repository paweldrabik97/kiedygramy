import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const BASE_URL = (import.meta as any).env.VITE_API_URL || "";

export const createChatConnection = () => {
    return new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/chatHub` , {withCredentials: true})
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();   
}