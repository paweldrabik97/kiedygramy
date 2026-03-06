import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { profileApi } from '../../profile/services/profileApi.ts';

const languages = [
    { code: 'pl', name: 'Polski', flagUrl: 'https://flagcdn.com/w40/pl.png' },
    { code: 'en', name: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' }
];

const LanguageSelector = ({ variant = 'default', isLogged = false }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Download current language from i18n and match with our list
    const currentLangCode = (i18n.language || 'pl').substring(0, 2).toLowerCase();
    const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = async (langCode) => {
        // 1. Change language in i18n 
        i18n.changeLanguage(langCode);
        setIsOpen(false);

        // 2. If user is logged in, optionally save preference to backend
        if (isLogged) {
            try {
                await profileApi.changeLanguage({ newLanguage: langCode });
                console.log("Wysłano do API nowy język:", langCode);
            } catch (error) {
                console.error("Nie udało się zapisać języka w bazie", error);
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 transition-colors ${
                    variant === 'landing' 
                    ? 'text-slate-600 hover:text-violet-600 font-medium px-2 py-2' 
                    : 'w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 justify-between'
                }`}
            >
                {variant === 'landing' ? (
                    <>
                        <span className="text-xl">
                            <img src={currentLang.flagUrl} alt={currentLang.name} className="w-6 h-6 rounded-full" />
                        </span>
                        <span className="uppercase text-sm">{currentLang.code}</span>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">
                                <img src={currentLang.flagUrl} alt={currentLang.name} className="w-6 h-6 rounded-full" />
                            </span>
                            <span>{currentLang.name}</span>
                        </div>
                        {/* Arrow Down */}
                        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`absolute z-50 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden ${
                    variant === 'landing' ? 'right-0 w-32' : 'left-0 w-full'
                }`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                                currentLangCode === lang.code ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <span className="text-xl">
                                <img src={lang.flagUrl} alt={lang.name} className="w-6 h-6 rounded-full" />
                            </span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;