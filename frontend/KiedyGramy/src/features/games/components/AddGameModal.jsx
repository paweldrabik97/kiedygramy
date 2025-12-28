import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchBggGames, fetchWikiTitle, getGenres } from '../services/games'; // Zmień ścieżkę jeśli trzeba

const AddGameModal = ({ onClose, onGameAdded }) => {
  const [step, setStep] = useState('SEARCH');
  const [availableGenres, setAvailableGenres] = useState([]); 

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const observer = useRef();

  // 1. Pobieranie gatunków przy starcie
  useEffect(() => {
    getGenres().then(setAvailableGenres).catch(console.error);
  }, []);

  // 2. Reset przy zmianie zapytania
  useEffect(() => {
     setResults([]);
     setPage(0);
     setHasMore(true);
  }, [query]);

  // 3. Funkcja pobierająca (Zoptymalizowana useCallbackiem)
  const fetchGames = useCallback(async (searchQuery, pageNumber) => {
      if (!searchQuery || searchQuery.length <= 2) return;
      
      setIsSearching(true);
      try {
          const skip = pageNumber * PAGE_SIZE;
          console.log(`Pobieram stronę ${pageNumber} (skip: ${skip})`); // Debug w konsoli

          const newGames = await searchBggGames(searchQuery, skip, PAGE_SIZE);
          
          setResults(prev => {
              // Unikamy duplikatów (filtorwanie po sourceId) - ważne przy szybkim przewijaniu!
              const existingIds = new Set(prev.map(p => p.sourceId));
              const uniqueNewGames = newGames.filter(g => !existingIds.has(g.sourceId));
              
              return pageNumber === 0 ? newGames : [...prev, ...uniqueNewGames];
          });

          // Jeśli pobraliśmy mniej niż limit, to koniec listy
          if (newGames.length < PAGE_SIZE) {
              setHasMore(false);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setIsSearching(false);
      }
  }, []);

  // 4. Debounce - inicjuje pierwsze wyszukiwanie
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2 && step === 'SEARCH') {
        fetchGames(query, 0);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, step, fetchGames]);

  // 5. Observer (Infinite Scroll)
  const lastElementRef = useCallback(node => {
    if (isSearching) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && query.length > 2) {
        setPage(prevPage => {
             const nextPage = prevPage + 1;
             fetchGames(query, nextPage); // Pobierz następną stronę
             return nextPage;
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isSearching, hasMore, query, fetchGames]);

  // Stan formularza
  const [formData, setFormData] = useState({
    title: '', genreIds: [], minPlayers: 1, maxPlayers: 4, playTime: '', imageUrl: ''
  });

  const handleSelectGame = async (bggGame) => {
    // 2. Automatyczne mapowanie gatunków (String z BGG -> ID z Bazy)
    // To zadziała tylko jeśli w bazie masz nazwy angielskie, lub identyczne.
    // Jeśli nie, tablica będzie pusta i użytkownik wybierze sam.
    const matchedGenreIds = availableGenres
        .filter(g => bggGame.genres.includes(g.name)) // Proste porównanie nazw
        .map(g => g.id);

    setFormData({
      title: bggGame.title, 
      genreIds: matchedGenreIds, // Wstawiamy znalezione ID
      minPlayers: bggGame.minPlayers,
      maxPlayers: bggGame.maxPlayers,
      playTime: bggGame.playTime,
      imageUrl: bggGame.imageUrl
    });
    
    setStep('EDIT');
    setIsSearching(true);

    // Wikidata logic (bez zmian)
    try {
        const wikiTitle = await fetchWikiTitle(bggGame.sourceId);
        if (wikiTitle && wikiTitle !== bggGame.sourceId) {
             setFormData(prev => ({ ...prev, title: wikiTitle }));
        }
    } catch (e) {} finally { setIsSearching(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGameAdded(formData);
  };

  // Helper do obsługi multiselecta (zaznaczanie wielu gatunków)
  const handleGenreChange = (e) => {
    // HTML Select z 'multiple' zwraca HTMLCollection, trzeba to przerobić
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData({ ...formData, genreIds: selectedOptions });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-surface-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {step === 'SEARCH' ? 'Znajdź grę' : 'Dostosuj i dodaj'}
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
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              
              {isSearching && <p className="text-sm text-text-muted text-center py-2">Szukam w bazie BGG...</p>}
              
              <div className="space-y-2">
                {results.map((game, index) => {
                  if (results.length === index + 1) {
                    return (
                      <div 
                        ref={lastElementRef}
                        key={game.sourceId}
                        onClick={() => handleSelectGame(game)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-light dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-primary/20 group"
                      >
                        {game.imageUrl ? (
                            <img src={game.imageUrl} alt={game.title} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-xs text-gray-500">Brak</div>
                        )}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{game.title}</h4>
                            <p className="text-xs text-text-muted">{game.playTime} • {game.minPlayers}-{game.maxPlayers} graczy</p>
                        </div>
                      
                      </div>
                    );}
                    else {
                      return (
                        <div 
                          key={game.sourceId}
                          onClick={() => handleSelectGame(game)}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-light dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-primary/20 group"
                        >
                          {game.imageUrl ? (
                              <img src={game.imageUrl} alt={game.title} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                          ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-xs text-gray-500">Brak</div>
                          )}
                          <div>
                              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{game.title}</h4>
                              <p className="text-xs text-text-muted">{game.playTime} • {game.minPlayers}-{game.maxPlayers} graczy</p>
                          </div>
                          
                        </div>
                      );
                    }
                  }
                )}

                {isSearching && <p className="text-center text-sm py-2">Ładowanie...</p>}
                {!hasMore && results.length > 0 && <p className="text-center text-xs text-gray-400">To już wszystkie wyniki.</p>}

                
                {!isSearching && results.length === 0 && query.length > 2 && (
                    <div className="text-center py-4">
                        <p className="text-text-muted mb-2">Nie znalazłeś gry?</p>
                        <button 
                            onClick={() => {
                                setFormData({}); // Pusty formularz
                                setStep('EDIT');
                            }}
                            className="text-sm text-primary font-bold hover:underline"
                        >
                            Dodaj ręcznie
                        </button>
                    </div>
                )}
              </div>
            </div>
          )}

          {/* KROK 2: EDYCJA (Tutaj użytkownik zmienia język!) */}
          {step === 'EDIT' && (
            <form onSubmit={handleSubmit} className="space-y-4">
               {/* Podgląd obrazka */}
               {formData.imageUrl && (
                   <div className="flex justify-center mb-4">
                       <img src={formData.imageUrl} alt="Cover" className="h-32 rounded-lg shadow-md" />
                   </div>
               )}

               <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tytuł</label>
                   <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full border rounded p-2"
                   />
               </div>

               <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                       Gatunki (Przytrzymaj Ctrl aby wybrać wiele)
                   </label>
                   <select 
                        multiple
                        value={formData.genreIds}
                        onChange={handleGenreChange}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none h-32"
                   >
                       {availableGenres.map(genre => (
                           <option key={genre.id} value={genre.id}>
                               {genre.name}
                           </option>
                       ))}
                   </select>
                   <p className="text-xs text-gray-400 mt-1">
                       Gatunki z BGG: {results.find(r => r.imageUrl === formData.imageUrl)?.genres.join(", ")}
                   </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-xs font-bold text-text-muted uppercase mb-1">Min. Graczy</label>
                       <input 
                            type="number" 
                            value={formData.minPlayers}
                            onChange={e => setFormData({...formData, minPlayers: parseInt(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-text-muted uppercase mb-1">Max. Graczy</label>
                       <input 
                            type="number" 
                            value={formData.maxPlayers}
                            onChange={e => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                       />
                   </div>
               </div>
               
               

               <div className="pt-4 flex gap-3">
                   <button 
                        type="button" 
                        onClick={() => setStep('SEARCH')}
                        className="flex-1 py-2 text-text-muted font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                   >
                       Wróć
                   </button>
                   <button 
                        type="submit"
                        className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold shadow-lg shadow-primary/30 transition-all"
                   >
                       Zapisz do biblioteki
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