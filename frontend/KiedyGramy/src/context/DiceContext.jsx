import React, { createContext, useState, useContext, useRef } from "react";

const DiceContext = createContext();

export const useDice = () => useContext(DiceContext);

export const DiceProvider = ({ children }) => {
  const [dicePool, setDicePool] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const [rollResult, setRollResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const [isFading, setIsFading] = useState(false);

  const resultsRef = useRef([]);
  const timeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  const expectedDiceCount = useRef(0);

  const rollDice = (diceTypes) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    setRollResult(null);
    setShowResult(false);
    setIsFading(false);
    resultsRef.current = [];

    expectedDiceCount.current = diceTypes.length;

    const newDice = diceTypes.map((type, index) => ({
      id: `${type}-${Date.now()}-${index}`,
      type: type,
    }));

    setDicePool(newDice);
    setIsRolling(true);
  };

  const reportResult = (value) => {
    resultsRef.current.push(value);

    // Check if we have received results for all rolled dice
    if (
      resultsRef.current.length === expectedDiceCount.current &&
      expectedDiceCount.current > 0
    ) {
      // Sum all results and show final outcome
      const total = resultsRef.current.reduce((sum, val) => sum + val, 0);

      console.log(`WSZYSTKIE KOŚCI ZATRZYMANE! Suma: ${total}`);

      setRollResult(total);
      setShowResult(true);

      // After showing result for a while, reset everything
      timeoutRef.current = setTimeout(() => {
        setShowResult(false);
        setIsFading(true);

        fadeTimeoutRef.current = setTimeout(() => {
          setDicePool([]);
          setIsRolling(false);
          setIsFading(false);
        }, 1000);
      }, 4000);
    }
  };

  const clearDice = () => {
    setDicePool([]);
    setIsRolling(false);
    setIsFading(false);
  };

  return (
    <DiceContext.Provider
      value={{
        dicePool,
        isRolling,
        rollDice,
        clearDice,
        rollResult,
        showResult,
        reportResult,
        isFading,
      }}
    >
      {children}
    </DiceContext.Provider>
  );
};
