import { useEffect, useState, useCallback, useRef } from "react";
import useWebSocket from "react-use-websocket";

const API_RACE_URL = `${import.meta.env.VITE_API_BASE_URL}/races/current`;
const API_WINNER_URL = `${import.meta.env.VITE_API_BASE_URL}/winners/latest`;
const WS_URL = import.meta.env.VITE_WS_URL;

// TypeScript interfaces
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

interface WebSocketMessage {
  event: string;
  data?: any;
}

const useRaceData = () => {
  const [race, setRace] = useState<Race | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const raceRef = useRef<Race | null>(null); // Keeps the latest race state

  // WebSocket Hook
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => console.log("[WS] WebSocket Connected"),
    shouldReconnect: () => true, // Auto-reconnect
  });

  // Fetch current race data
  const fetchRaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_RACE_URL);
      if (!response.ok) throw new Error("Race not found");
      const data: Race = await response.json();

      if (raceRef.current?.currentRound !== data.currentRound) {
        setRace(data);
        raceRef.current = data;
      }

      setWinner(null);
      updateCountdown(data.roundEndTime);
    } catch (error) {
      console.error("[API] Error fetching race:", error);
      setError("Race not found. Please try again later.");
      fetchWinnerData();
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch last winner if no active race
  const fetchWinnerData = useCallback(async () => {
    try {
      const response = await fetch(API_WINNER_URL);
      if (!response.ok) throw new Error("No winner found");
      const data: Winner = await response.json();
      setWinner(data);
    } catch (error) {
      console.error("[API] Error fetching winner:", error);
    }
  }, []);

  // Fetch race on page load
  useEffect(() => {
    fetchRaceData();
  }, [fetchRaceData]);

  // Handle WebSocket updates
  useEffect(() => {
    if (!lastJsonMessage) return;
    const message = lastJsonMessage as WebSocketMessage;

    if (message.event === "raceUpdate" || message.event === "raceCreated") {
      if (!message.data || typeof message.data !== "object") {
        console.error("[WS] Invalid race update received:", message.data);
        return;
      }

      if (raceRef.current?.currentRound !== message.data.currentRound) {
        setRace(message.data);
        raceRef.current = message.data;
      }

      updateCountdown(message.data.roundEndTime);
      setWinner(null);
    }
  }, [lastJsonMessage]);

  // Countdown timer
  useEffect(() => {
    if (!race?.roundEndTime) return;

    const updateTimer = () => updateCountdown(race.roundEndTime);
    updateTimer(); // Run immediately

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [race?.roundEndTime]);

  // Update countdown display
  const updateCountdown = (endTime: string) => {
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
    selectedMeme,
    setSelectedMeme,
    loading,
    error,
    refreshRaceData: fetchRaceData,
    sendJsonMessage,
  };
};

export default useRaceData;