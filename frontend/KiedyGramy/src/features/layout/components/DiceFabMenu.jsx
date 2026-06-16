import { ConsoleLogger } from "@microsoft/signalr/dist/esm/Utils";
import React, { useState } from "react";
import { useDice } from "../../../context/DiceContext";

const DiceFabMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [dicePool, setDicePool] = useState({});

  const { rollDice, rollResult, showResult } = useDice();

  const availableDice = ["D4", "D6", "D8", "D10", "D12", "D20", "D100"];

  const addDice = (type) => {
    setDicePool((prev) => ({
      ...prev,
      [type]: prev[type] ? prev[type] + 1 : 1,
    }));
  };

  const clearPool = () => setDicePool({});

  const handleRollClick = () => {
    if (Object.keys(dicePool).length === 0) return;

    console.log("Rzucamy kośćmi: ", dicePool);
    // TODO: implement roll logic and show results
    const arrayToRoll = [];
    Object.entries(dicePool).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        arrayToRoll.push(type);
      }
    });

    rollDice(arrayToRoll);

    // Optional: clear pool after rolling, or keep it if you want to allow quick re-rolls
    clearPool();

    setIsOpen(false);
  };

  const renderPoolText = () => {
    const entries = Object.entries(dicePool);
    if (entries.length === 0) return "Choose dices to roll"; // TODO: i18n

    return entries.map(([type, count]) => `${count}${type}`).join(" + ");
  };

  const hasDice = Object.keys(dicePool).length > 0;

  return (
    <div className="relative inline-flex items-center">
      {/* --- DICE CHOOSER MENU (POPOVER) --- */}
      <div
        className={`absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 transition-all duration-300 origin-bottom-left ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display font-bold text-text-main dark:text-text-inverse">
            Choose your dice {/* TODO: i18n */}
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-red-500 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* --- DICE BUTTONS GRID --- */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {availableDice.map((dice) => (
            <button
              key={dice}
              onClick={() => addDice(dice)}
              className="py-2 bg-surface-light dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 border border-transparent hover:border-primary/50 text-text-main dark:text-text-inverse rounded-lg font-bold font-display uppercase text-sm transition-all active:scale-95"
            >
              {dice}
            </button>
          ))}
        </div>

        {/* --- DICE POOL SUMMARY --- */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-3 mb-4 flex justify-between items-center border border-gray-100 dark:border-gray-800">
          <span className="text-sm font-medium text-text-main dark:text-text-inverse truncate pr-2">
            {renderPoolText()}
          </span>
          {hasDice && (
            <button
              onClick={clearPool}
              className="text-xs text-red-500 hover:text-red-600 font-semibold uppercase tracking-wider shrink-0"
            >
              Clear {/* TODO: i18n */}
            </button>
          )}
        </div>

        {/* --- ROLL BUTTON --- */}
        <button
          onClick={handleRollClick}
          disabled={!hasDice}
          className={`w-full py-3 rounded-xl font-display font-bold tracking-wide transition-all ${
            hasDice
              ? "bg-primary hover:bg-primary-light text-white shadow-lg hover:shadow-primary/50"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          ROLL! {/* <<--------------- TODO: i18n */}
        </button>
      </div>

      {/* --- FAB BUTTON --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all focus:outline-none z-50 relative border-2 border-white dark:border-surface-card"
        title="Open dice roller" // TODO: i18n
      >
        {/* Simple dice icon */}
        <svg
          className="w-7 h-7"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
          <path d="M50 5 L20 40 L80 40 Z" />
          <path d="M20 40 L50 85 L80 40" />
          <path d="M20 40 L7 72" />
          <path d="M80 40 L93 72" />
        </svg>

        {/* Red notification dot, if we have already selected some dice and the menu is closed */}
        {hasDice && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-surface-card"></span>
        )}
      </button>
      <div
        // 2. ZMIANA: top-1/2 i -translate-y-1/2 idealnie centrują dymek w pionie względem przycisku
        className={`absolute left-full top-1/2 ml-4 whitespace-nowrap bg-primary text-white font-display font-bold px-6 py-3 rounded-2xl shadow-xl transition-all duration-500 ease-out z-40 ${
          showResult
            ? "opacity-100 translate-x-0 -translate-y-1/2"
            : "opacity-0 -translate-x-4 -translate-y-1/2 pointer-events-none"
        }`}
      >
        You rolled <span className="text-2xl ml-2">{rollResult}</span>
      </div>
    </div>
  );
};

export default DiceFabMenu;
