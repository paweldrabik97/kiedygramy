import React, { useState, useEffect, useRef } from 'react';

const GameModal = ({ game, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        localTitle: '',
        title: '',
        minPlayers: '',
        maxPlayers: '',
        playTime: ''
    });

    const isMouseDownOnBackdrop = useRef(false);

    useEffect(() => {
        if (game) {
            setFormData({
                localTitle: game.localTitle || game.title || '',
                title: game.title || '',
                minPlayers: game.minPlayers || '',
                maxPlayers: game.maxPlayers || '',
                playTime: game.playTime || ''
            });
            setIsEditing(false); 
        }
    }, [game]);

    if (!game) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        const payload = {
            ...formData,
            minPlayers: parseInt(formData.minPlayers, 10) || 1,
            maxPlayers: parseInt(formData.maxPlayers, 10) || 4
        };
        onUpdate(game.id, payload); 
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            localTitle: game.localTitle || game.title || '',
            title: game.title || '',
            minPlayers: game.minPlayers || '',
            maxPlayers: game.maxPlayers || '',
            playTime: game.playTime || ''
        });
    };
    
    const handleMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            isMouseDownOnBackdrop.current = true;
        }
    };

    const handleMouseUp = (e) => {
        if (isMouseDownOnBackdrop.current && e.target === e.currentTarget) {
            onClose();
        }
        isMouseDownOnBackdrop.current = false;
    };

    // Helper variable to make conditions cleaner
    const isImported = !game.isCustom;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white line-clamp-1 pr-4">
                        {isEditing ? 'Edit Game Details' : (game.localTitle || game.title)}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit game"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {!isEditing && game.imageUrl && (
                        <div className="w-full h-48 mb-6 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            <img src={game.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Name in your collection
                                </label>
                                <input 
                                    type="text" 
                                    name="localTitle"
                                    value={formData.localTitle} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Original Title
                                    </label>
                                    {isImported && <span className="text-[10px] text-violet-500 font-bold uppercase tracking-widest bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded">Locked (BGG)</span>}
                                </div>
                                <input 
                                    type="text" 
                                    name="title"
                                    value={formData.title} 
                                    onChange={handleChange}
                                    disabled={isImported}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Min Players</label>
                                    <input 
                                        type="number" 
                                        name="minPlayers"
                                        min="1"
                                        value={formData.minPlayers} 
                                        onChange={handleChange}
                                        disabled={isImported}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Max Players</label>
                                    <input 
                                        type="number" 
                                        name="maxPlayers"
                                        min="1"
                                        value={formData.maxPlayers} 
                                        onChange={handleChange}
                                        disabled={isImported}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Estimated Play Time (min)
                                </label>
                                <input 
                                    type="text" 
                                    name="playTime"
                                    value={formData.playTime} 
                                    onChange={handleChange}
                                    disabled={isImported}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {game.localTitle && game.localTitle !== game.title && (
                                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Original Title</span>
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{game.title}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Player Count</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {game.minPlayers} - {game.maxPlayers}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Play Time</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {game.playTime ? `${game.playTime} min` : 'Not specified'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Genres</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">
                                    {game.genres?.join(', ') || 'No data'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleCancel}
                                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold dark:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={onClose} 
                            className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GameModal;