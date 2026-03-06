import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const CreateSessionModal = ({ onClose, onCreate, games }) => {
    const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    gameId: '' // This will be the selected game ID
  });

  const isMouseDownOnBackdrop = useRef(false);

    const handleMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            isMouseDownOnBackdrop.current = true;
        }
    };

    const handleMouseUp = (e) => {
        if (e.target === e.currentTarget && isMouseDownOnBackdrop.current) {
            onClose();
        }
        isMouseDownOnBackdrop.current = false;
    };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
        // Convert gameId to number (HTML select returns string)
    const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        gameId: formData.gameId ? parseInt(formData.gameId) : null
    };
    onCreate(payload);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('featureComponents.sessions.createSessionModal.title')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('featureComponents.sessions.createSessionModal.labels.sessionTitle')}</label>
                <input 
                    type="text" name="title" required
                    value={formData.title} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                    placeholder={t('featureComponents.sessions.createSessionModal.placeholders.sessionTitle')}
                />
            </div>

            {/* Game selection (Dropdown list) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('featureComponents.sessions.createSessionModal.labels.game')}</label>
                <select 
                    name="gameId"
                    value={formData.gameId} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                >
                    <option value="">{t('featureComponents.sessions.createSessionModal.placeholders.selectGame')}</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>
                            {game.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date and time */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('featureComponents.sessions.createSessionModal.labels.dateTime')}</label>
                <input 
                    type="datetime-local" name="date" 
                    value={formData.date} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('featureComponents.sessions.createSessionModal.labels.location')}</label>
                <input 
                    type="text" name="location"
                    value={formData.location} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                    placeholder={t('featureComponents.sessions.createSessionModal.placeholders.location')}
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('featureComponents.sessions.createSessionModal.labels.descriptionOptional')}</label>
                <textarea 
                    name="description" rows="3"
                    value={formData.description} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
                <button 
                    type="button" onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                    {t('featureComponents.sessions.createSessionModal.buttons.cancel')}
                </button>
                <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                    {t('featureComponents.sessions.createSessionModal.buttons.createSession')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;