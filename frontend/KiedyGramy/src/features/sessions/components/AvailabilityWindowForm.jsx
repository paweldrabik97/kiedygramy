import React, { useState, useEffect } from 'react';
import { setAvailabilityWindow } from '../services/sessions'; 
import { Button } from '../../../components/ui/Button'; 

export const AvailabilityWindowForm = ({ sessionId, currentSettings, onSuccess }) => {
    
    // Helper: Dodawanie dni do daty
    const addDays = (dateStr, days) => {
        const result = new Date(dateStr);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    };

    // Helper: Dzisiejsza data (string YYYY-MM-DD)
    const getTodayStr = () => new Date().toISOString().split('T')[0];

    const getDefaultState = () => {
        const todayStr = getTodayStr();
        return {
            from: todayStr,
            to: addDays(todayStr, 14),
            deadline: addDays(todayStr, 3)
        };
    };

    const [formState, setFormState] = useState(getDefaultState());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentSettings?.availabilityFrom) {
            setFormState({
                from: currentSettings.availabilityFrom.split('T')[0],
                to: currentSettings.availabilityTo.split('T')[0],
                deadline: currentSettings.availabilityDeadline.split('T')[0]
            });
        }
    }, [currentSettings]);

    // --- POPRAWIONA LOGIKA ---
    const handleFromChange = (e) => {
        const newFromDate = e.target.value;
        
        let nextState = { ...formState, from: newFromDate };

        // Jeśli nowa data startu "przeskoczyła" datę końcową -> przesuń koniec o 14 dni
        if (formState.to && newFromDate > formState.to) {
            nextState.to = addDays(newFromDate, 14);
        }

        setFormState(nextState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await setAvailabilityWindow(sessionId, formState.from, formState.to, formState.deadline);
            if (onSuccess) onSuccess();
            alert("Ramy czasowe zostały zaktualizowane!");
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas zapisywania konfiguracji.");
        } finally {
            setIsLoading(false);
        }
    };

    const isConfigured = !!currentSettings?.availabilityFrom;
    const todayStr = getTodayStr();

    return (
        <div className="mb-8 p-5 bg-primary/5 border border-primary/10 rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-lg">🛠</div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Konfiguracja głosowania</h4>
                    <p className="text-sm text-text-muted mt-1">
                        Jako organizator musisz określić ramy czasowe.
                    </p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Start (Od)</label>
                    <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={formState.from}
                        onChange={handleFromChange} 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Koniec (Do)</label>
                    <input 
                        type="date" 
                        required
                        // Opcjonalnie: Data "Do" nie powinna być wcześniejsza niż data "Od"
                        min={formState.from} 
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={formState.to}
                        onChange={e => setFormState({...formState, to: e.target.value})}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Koniec głosowania</label>
                    <input 
                        type="date" 
                        required
                        min={todayStr} // <--- BLOKADA: Nie można wybrać daty wcześniejszej niż dzisiaj
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={formState.deadline}
                        onChange={e => setFormState({...formState, deadline: e.target.value})}
                    />
                </div>
                <div className="md:col-span-3 mt-2">
                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Zapisywanie...' : (isConfigured ? 'Zaktualizuj ramy czasowe' : 'Uruchom głosowanie')}
                    </Button>
                </div>
            </form>
        </div>
    );
};