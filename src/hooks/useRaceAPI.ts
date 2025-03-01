import { useState, useCallback } from "react";

const API_RACE_URL = `${import.meta.env.VITE_API_BASE_URL}/races/current`;
const API_WINNER_URL = `${import.meta.env.VITE_API_BASE_URL}/winners/latest`;

// TypeScript interfaces
interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
  boostAmount: number;  // ✅ Nooit undefined
  totalSol: number;      // ✅ Nooit undefined
}

interface Race {
  raceId: string;
  currentRound: number;
  roundEndTime?: string;
  memes: Meme[];
}

interface Winner {
  memeUrl: string;
  progress: number;
  createdAt: string;
}

const useRaceAPI = () => {
  const [race, setRace] = useState<Race | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ **Winnaar ophalen via API (Alleen als er GEEN actieve race is)**
  const fetchWinnerData = useCallback(async () => {
    if (race && race.currentRound > 0) {
      console.log("[API] 🚀 Skipping winner fetch - active race detected.");
      return; // ❌ Winner-fetch overslaan als er een actieve race is
    }

    try {
      console.log("[API] 🔍 Fetching latest winner...");
      const response = await fetch(API_WINNER_URL);
      if (!response.ok) {
        console.warn("[API] ⚠️ No winner found.");
        return null;
      }
      const data: Winner = await response.json();
      console.log("[API] 🏆 Winner retrieved:", data);
      setWinner(data);
      return data;
    } catch (error) {
      console.error("[API] ❌ Error fetching winner:", error);
      return null;
    }
  }, [race]);

  // ✅ **Race data ophalen via API (Voorkomt dubbele requests)**
  const fetchRaceData = useCallback(async () => {
    if (race && race.currentRound > 0) {
      console.log("[API] 🚀 Skipping race fetch - active race detected.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("[API] 🔍 Fetching current race...");
      const response = await fetch(API_RACE_URL);
      if (!response.ok) throw new Error("Race not found");
      const data: Race = await response.json();

      if (!data.raceId) {
        console.error("[ERROR] ❌ Race received without raceId!", data);
        return;
      }

      // ✅ Zorg dat `boostAmount` en `totalSol` altijd een nummer zijn
      const validatedMemes = data.memes.map((meme) => ({
        ...meme,
        boostAmount: typeof meme.boostAmount === "number" ? meme.boostAmount : 0,
        totalSol: typeof meme.totalSol === "number" ? meme.totalSol : 0,
      }));

      if (data.currentRound && data.currentRound > 0) {
        console.log("[API] ✅ Active race found, updating state.");
        setRace({ ...data, memes: validatedMemes });
        setWinner(null); // ✅ **Winnaar wissen bij actieve race**
      } else {
        console.log("[API] ⚠️ No active race found, fetching latest winner...");
        await fetchWinnerData();
      }
    } catch (error) {
      console.error("[API] ❌ Error fetching race:", error);
      setError("Race not found. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [race, fetchWinnerData]);

  return { race, winner, loading, error, fetchRaceData, fetchWinnerData };
};

export default useRaceAPI;