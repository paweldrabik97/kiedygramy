import React, { useState, useEffect } from 'react';
import { setAvailabilityWindow } from '../services/sessions'; 
import { Button } from '../../../components/ui/Button'; 
import { useTranslation } from 'react-i18next';

export const AvailabilityWindowForm = ({ sessionId, currentSettings, onSuccess }) => {
    const { t } = useTranslation();
    
    // Helper: add days to a date
    const addDays = (dateStr, days) => {
        const result = new Date(dateStr);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    };

    // Helper: today's date (YYYY-MM-DD string)
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

    // --- UPDATED LOGIC ---
    const handleFromChange = (e) => {
        const newFromDate = e.target.value;
        
        let nextState = { ...formState, from: newFromDate };

        // If the new start date jumps past the end date, move end by 14 days
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
            alert(t('featureComponents.sessions.availabilityWindowForm.alerts.updated'));
        } catch (error) {
            console.error(error);
            alert(t('featureComponents.sessions.availabilityWindowForm.alerts.saveError'));
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
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{t('featureComponents.sessions.availabilityWindowForm.title')}</h4>
                    <p className="text-sm text-text-muted mt-1">
                        {t('featureComponents.sessions.availabilityWindowForm.description')}
                    </p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">{t('featureComponents.sessions.availabilityWindowForm.labels.startFrom')}</label>
                    <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={formState.from}
                        onChange={handleFromChange} 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">{t('featureComponents.sessions.availabilityWindowForm.labels.endTo')}</label>
                    <input 
                        type="date" 
                        required
                        // Optional: "To" date should not be earlier than "From" date
                        min={formState.from} 
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={formState.to}
                        onChange={e => setFormState({...formState, to: e.target.value})}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">{t('featureComponents.sessions.availabilityWindowForm.labels.votingDeadline')}</label>
                    <input 
                        type="date" 
                        required
                        min={todayStr} // <--- LOCK: cannot choose a date earlier than today
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
                        {isLoading ? t('featureComponents.sessions.availabilityWindowForm.buttons.saving') : (isConfigured ? t('featureComponents.sessions.availabilityWindowForm.buttons.updateWindow') : t('featureComponents.sessions.availabilityWindowForm.buttons.startVoting'))}
                    </Button>
                </div>
            </form>
        </div>
    );
};