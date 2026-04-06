import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const DiscordCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { discordLogin } = useAuth(); 
    const { t, i18n } = useTranslation();
    
    // Prevent duplicate API calls in React 18 Strict Mode
    const hasCalledApi = useRef(false);

    useEffect(() => {
        // Read ?code=... from query params
        const code = searchParams.get('code');

        if (code && !hasCalledApi.current) {
            hasCalledApi.current = true;
            
            // Use currently active language
            const currentLang = (i18n.language || 'pl').substring(0, 2);

            // Call login from auth context
            discordLogin(code, currentLang)
                .then(() => {
                    console.log("Discord login completed successfully.");
                    navigate('/dashboard');
                })
                .catch((error) => {
                    console.error("Discord login failed:", error);
                    navigate('/login'); 
                });
        } else if (!code) {
            navigate('/login');
        }
    }, [searchParams, discordLogin, navigate, i18n.language]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <div className="w-12 h-12 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold">{t('featureComponents.auth.discordCallback.connectingTitle')}</h2>
            <p className="text-slate-500 mt-2 text-sm">{t('featureComponents.auth.discordCallback.connectingDescription')}</p>
        </div>
    );
};

export default DiscordCallback;