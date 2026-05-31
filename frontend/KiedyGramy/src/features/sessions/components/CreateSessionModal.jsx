import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CreateSessionModal = ({ onClose, onCreate, games }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        location: '',
        description: '',
        gameId: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({
            ...formData,
            date: new Date(formData.date).toISOString(),
            gameId: formData.gameId ? parseInt(formData.gameId) : null
        });
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors";
    const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1";

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-fadeInUp"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 shadow-sm flex justify-between items-center bg-gradient-to-r from-violet-100/60 to-slate-50 dark:from-violet-900/30 dark:to-slate-800/60">
                    <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                        {t('featureComponents.sessions.createSessionModal.title')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    <form id="create-session-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Title */}
                        <div>
                            <label className={labelClass}>
                                {t('featureComponents.sessions.createSessionModal.labels.sessionTitle')}
                            </label>
                            <input
                                type="text" name="title" required
                                value={formData.title} onChange={handleChange}
                                placeholder={t('featureComponents.sessions.createSessionModal.placeholders.sessionTitle')}
                                className={inputClass}
                            />
                        </div>

                        {/* Game selection */}
                        <div>
                            <label className={labelClass}>
                                {t('featureComponents.sessions.createSessionModal.labels.game')}
                            </label>
                            <select
                                name="gameId"
                                value={formData.gameId} onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">{t('featureComponents.sessions.createSessionModal.placeholders.selectGame')}</option>
                                {games.map(game => (
                                    <option key={game.id} value={game.id}>{game.localTitle || game.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date and time */}
                        <div>
                            <label className={labelClass}>
                                {t('featureComponents.sessions.createSessionModal.labels.dateTime')}
                            </label>
                            <input
                                type="datetime-local" name="date"
                                value={formData.date} onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className={labelClass}>
                                {t('featureComponents.sessions.createSessionModal.labels.location')}
                            </label>
                            <input
                                type="text" name="location"
                                value={formData.location} onChange={handleChange}
                                placeholder={t('featureComponents.sessions.createSessionModal.placeholders.location')}
                                className={inputClass}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>
                                {t('featureComponents.sessions.createSessionModal.labels.descriptionOptional')}
                            </label>
                            <textarea
                                name="description" rows="3"
                                value={formData.description} onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 shadow-[0_-1px_0_rgba(0,0,0,0.04)] bg-slate-50/60 dark:bg-slate-800/60 flex justify-end gap-3">
                    <button
                        type="button" onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        {t('featureComponents.sessions.createSessionModal.buttons.cancel')}
                    </button>
                    <button
                        type="submit" form="create-session-form"
                        className="px-5 py-2.5 bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary-hover hover:to-fuchsia-600 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
                    >
                        {t('featureComponents.sessions.createSessionModal.buttons.createSession')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateSessionModal;
