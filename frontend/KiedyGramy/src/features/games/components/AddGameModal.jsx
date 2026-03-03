import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchBggGames } from '../services/games'; 

const AddGameModal = ({ onClose, onGameAdded }) => {
  const [step, setStep] = useState('SEARCH'); // Możliwe kroki: 'SEARCH', 'EDIT', 'CUSTOM'
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;
  const observer = useRef();

  // Reset przy zmianie zapytania
  useEffect(() => {
     setResults([]);
     setPage(0);
     setHasMore(true);
  }, [query]);

  // Funkcja pobierająca z BGG
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

  // Debounce dla wyszukiwarki
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
  // STANY I FUNKCJE DLA BGG (KROK: EDIT)
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
    // Przekazujemy do rodzica DTO zgodne z `ImportBggGameDto`
    onGameAdded({
      action: 'BGG',
      data: {
        sourceId: selectedBggGame.sourceId,
        localTitle: localTitle
      }
    });
  };

  // =========================================================================
  // STANY I FUNKCJE DLA WŁASNEJ GRY (KROK: CUSTOM)
  // =========================================================================
  const [customGame, setCustomGame] = useState({
    title: '',
    minPlayers: 1,
    maxPlayers: 4,
    playTime: '',
    imageUrl: '',
    genreIds: [] 
  });

  // Przejście do formularza własnej gry (z przepisaniem tytułu z wyszukiwarki)
  const handleGoToCustom = () => {
    setCustomGame(prev => ({ ...prev, title: query }));
    setStep('CUSTOM');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    // Przekazujemy do rodzica DTO zgodne z `CreateCustomGameDto`
    onGameAdded({
      action: 'CUSTOM',
      data: {
        title: customGame.title,
        minPlayers: customGame.minPlayers,
        maxPlayers: customGame.maxPlayers,
        playTime: customGame.playTime || undefined,
        imageUrl: customGame.imageUrl || undefined,
        genreIds: customGame.genreIds // Zgodnie z backendem (na razie puste, można rozbudować)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {step === 'SEARCH' && 'Znajdź grę na BGG'}
            {step === 'EDIT' && 'Dostosuj swój tytuł'}
            {step === 'CUSTOM' && 'Dodaj własną grę'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          
          {/* ======================= KROK 1: WYSZUKIWANIE ======================= */}
          {step === 'SEARCH' && (
            <div className="space-y-4">
              
              {/* Pasek wyszukiwania zintegrowany z przyciskiem do dodania ręcznego */}
              <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Wpisz tytuł (np. Catan)..."
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={handleGoToCustom}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 px-4 rounded-xl font-bold transition-colors whitespace-nowrap"
                    title="Brak w bazie? Dodaj z palca!"
                  >
                    + Ręcznie
                  </button>
              </div>
              
              {isSearching && <p className="text-sm text-slate-500 text-center py-2">Szukam w bazie BGG...</p>}
              
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
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-500">Brak</div>
                      )}
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">
                            {game.displayTitle || game.title}
                          </h4>
                          {game.displayTitle && game.displayTitle !== game.title && (
                             <p className="text-[10px] text-slate-400 uppercase tracking-wide">{game.title}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">{game.playTime} • {game.minPlayers}-{game.maxPlayers} graczy</p>
                      </div>
                    </div>
                  );
                })}

                {/* Przycisk pod wynikami (gdy BGG coś znalazło, ale nie to, o co nam chodziło) */}
                {!isSearching && results.length > 0 && (
                   <div className="text-center pt-4 pb-2">
                       <p className="text-xs text-slate-400 mb-2">Wyniki powyżej to nie to, czego szukasz?</p>
                       <button 
                          onClick={handleGoToCustom}
                          className="text-sm text-violet-600 dark:text-violet-400 font-bold hover:underline"
                       >
                          Dodaj grę ręcznie
                       </button>
                   </div>
                )}
                
                {/* Komunikat, gdy wyszukiwarka BGG zwraca pusto */}
                {!isSearching && results.length === 0 && query.length > 2 && (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 mb-2">Nie znalazłem takiej gry na BGG.</p>
                        <button 
                            onClick={handleGoToCustom}
                            className="text-sm text-violet-600 dark:text-violet-400 font-bold hover:underline"
                        >
                            Dodaj ją samodzielnie
                        </button>
                    </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= KROK 2: POTWIERDZENIE (BGG) ======================= */}
          {step === 'EDIT' && selectedBggGame && (
            <form onSubmit={handleBggSubmit} className="space-y-6">
               <div className="flex flex-col items-center mb-6">
                   {selectedBggGame.imageUrl ? (
                       <img src={selectedBggGame.imageUrl} alt="Cover" className="h-40 rounded-xl shadow-lg mb-4" />
                   ) : (
                       <div className="h-40 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg mb-4 flex items-center justify-center text-slate-400">Brak Okładki</div>
                   )}
                   <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-bold uppercase tracking-wide">
                     Dane z BoardGameGeek
                   </span>
               </div>

               <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gatunki</p>
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                         {selectedBggGame.genres?.join(", ") || "Brak danych"}
                       </p>
                   </div>
                   <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Liczba graczy</p>
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                         {selectedBggGame.minPlayers} - {selectedBggGame.maxPlayers}
                       </p>
                   </div>
                   <div className="col-span-2">
                       <p className="text-xs text-slate-500 italic">Te parametry zostały automatycznie zaimportowane z bazy i nie można ich zmienić.</p>
                   </div>
               </div>

               <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                     Nazwa w Twojej kolekcji
                   </label>
                   <p className="text-xs text-slate-500 mb-2">Możesz zmienić tytuł na taki, pod jakim znasz tę grę (np. spolszczony).</p>
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
                       Wróć do wyników
                   </button>
                   <button 
                        type="submit"
                        className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold dark:shadow-[0_0_20px_rgba(124,58,237,0.4)] dark:hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all"
                   >
                       Dodaj do biblioteki
                   </button>
               </div>
            </form>
          )}

          {/* ======================= KROK 3: DODAWANIE WŁASNEJ GRY ======================= */}
          {step === 'CUSTOM' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
               <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                     Tytuł Gry *
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
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Min. graczy</label>
                       <input 
                            type="number" min="1"
                            value={customGame.minPlayers}
                            onChange={e => setCustomGame({...customGame, minPlayers: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Max. graczy</label>
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
                     Szacowany czas gry (np. "45-60 min")
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
                     URL okładki (Opcjonalne)
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
                       Wróć do wyszukiwania
                   </button>
                   <button 
                        type="submit"
                        className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all"
                   >
                       Dodaj grę ręcznie
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