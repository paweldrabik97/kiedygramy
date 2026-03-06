import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { getChatMessages, sendChatMessage } from '../services/sessions';
import { createChatConnection } from '../services/chatConnection';
import { useTranslation } from 'react-i18next';

export const SessionChat = ({ sessionId }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Loading messages
    const loadMessages = async (beforeId = null) => {
        try {
            const data = await getChatMessages(sessionId, 20, beforeId);
            
            const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            if (beforeId) {
                setMessages(prev => [...sorted, ...prev]);
            } else {
                setMessages(sorted);
                scrollToBottom();
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages on start
    useEffect(() => {
        loadMessages();
        
        // 2. SignalR connection
        const connection = createChatConnection();

        connection.start()
            .then(() => {
                console.log("Connected to SignalR");
                // Join the "room" for this specific session
                connection.invoke("JoinSessionGroup", Number(sessionId));
            })
            .catch(err => console.error("SignalR Connection Error: ", err));

        // 3. Listen for new messages
        connection.on("NewSessionMessage", (message) => {
            
            // Add new message to the list
            setMessages(prev => [...prev, message]);
            
            // Scroll
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        });

        // Cleanup on component unmount
        return () => {
            connection.off("NewSessionMessage");
            connection.stop();
        };
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageToSend = newMessage.trim();

        setSending(true);
        try {
            await sendChatMessage(sessionId, messageToSend);
            setNewMessage("");
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
            await loadMessages(); 
            scrollToBottom();
        } catch (error) {
            alert(t('featureComponents.sessions.sessionChat.alerts.sendFailed'));
        } finally {
            setSending(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    const handleLoadOlder = () => {
        if (messages.length > 0) {
            loadMessages(messages[0].id);
        }
    };

    // Date formatting function
const formatMessageDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();

    // Check whether it's the same day, month, and year
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    if (isToday) {
        // Time only (e.g. 15:30)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    else if (date.getFullYear() === now.getFullYear()) {
        // Date and time (e.g. 31.12, 15:30)
        return date.toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    }

    // Date and time (e.g. 31.12.2025, 15:30)
    return date.toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric'
    });
};

    if (loading && messages.length === 0) return <div className="p-8 text-center text-gray-400">{t('featureComponents.sessions.sessionChat.loading')}</div>;

    return (
        <div className="flex flex-col h-[600px] bg-white dark:bg-surface-card rounded-b-2xl shadow-sm border border-t-0 border-gray-100 dark:border-gray-700">
            
            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Button to load older messages */}
                <div className="text-center">
                    <button 
                        onClick={handleLoadOlder}
                        className="text-xs text-primary hover:underline pb-2"
                    >
                        {t('featureComponents.sessions.sessionChat.loadOlderMessages')}
                    </button>
                </div>

                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        {t('featureComponents.sessions.sessionChat.emptyChat')}
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = Number(msg.userId) === Number(user?.id);

                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar */}
                            <div className={`w-10 h-10 mt-auto mb-auto rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isMe ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {msg.userName ? msg.userName.charAt(0).toUpperCase() : '?'}
                            </div>

                            {/* Content container */}
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                
                                {/* Metadata row (Nick + Date) */}
                                <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    
                                    {/* Show nick ONLY if it's not me */}
                                    {!isMe && (
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {msg.userName}
                                        </span>
                                    )}

                                    {/* Message date / time */}
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {formatMessageDate(msg.createdAt)}
                                    </span>
                                </div>

                                {/* Message bubble */}
                                <div className={`px-4 py-2 rounded-2xl text-sm break-words ${
                                    isMe 
                                        ? 'bg-primary text-white rounded-tr-none' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('featureComponents.sessions.sessionChat.messagePlaceholder')}
                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button 
                    type="submit" 
                    disabled={sending || !newMessage.trim()}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all font-bold"
                >
                    {sending ? '...' : '➤'}
                </button>
            </form>
        </div>
    );
};