import { useEffect, useState, useCallback, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const API_RACE_URL = `${import.meta.env.VITE_API_BASE_URL}/races/current`;
const API_WINNER_URL = `${import.meta.env.VITE_API_BASE_URL}/winners/latest`;
const WS_URL = import.meta.env.VITE_WS_URL;

// TypeScript interfaces
interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
  boostAmount?: number;
  totalSol?: number;
}

interface Race {
  raceId: string;
  currentRound: number;
  roundEndTime?: string;
  memes: Meme[];
}

interface Winner {
  name: string;
  image: string;
  totalVault: number;
  totalWinners: number;
}

interface WebSocketMessage {
  event: string;
  data?: any;
}

const useRaceData = () => {
  const [race, setRace] = useState<Race | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [countdown, setCountdown] = useState<string>("00:00");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const raceRef = useRef<Race | null>(null);

  // ✅ WebSocket Hook met reconnect & event handling
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => console.log("[WS] ✅ WebSocket Connected"),
    shouldReconnect: () => true,
  });

  // ✅ Functie om WebSocket-status om te zetten naar leesbare tekst
  const getWebSocketStatus = () => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return "Connecting...";
      case ReadyState.OPEN:
        return "Connected ✅";
      case ReadyState.CLOSING:
        return "Closing...";
      case ReadyState.CLOSED:
        return "Disconnected ❌";
      default:
        return "Unknown";
    }
  };

  // ✅ Log de WebSocket-status updates
  useEffect(() => {
    console.log(`[WS] Current WebSocket State: ${getWebSocketStatus()}`);
  }, [readyState]);

  // ✅ Race data ophalen via API
  const fetchRaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_RACE_URL);
      if (!response.ok) throw new Error("Race not found");
      const data: Race = await response.json();

      if (!data.raceId) {
        console.error("[ERROR] ❌ Race received without raceId!", data);
        return;
      }

      setRace({
        ...data,
        memes: data.memes.map(meme => ({
          ...meme,
          boostAmount: meme.boostAmount ?? 0,
          totalSol: meme.totalSol ?? 0
        }))
      });
      raceRef.current = data;

      setWinner(null);
      updateCountdown(data.roundEndTime);
    } catch (error) {
      console.error("[API] ❌ Error fetching race:", error);
      setError("Race not found. Please try again later.");
      fetchWinnerData();
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Winnaar ophalen als er geen actieve race is
  const fetchWinnerData = useCallback(async () => {
    try {
      const response = await fetch(API_WINNER_URL);
      if (!response.ok) throw new Error("No winner found");
      const data: Winner = await response.json();
      setWinner(data);
    } catch (error) {
      console.error("[API] ❌ Error fetching winner:", error);
    }
  }, []);

  // ✅ Fetch race bij eerste render
  useEffect(() => {
    fetchRaceData();
  }, [fetchRaceData]);

  // ✅ **WebSocket updates correct verwerken**
  useEffect(() => {
    if (!lastJsonMessage) return;
  
    const message = lastJsonMessage as WebSocketMessage;
    
    if (!message.data || !message.data.raceId) {
      console.error("[WS] ❌ Race update received without raceId!", message.data);
      return;
    }
  
    console.log("🔄 [WS] Updating race data:", message.data);
  
    setRace(prevRace => {
      if (!prevRace) return null;
  
      // ✅ Boost data verwerken in bestaande memes
      const updatedMemes = prevRace.memes.map(meme => {
        const boostData = message.data.boosts?.find((b: any) => b._id === meme.memeId);
        return {
          ...meme,
          totalSol: boostData ? boostData.totalSol : meme.totalSol ?? 0 // ✅ Correcte update
        };
      });
  
      return {
        raceId: prevRace.raceId ?? message.data.raceId ?? "", // ✅ Fix voor TypeScript error
        currentRound: message.data.currentRound ?? prevRace.currentRound,
        roundEndTime: message.data.roundEndTime ?? prevRace.roundEndTime,
        memes: updatedMemes // ✅ Geüpdatete memes met boost data
      };
    });
  
    raceRef.current = {
      raceId: raceRef.current?.raceId ?? message.data.raceId ?? "", // ✅ Fix voor undefined error
      currentRound: message.data.currentRound ?? raceRef.current?.currentRound,
      roundEndTime: message.data.roundEndTime ?? raceRef.current?.roundEndTime,
      memes: raceRef.current?.memes.map(meme => {
        const boostData = message.data.boosts?.find((b: any) => b._id === meme.memeId);
        return {
          ...meme,
          totalSol: boostData ? boostData.totalSol : meme.totalSol ?? 0
        };
      }) ?? []
    };
  
    if (message.data.roundEndTime) {
      updateCountdown(message.data.roundEndTime);
    }
  
    setWinner(null);
  }, [lastJsonMessage]);

  // ✅ **Automatische countdown update**
  useEffect(() => {
    if (!race?.roundEndTime) return;

    const updateTimer = () => updateCountdown(race.roundEndTime!);
    updateTimer();

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [race?.roundEndTime]);

  // ✅ **Countdown berekenen**
  const updateCountdown = (endTime?: string) => {
    if (!endTime) {
      setCountdown("00:00");
      return;
    }

    const now = Date.now();
    const roundEnd = new Date(endTime).getTime();
    const timeDiff = Math.max(0, roundEnd - now);
    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    setCountdown(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
  };

  return {
    race,
    winner,
    countdown,
    loading,
    error,
    refreshRaceData: fetchRaceData,
    sendJsonMessage,
    readyState, // ✅ Teruggegeven voor gebruik in componenten
    webSocketStatus: getWebSocketStatus() // ✅ Leesbare WebSocket-status
  };
};

export default useRaceData;