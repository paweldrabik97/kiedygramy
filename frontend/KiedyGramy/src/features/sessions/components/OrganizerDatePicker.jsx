import { useState } from 'react';
import { setFinalDate } from '../services/sessions';

export const OrganizerDatePicker = ({ sessionId, currentFinalDate, onSuccess }) => {
  const formatForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const [selectedDate, setSelectedDate] = useState(formatForInput(currentFinalDate));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("Wybierz poprawną datę i godzinę.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const isoDate = new Date(selectedDate).toISOString();
      await setFinalDate(sessionId, isoDate); 

      if (onSuccess) {
        onSuccess(isoDate);
      }
    } catch (err) {
      setError(err.message || "Wystąpił błąd podczas zapisywania terminu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden group transition-colors duration-300">
      
      {/* Glow w tle karty - widoczny tylko w dark mode */}
      <div className="hidden dark:block absolute top-0 right-0 w-32 h-32 bg-violet-600 rounded-full blur-[60px] opacity-10 pointer-events-none transition duration-500 group-hover:opacity-20"></div>

      <div className="flex items-center gap-4 mb-5 relative z-10">
        {/* Ikona: Light -> bg-violet-50 | Dark -> bg-violet-900/50 */}
        <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/50 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-300 border border-transparent dark:border-violet-800/30 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.05)] dark:group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] dark:group-hover:text-violet-100 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 transition-colors">
          Ustal ostateczny termin
        </h3>
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 relative z-10 transition-colors">
        Wybierz datę i godzinę na podstawie wyników ankiety. Wszyscy uczestnicy zostaną o tym poinformowani.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
        <div>
          <label htmlFor="finalDate" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors">
            Data i godzina sesji
          </label>
          <input
            type="datetime-local"
            id="finalDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            // Input: Light -> biało-szary | Dark -> bardzo ciemny granat (#0F172A)
            className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all dark:[color-scheme:dark]"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-300 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-100 dark:border-red-800/50 transition-colors">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedDate}
          className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2
            ${isSubmitting || !selectedDate 
              // Przycisk zablokowany
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 border border-transparent dark:border-slate-700 dark:text-slate-500 cursor-not-allowed' 
              // Przycisk aktywny
              : 'bg-violet-600 text-white hover:bg-violet-700 dark:shadow-[0_0_20px_rgba(124,58,237,0.4)] dark:hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] dark:hover:bg-violet-500'
            }`}
        >
          {isSubmitting ? 'Zapisywanie...' : 'Zatwierdź termin'}
        </button>
      </form>
    </div>
  );
}