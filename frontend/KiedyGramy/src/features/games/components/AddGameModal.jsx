import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchBggGames, fetchWikiTitle } from '../services/games'; // Usunięto getGenres
// ZAKŁADAMY, że masz dostęp do języka użytkownika np. z contextu/hooka:
// import { useAuth } from '../context/AuthContext'; 

const AddGameModal = ({ onClose, onGameAdded }) => {
  // Przykładowe pobranie języka (dostosuj do swojego rozwiązania w aplikacji)
  // const { user } = useAuth();
  // const preferredLanguage = user?.preferredLanguage || 'pl';
  const preferredLanguage = 'pl'; // Na sztywno dla demonstracji

  const [step, setStep] = useState('SEARCH');
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
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

  // Funkcja pobierająca
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

          if (newGames.length < PAGE_SIZE) {
              setHasMore(false);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setIsSearching(false);
      }
  }, []);

  // Debounce
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

  // Stan formularza - Zmodyfikowany (tylko dane potrzebne do UI i ostatecznego requestu)
  const [selectedBggGame, setSelectedBggGame] = useState(null);
  const [localTitle, setLocalTitle] = useState('');

  const handleSelectGame = (bggGame) => {
    setSelectedBggGame(bggGame);
    // Ustawiamy od razu przetłumaczony tytuł (lub oryginalny, jeśli tłumaczenia nie było)
    setLocalTitle(bggGame.displayTitle || bggGame.title); 
    setStep('EDIT');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Budujemy payload zgodny z nowym endpointem backendu.
    // Wysyłamy do backendu informację o wybranej grze z BGG ORAZ preferowany lokalny tytuł gracza.
    const payload = {
      sourceId: selectedBggGame.sourceId,
      localTitle: localTitle,
      // Poniższe dane nie są do edycji, ale mogą być potrzebne backendowi podczas importu
      title: selectedBggGame.title, 
      minPlayers: selectedBggGame.minPlayers,
      maxPlayers: selectedBggGame.maxPlayers,
      playTime: selectedBggGame.playTime,
      imageUrl: selectedBggGame.imageUrl,
      GenreIds: [] //selectedBggGame.genres,
    };

    onGameAdded(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-surface-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {step === 'SEARCH' ? 'Znajdź grę na BGG' : 'Dostosuj swój tytuł'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          
          {/* KROK 1: WYSZUKIWANIE */}
          {step === 'SEARCH' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Wpisz tytuł (np. Catan)..."
                // Poprawka błędu wizualnego nr 2: Usunięcie konfliktów kolorów tekstu i tła
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              
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
                          {/* Wyświetlamy przetłumaczony tytuł */}
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">
                            {game.displayTitle || game.title}
                          </h4>
                          {/* Jeśli oryginalny jest inny, pokazujemy go jako dopisek dla orientacji */}
                          {game.displayTitle && game.displayTitle !== game.title && (
                             <p className="text-[10px] text-slate-400 uppercase tracking-wide">{game.title}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">{game.playTime} • {game.minPlayers}-{game.maxPlayers} graczy</p>
                      </div>
                    </div>
                  );
                })}

                {isSearching && results.length > 0 && <p className="text-center text-sm py-2 text-slate-500">Wczytywanie kolejnych...</p>}
                {!hasMore && results.length > 0 && <p className="text-center text-xs text-slate-400 py-2">To już wszystkie wyniki.</p>}
                
                {!isSearching && results.length === 0 && query.length > 2 && (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 mb-2">Nie znalazłeś gry w bazie BGG?</p>
                        <button 
                            onClick={() => {
                                // Tutaj w przyszłości dodasz przejście do osobnego formularza 'CreateCustomGame'
                                alert("Funkcja dodawania własnej gry wkrótce!"); 
                            }}
                            className="text-sm text-violet-600 dark:text-violet-400 font-bold hover:underline"
                        >
                            Stwórz własną grę ręcznie
                        </button>
                    </div>
                )}
              </div>
            </div>
          )}

          {/* KROK 2: POTWIERDZENIE (Tylko LocalTitle edytowalny) */}
          {step === 'EDIT' && selectedBggGame && (
            <form onSubmit={handleSubmit} className="space-y-6">
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

               {/* Informacja o zablokowanych polach */}
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

               {/* Jedyne edytowalne pole: LocalTitle */}
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

        </div>
      </div>
    </div>
  );
};

export default AddGameModal;