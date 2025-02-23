import { useEffect, useState, useCallback, useRef } from "react";
import useWebSocket from "react-use-websocket";

const API_RACE_URL = "http://localhost:6001/api/races/current";
const API_WINNER_URL = "http://localhost:6001/api/winners/latest";
const WS_URL = "ws://localhost:6001"; // ✅ WebSocket server URL

// ✅ TypeScript interfaces
interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
}

interface Race {
  currentRound: number;
  roundEndTime: string;
  memes: Meme[];
}

interface Winner {
  name: string;
  image: string;
  totalVault: number;
  totalWinners: number;
}

const useRaceData = () => {
  console.log("[HOOK] 🎬 useRaceData initialized");

  const [race, setRace] = useState<Race | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const raceRef = useRef<Race | null>(null); // ✅ Houd de laatste race-state bij

  console.log("[STATE] 🏁 Huidige race state bij render:", race);

  // 🚀 **React-Use-WebSocket Hook**
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => console.log("[WS] ✅ WebSocket Verbonden!"),
    shouldReconnect: () => true, // ✅ Automatisch opnieuw verbinden
  });

  // 🏁 **Race ophalen bij pagina-load**
  const fetchRaceData = useCallback(async () => {
    console.log("[API] 🔄 Ophalen van race data...");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_RACE_URL);
      if (!response.ok) throw new Error("Race niet gevonden");
      const data: Race = await response.json();

      console.log("[API] ✅ Race opgehaald:", data);

      if (raceRef.current?.currentRound !== data.currentRound) {
        setRace(data);
        raceRef.current = data;
        console.log("[STATE] ✅ Race bijgewerkt vanuit API:", data);
      } else {
        console.log("[STATE] ⚠️ Race update genegeerd (geen verandering).");
      }

      setWinner(null);
      updateCountdown(data.roundEndTime);
    } catch (error) {
      console.error("[API] ❌ Fout bij ophalen race:", error);
      setError("Race niet gevonden. Probeer het later opnieuw.");
      fetchWinnerData();
    } finally {
      setLoading(false);
    }
  }, []);

  // 🏆 **Winnaar ophalen als er geen actieve race is**
  const fetchWinnerData = useCallback(async () => {
    console.log("[API] 🏆 Ophalen van laatste winnaar...");
    try {
      const response = await fetch(API_WINNER_URL);
      if (!response.ok) throw new Error("Geen winnaar gevonden");
      const data: Winner = await response.json();
      setWinner(data);
      console.log("[API] ✅ Laatste winnaar opgehaald:", data);
    } catch (error) {
      console.error("[API] ❌ Fout bij ophalen winnaar:", error);
    }
  }, []);

  // 📡 **Race ophalen bij pagina-load**
  useEffect(() => {
    console.log("[EFFECT] 🚀 useEffect: fetchRaceData()");
    fetchRaceData();
  }, [fetchRaceData]);

  // 🎧 **WebSocket updates verwerken**
  useEffect(() => {
    if (!lastJsonMessage) return;

    console.log("[WS] 📨 WebSocket event ontvangen:", lastJsonMessage);

    if (lastJsonMessage.event === "raceUpdate" || lastJsonMessage.event === "raceCreated") {
      console.log("[WS] 🔄 Race update ontvangen:", lastJsonMessage.data);

      if (!lastJsonMessage.data || typeof lastJsonMessage.data !== "object") {
        console.error("[WS] ❌ Ongeldige race-update ontvangen:", lastJsonMessage.data);
        return;
      }

      if (raceRef.current?.currentRound !== lastJsonMessage.data.currentRound) {
        setRace(lastJsonMessage.data);
        raceRef.current = lastJsonMessage.data;
        console.log("[WS] ✅ Race bijgewerkt naar:", lastJsonMessage.data);
      } else {
        console.log("[WS] ⚠️ WebSocket update genegeerd (geen verandering in ronde).");
      }

      updateCountdown(lastJsonMessage.data.roundEndTime);
      setWinner(null);
    }
  }, [lastJsonMessage]); // ✅ React-Use-WebSocket levert updates automatisch!

  // ⏳ **Countdown timer updaten**
  useEffect(() => {
    if (!race?.roundEndTime) return;
  
    console.log("[COUNTDOWN] ⏳ Timer gestart!");
  
    const updateTimer = () => {
      updateCountdown(race.roundEndTime);
    };
  
    updateTimer(); // Direct uitvoeren bij start
    const interval = setInterval(updateTimer, 1000);
  
    return () => {
      console.log("[COUNTDOWN] ❌ Timer gestopt!");
      clearInterval(interval);
    };
  }, [race?.roundEndTime]); // ✅ Alleen opnieuw uitvoeren als de eindtijd wijzigt

  // 🔥 **Functie om de countdown te berekenen**
  const updateCountdown = (endTime: string) => {
    console.log("[COUNTDOWN] ⏳ Countdown bijwerken...");
    const now = Date.now();
    const roundEnd = new Date(endTime).getTime();
    const timeDiff = Math.max(0, roundEnd - now);
    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    setCountdown(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    console.log("[COUNTDOWN] ✅ Nieuwe countdown:", countdown);
  };

  return {
    race,
    winner,
    countdown,
    selectedMeme,
    setSelectedMeme,
    loading,
    error,
    refreshRaceData: fetchRaceData,
    sendJsonMessage, // ✅ Toegevoegd om WebSocket berichten te verzenden
  };
};

export default useRaceData;