import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchBggGames } from '../services/games'; 
import { useTranslation } from 'react-i18next';

const AddGameModal = ({ onClose, onGameAdded }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState('SEARCH'); // Available steps: 'SEARCH', 'EDIT', 'CUSTOM'
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;
  const observer = useRef();
  const isMouseDownOnBackdrop = useRef(false);

  // Reset when query changes
  useEffect(() => {
     setResults([]);
     setPage(0);
     setHasMore(true);
  }, [query]);

  // Function fetching data from BGG
  const fetchGames = useCallback(async (searchQuery, pageNumber) => {
      if (!searchQuery || searchQuery.length <= 2) return;
      
      setIsSearching(true);
      try {
          const skip = pageNumber * PAGE_SIZE;
          const newGames = await searchBggGames(searchQuery, skip, PAGE_SIZE);
          
          setResults(prev => {
              const existingIds = new Set(prev.map(p => p.sourceId));
              const uniqueNewGames = newGames.filter(g => !existingIds.has(g.sourceId));
              return pageNumber === 0 ? newGames : [...prev, ...uniqueNewGames];
          });

          if (newGames.length < PAGE_SIZE) setHasMore(false);
      } catch (error) {
          console.error(error);
      } finally {
          setIsSearching(false);
      }
  }, []);

  // Debounce for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2 && step === 'SEARCH') {
        fetchGames(query, 0);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, step, fetchGames]);

  // Observer (Infinite Scroll)
  const lastElementRef = useCallback(node => {
    if (isSearching) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && query.length > 2) {
        setPage(prevPage => {
             const nextPage = prevPage + 1;
             fetchGames(query, nextPage);
             return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [isSearching, hasMore, query, fetchGames]);

  // =========================================================================
  // FUNCTIONS HANDLING MODAL CLOSE ON BACKDROP CLICK
  // =========================================================================

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

  // =========================================================================
  // STATE AND FUNCTIONS FOR BGG (STEP: EDIT)
  // =========================================================================
  const [selectedBggGame, setSelectedBggGame] = useState(null);
  const [localTitle, setLocalTitle] = useState('');

  const handleSelectGame = (bggGame) => {
    setSelectedBggGame(bggGame);
    setLocalTitle(bggGame.displayTitle || bggGame.title); 
    setStep('EDIT');
  };

  const handleBggSubmit = (e) => {
    e.preventDefault();
    // Pass DTO compliant with `ImportBggGameDto` to parent
    onGameAdded({
      action: 'BGG',
      data: {
        sourceId: selectedBggGame.sourceId,
        localTitle: localTitle
      }
    });
  };

  // =========================================================================
  // STATE AND FUNCTIONS FOR CUSTOM GAME (STEP: CUSTOM)
  // =========================================================================
  const [customGame, setCustomGame] = useState({
    title: '',
    minPlayers: 1,
    maxPlayers: 4,
    playTime: '',
    imageUrl: '',
    genreIds: [] 
  });

  // Move to custom game form (pre-filling title from search)
  const handleGoToCustom = () => {
    setCustomGame(prev => ({ ...prev, title: query }));
    setStep('CUSTOM');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    // Pass DTO compliant with `CreateCustomGameDto` to parent
    onGameAdded({
      action: 'CUSTOM',
      data: {
        title: customGame.title,
        minPlayers: customGame.minPlayers,
        maxPlayers: customGame.maxPlayers,
        playTime: customGame.playTime || undefined,
        imageUrl: customGame.imageUrl || undefined,
        genreIds: customGame.genreIds // Backend-compatible (currently empty, can be extended)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {step === 'SEARCH' && t('featureComponents.games.addGameModal.headers.search')}
            {step === 'EDIT' && t('featureComponents.games.addGameModal.headers.edit')}
            {step === 'CUSTOM' && t('featureComponents.games.addGameModal.headers.custom')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          
          {/* ======================= STEP 1: SEARCH ======================= */}
          {step === 'SEARCH' && (
            <div className="space-y-4">
              
              {/* Search bar integrated with manual-add button */}
              <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('featureComponents.games.addGameModal.search.placeholder')}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={handleGoToCustom}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 px-4 rounded-xl font-bold transition-colors whitespace-nowrap"
                    title={t('featureComponents.games.addGameModal.search.manualTitle')}
                  >
                    {t('featureComponents.games.addGameModal.search.manualButtonShort')}
                  </button>
              </div>
              
              {isSearching && <p className="text-sm text-slate-500 text-center py-2">{t('featureComponents.games.addGameModal.search.searching')}</p>}
              
              <div className="space-y-2">
                {results.map((game, index) => {
                  const isLast = results.length === index + 1;
                  return (
                    <div 
                      ref={isLast ? lastElementRef : null}
                      key={game.sourceId}
                      onClick={() => handleSelectGame(game)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border border-transparent hover:border-violet-500/20 group"
                    >
                      {game.imageUrl ? (
                          <img src={game.imageUrl} alt={game.title} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                      ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-500">{t('featureComponents.games.addGameModal.search.noImage')}</div>
                      )}
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">
                            {game.displayTitle || game.title}
                          </h4>
                          {game.displayTitle && game.displayTitle !== game.title && (
                             <p className="text-[10px] text-slate-400 uppercase tracking-wide">{game.title}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">{t('featureComponents.games.addGameModal.search.meta', { playTime: game.playTime || '?', min: game.minPlayers, max: game.maxPlayers })}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Button under results (when BGG found something, but not what we need) */}
                {!isSearching && results.length > 0 && (
                   <div className="text-center pt-4 pb-2">
                      <p className="text-xs text-slate-400 mb-2">{t('featureComponents.games.addGameModal.search.resultsNotMatch')}</p>
                       <button 
                          onClick={handleGoToCustom}
                          className="text-sm text-violet-600 dark:text-violet-400 font-bold hover:underline"
                       >
                        {t('featureComponents.games.addGameModal.search.addManually')}
                       </button>
                   </div>
                )}
                
                {/* Message when BGG search returns no results */}
                {!isSearching && results.length === 0 && query.length > 2 && (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 mb-2">{t('featureComponents.games.addGameModal.search.notFound')}</p>
                        <button 
                            onClick={handleGoToCustom}
                            className="text-sm text-violet-600 dark:text-violet-400 font-bold hover:underline"
                        >
                      {t('featureComponents.games.addGameModal.search.addYourself')}
                        </button>
                    </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= STEP 2: CONFIRMATION (BGG) ======================= */}
          {step === 'EDIT' && selectedBggGame && (
            <form onSubmit={handleBggSubmit} className="space-y-6">
               <div className="flex flex-col items-center mb-6">
                   {selectedBggGame.imageUrl ? (
                       <img src={selectedBggGame.imageUrl} alt="Cover" className="h-40 rounded-xl shadow-lg mb-4" />
                   ) : (
                       <div className="h-40 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg mb-4 flex items-center justify-center text-slate-400">{t('featureComponents.games.addGameModal.edit.noCover')}</div>
                   )}
                   <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-bold uppercase tracking-wide">
                     {t('featureComponents.games.addGameModal.edit.bggData')}
                   </span>
               </div>

               <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('featureComponents.games.addGameModal.edit.labels.genres')}</p>
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                         {selectedBggGame.genres?.join(", ") || t('featureComponents.games.addGameModal.edit.noData')}
                       </p>
                   </div>
                   <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('featureComponents.games.addGameModal.edit.labels.playersCount')}</p>
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                         {selectedBggGame.minPlayers} - {selectedBggGame.maxPlayers}
                       </p>
                   </div>
                   <div className="col-span-2">
                       <p className="text-xs text-slate-500 italic">{t('featureComponents.games.addGameModal.edit.importedParamsNote')}</p>
                   </div>
               </div>

               <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                     {t('featureComponents.games.addGameModal.edit.labels.nameInCollection')}
                   </label>
                   <p className="text-xs text-slate-500 mb-2">{t('featureComponents.games.addGameModal.edit.renameHint')}</p>
                   <input 
                        type="text" 
                        value={localTitle}
                        onChange={e => setLocalTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-[#0F172A] dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                        required
                   />
               </div>

               <div className="pt-2 flex gap-3">
                   <button 
                        type="button" 
                        onClick={() => setStep('SEARCH')}
                        className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                   >
                       {t('featureComponents.games.addGameModal.edit.backToResults')}
                   </button>
                   <button 
                        type="submit"
                        className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold dark:shadow-[0_0_20px_rgba(124,58,237,0.4)] dark:hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all"
                   >
                       {t('featureComponents.games.addGameModal.edit.addToLibrary')}
                   </button>
               </div>
            </form>
          )}

          {/* ======================= STEP 3: ADD CUSTOM GAME ======================= */}
          {step === 'CUSTOM' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
               <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                     {t('featureComponents.games.addGameModal.custom.labels.gameTitleRequired')}
                   </label>
                   <input 
                        type="text" 
                        value={customGame.title}
                        onChange={e => setCustomGame({...customGame, title: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                        required
                   />
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('featureComponents.games.addGameModal.custom.labels.minPlayers')}</label>
                       <input 
                            type="number" min="1"
                            value={customGame.minPlayers}
                            onChange={e => setCustomGame({...customGame, minPlayers: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('featureComponents.games.addGameModal.custom.labels.maxPlayers')}</label>
                       <input 
                            type="number" min="1"
                            value={customGame.maxPlayers}
                            onChange={e => setCustomGame({...customGame, maxPlayers: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                       />
                   </div>
               </div>

               <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                     {t('featureComponents.games.addGameModal.custom.labels.estimatedPlayTime')}
                   </label>
                   <input 
                        type="text" 
                        value={customGame.playTime}
                        onChange={e => setCustomGame({...customGame, playTime: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                   />
               </div>

               <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                     {t('featureComponents.games.addGameModal.custom.labels.coverUrlOptional')}
                   </label>
                   <input 
                        type="url" 
                        placeholder="https://..."
                        value={customGame.imageUrl}
                        onChange={e => setCustomGame({...customGame, imageUrl: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                   />
               </div>

               <div className="pt-4 flex gap-3">
                   <button 
                        type="button" 
                        onClick={() => setStep('SEARCH')}
                        className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                   >
                       {t('featureComponents.games.addGameModal.custom.backToSearch')}
                   </button>
                   <button 
                        type="submit"
                        className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all"
                   >
                       {t('featureComponents.games.addGameModal.custom.addManualGame')}
                   </button>
               </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AddGameModal;