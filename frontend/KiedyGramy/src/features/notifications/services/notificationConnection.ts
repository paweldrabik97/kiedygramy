import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export const createNotificationConnection = () => {
    return new HubConnectionBuilder()
    .withUrl("/notificationHub" , {withCredentials: true})
    .configureLogging(LogLevel.Warning)
    .withAutomaticReconnect()
    .build();   
};