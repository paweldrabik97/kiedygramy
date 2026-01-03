import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export const createChatConnection = () => {
    return new HubConnectionBuilder()
    .withUrl("/chatHub" , {withCredentials: true})
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();   
}