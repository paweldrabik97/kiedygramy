import React, { useState, useEffect } from 'react';

const CreateSessionModal = ({ onClose, onCreate, games }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    gameId: '' // To będzie ID wybranej gry
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Konwersja gameId na liczbę (HTML select zwraca string)
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
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Nowa Sesja</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tytuł */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tytuł sesji</label>
                <input 
                    type="text" name="title" required
                    value={formData.title} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                    placeholder="Np. Piątkowe granie"
                />
            </div>

            {/* Wybór gry (Lista rozwijana) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gra</label>
                <select 
                    name="gameId"
                    value={formData.gameId} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                >
                    <option value="">-- Wybierz grę --</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>
                            {game.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data i czas */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data i godzina</label>
                <input 
                    type="datetime-local" name="date" 
                    value={formData.date} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                />
            </div>

            {/* Lokalizacja */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lokalizacja</label>
                <input 
                    type="text" name="location"
                    value={formData.location} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                    placeholder="Np. U mnie w domu"
                />
            </div>

            {/* Opis */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis (opcjonalnie)</label>
                <textarea 
                    name="description" rows="3"
                    value={formData.description} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2 border"
                ></textarea>
            </div>

            {/* Przyciski */}
            <div className="flex justify-end gap-3 mt-6">
                <button 
                    type="button" onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                    Anuluj
                </button>
                <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Utwórz sesję
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;