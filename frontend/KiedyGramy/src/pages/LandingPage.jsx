import React from "react";
import DicePhysicsScene from "../features/landing/components/DicePhysicsScene.jsx";

const LandingPage = () => {
  return (
    // 1. GŁÓWNY WRAPPER: relative i overflow-x-hidden
    // To jest kluczowe rozwiązanie problemu paska przewijania.
    // Ucina wszystko, co wystaje na boki (np. powiększone karty).
    <div className="relative w-full overflow-x-hidden">
      
      {/* 2. TŁO: Zmieniono absolute na FIXED */}
      {/* Dzięki temu kostka "podąża" za użytkownikiem podczas przewijania strony, */}
      {/* zamiast zostać na górze i zostawić pustą przestrzeń na dole. */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-auto">
        <DicePhysicsScene />
      </div>

      <header className="sticky top-0 left-0 w-full z-20 pointer-events-none">
        <h2 className="absolute top-4 left-6 text-2xl font-semibold text-blue-800 drop-shadow-lg">
          KiedyGramy
        </h2>
        <button
          className="absolute top-4 right-6 bg-gray-600 bg-opacity-20 hover:bg-opacity-40 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors pointer-events-auto backdrop-blur-sm"
          onClick={() => (window.location.href = "/auth")}
        >
          Zaloguj się / Zarejestruj
        </button>
      </header>

      {/* SEKCJA HERO */}
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 p-4 pointer-events-none z-10 relative">
        <h1 className="text-5xl font-bold mb-6 text-center drop-shadow-sm">
          Witaj w KiedyGramy!
        </h1>
        <p className="text-xl mb-8 text-center max-w-2xl drop-shadow-sm">
          Twoja platforma do organizowania sesji gier planszowych z przyjaciółmi.
          Twórz gry, planuj sesje i baw się dobrze!
        </p>
        <a
          href="/auth"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors pointer-events-auto cursor-pointer"
        >
          Zaloguj się lub zarejestruj
        </a>
      </div>

      {/* SEKCJA KART */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-10 pointer-events-none">
        <h2 className="text-3xl font-semibold mb-8 text-center text-white drop-shadow-md">
          Dlaczego warto korzystać z KiedyGramy?
        </h2>

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-7xl mx-auto w-full">
          {/* Karta 1 */}
          {/* Zmieniono min-w-[300px] na w-full md:w-auto */}
          {/* pointer-events-auto jest KONIECZNE, żeby działał hover na kartach */}
          <div className="flex-1 w-full md:w-auto p-6 text-center text-white bg-blue-900 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-blue-400/30 transition-transform hover:scale-105 pointer-events-auto">
            <h3 className="text-xl font-bold mb-3">Proste zarządzanie grami</h3>
            <p className="opacity-90 leading-relaxed">
              Dodawaj swoje ulubione gry planszowe do biblioteki i zarządzaj nimi w jednym miejscu.
            </p>
          </div>

          {/* Karta 2 */}
          <div className="flex-1 w-full md:w-auto p-6 text-center text-white bg-blue-900 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-blue-400/30 transition-transform hover:scale-105 pointer-events-auto">
            <h3 className="text-xl font-bold mb-3">Łatwe planowanie sesji</h3>
            <p className="opacity-90 leading-relaxed">
              Organizuj sesje gier z przyjaciółmi, wybieraj daty i godziny, a my zajmiemy się resztą.
            </p>
          </div>

          {/* Karta 3 */}
          <div className="flex-1 w-full md:w-auto p-6 text-center text-white bg-blue-900 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-blue-400/30 transition-transform hover:scale-105 pointer-events-auto">
            <h3 className="text-xl font-bold mb-3">Wspólna zabawa</h3>
            <p className="opacity-90 leading-relaxed">
              Zapraszaj znajomych do wspólnej zabawy i ciesz się niezapomnianymi chwilami przy grach planszowych.
            </p>
          </div>
        </div>
      </div>
      
      {/* Dodatkowy odstęp na dole strony */}
      <div className="h-20"></div>
    </div>
  );
};

export default LandingPage;