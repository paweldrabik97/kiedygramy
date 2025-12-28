// src/features/sessions/components/AvailabilityCalendar.jsx
import React, { useMemo } from 'react';

export const AvailabilityCalendar = ({ 
    session, 
    myDates = [], 
    summaryDates = [], 
    participantsCount = 0, 
    onToggleDate 
}) => {

    // 1. Funkcja pomocnicza (teraz jest schowana wewnątrz komponentu)
    const getDaysArray = (startStr, endStr) => {
        if (!startStr || !endStr) return [];
        const arr = [];
        const dt = new Date(startStr);
        const end = new Date(endStr);
        
        if (isNaN(dt) || isNaN(end) || dt > end) return [];

        while (dt <= end) {
            arr.push(new Date(dt).toISOString().split('T')[0]);
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    };

    // 2. Obliczanie zakresu dat (używamy useMemo dla wydajności)
    const calendarDays = useMemo(() => {
        const defaultStart = new Date();
        const defaultEnd = new Date();
        defaultEnd.setDate(defaultEnd.getDate() + 13); // Domyślnie 14 dni

        const startRange = session?.availabilityFrom || defaultStart.toISOString();
        const endRange = session?.availabilityTo || defaultEnd.toISOString();

        return getDaysArray(startRange, endRange);
    }, [session?.availabilityFrom, session?.availabilityTo]);

    // 3. Tekst nagłówka
    const headerText = session?.availabilityFrom && session?.availabilityTo 
        ? `${new Date(session.availabilityFrom).toLocaleDateString('pl-PL')} - ${new Date(session.availabilityTo).toLocaleDateString('pl-PL')}`
        : "Najbliższe 14 dni";

    return (
        <div className="mt-8">
            {/* Nagłówek sekcji */}
            <div className="flex justify-between items-baseline mb-4">
                <h3 className="font-bold font-display text-xl text-slate-900 dark:text-white">Dostępność</h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {headerText}
                </span>
            </div>

            <p className="text-sm text-text-muted mb-6">
                Kliknij w dzień, aby zaznaczyć swoją dostępność. Pasek na dole kafelka pokazuje popularność terminu.
            </p>

            {/* Grid Kalendarza */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {calendarDays.map((dateStr) => {
                    const dateObj = new Date(dateStr);
                    const monthName = dateObj.toLocaleDateString('pl-PL', { month: 'short' }); 
                    const cleanMonthName = monthName.replace('.', '');
                    const isSelected = myDates.includes(dateStr);
                    // Szukamy liczby głosów dla danego dnia
                    const votes = summaryDates.find(d => d.date.startsWith(dateStr))?.availabilityCount || 0;
                    
                    // Obliczamy szerokość paska (%)
                    const percentage = participantsCount > 0 ? (votes / participantsCount) * 100 : 0;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onToggleDate(dateStr)}
                            className={`
                                relative flex flex-col items-center justify-center p-3 h-24 rounded-2xl border transition-all duration-200 group
                                ${isSelected 
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-primary/50 hover:shadow-md'
                                }
                            `}
                        >
                            {/* Pasek popularności */}
                            <div 
                                className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-b-2xl transition-all duration-500 ease-out"
                                style={{ opacity: votes > 0 ? 1 : 0, width: `${percentage}%` }}
                            ></div>

                            <span className="text-xs font-bold text-text-muted uppercase mb-1">
                                {dateObj.toLocaleDateString('pl-PL', { weekday: 'short' })}
                            </span>
                            <span className={`text-2xl font-display font-bold ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-gray-300'}`}>
                                {dateObj.getDate()}
                            </span>

                            <span className={`text-[10px] uppercase font-bold mt-0.5 ${isSelected ? 'text-primary/80' : 'text-text-muted'}`}>
                                {cleanMonthName}
                            </span>
                            
                            {votes > 0 && (
                                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shadow-sm">
                                    {votes}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            
            {/* Komunikat o pustym kalendarzu (opcjonalnie) */}
            {calendarDays.length === 0 && (
                <div className="text-center p-8 text-text-muted bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Brak zdefiniowanego zakresu dat.
                </div>
            )}
        </div>
    );
};