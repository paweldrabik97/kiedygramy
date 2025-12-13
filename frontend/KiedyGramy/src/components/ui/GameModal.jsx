import React, { useState, useEffect } from 'react';

// Dodaj prop 'onUpdate' - funkcja, którą wywołamy po kliknięciu Zapisz
const GameModal = ({ game, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    minPlayers: '',
    maxPlayers: ''
  });

  // Kiedy zmienia się gra (otwierasz modal) lub kończysz edycję, 
  // zresetuj formularz do aktualnych danych gry.
  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || '',
        genre: game.genre || '',
        minPlayers: game.minPlayers || '',
        maxPlayers: game.maxPlayers || ''
      });
      setIsEditing(false); // Zawsze otwieraj w trybie podglądu
    }
  }, [game]);

  if (!game) return null;

  // Obsługa pisania w polach input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Obsługa zapisu
  const handleSave = () => {
    onUpdate(game.id, formData); 
    setIsEditing(false);
  };

  // Obsługa anulowania edycji (cofnij zmiany)
  const handleCancel = () => {
    setIsEditing(false);
    // Przywróć stare dane
    setFormData({
        title: game.title,
        genre: game.genre,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- PRZYCISKI GÓRNE (Pokaż ołówek tylko, gdy NIE edytujemy) --- */}
        {!isEditing && (
            <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 left-4 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edytuj"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        )}

        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>


        {/* --- TREŚĆ MODALA (Zmienna w zależności od isEditing) --- */}
        
        <div className="mt-8">
            {isEditing ? (
                // === TRYB EDYCJI ===
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tytuł gry</label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title} 
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-400"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gatunek</label>
                        <input 
                            type="text" 
                            name="genre"
                            value={formData.genre} 
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-400"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Min. graczy</label>
                            <input 
                                type="number" 
                                name="minPlayers"
                                value={formData.minPlayers} 
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-400"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Max. graczy</label>
                            <input 
                                type="number" 
                                name="maxPlayers"
                                value={formData.maxPlayers} 
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2   text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // === TRYB PODGLĄDU (Stary kod) ===
                <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 pr-8">{game.title}</h2>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">
                        ID: {game.id}
                    </span>
                    <div className="space-y-3 text-gray-600">
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold text-gray-700">Gatunek:</span>
                            <span>{game.genre || 'Nie podano'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold text-gray-700">Liczba graczy:</span>
                            <span>{game.minPlayers} - {game.maxPlayers}</span>
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* --- STOPKA Z PRZYCISKAMI --- */}
        <div className="mt-8 flex justify-end gap-3">
            {isEditing ? (
                <>
                    <button 
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Anuluj
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                    >
                        Zapisz
                    </button>
                </>
            ) : (
                <button 
                    onClick={onClose} 
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    Zamknij
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default GameModal;