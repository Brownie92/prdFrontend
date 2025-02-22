import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketProvider";

const API_RACE_URL = "http://localhost:6001/api/races/current";
const API_WINNER_URL = "http://localhost:6001/api/winners/latest";

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
  const { socket } = useWebSocket();
  const [race, setRace] = useState<Race | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [countdown, setCountdown] = useState<string>("00:00:00");

  // 🏁 API-call: Race ophalen
  useEffect(() => {
    const fetchRaceData = async () => {
      try {
        const response = await fetch(API_RACE_URL);
        if (!response.ok) throw new Error("Race niet gevonden");
        const data: Race = await response.json();
        setRace(data);
        setWinner(null);
        updateCountdown(data.roundEndTime);
      } catch (error) {
        console.error("❌ Fout bij ophalen race:", error);
        fetchWinnerData();
      }
    };

    const fetchWinnerData = async () => {
      try {
        const response = await fetch(API_WINNER_URL);
        if (!response.ok) throw new Error("Geen winnaar gevonden");
        const data: Winner = await response.json();
        setWinner(data);
      } catch (error) {
        console.error("❌ Fout bij ophalen winnaar:", error);
      }
    };

    fetchRaceData();
  }, []);

  // 🎧 WebSocket luisteren naar race updates
  useEffect(() => {
    if (!socket) return;

    const handleRaceUpdate = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "raceUpdate") {
          setRace(message.data);
          setWinner(null);
          updateCountdown(message.data.roundEndTime);
        } else if (message.event === "raceCreated") {
          setRace(message.data);
          setWinner(null);
          updateCountdown(message.data.roundEndTime);
        }
      } catch (error) {
        console.error("[WS] ❌ Fout bij verwerken WebSocket bericht:", error);
      }
    };

    socket.addEventListener("message", handleRaceUpdate);

    return () => {
      socket.removeEventListener("message", handleRaceUpdate);
    };
  }, [socket]);

  // 🔥 Countdown timer
  useEffect(() => {
    if (!race || !race.roundEndTime) return;

    const interval = setInterval(() => {
      updateCountdown(race.roundEndTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [race]);

  const updateCountdown = (endTime: string) => {
    const now = new Date().getTime();
    const roundEnd = new Date(endTime).getTime();
    const timeDiff = Math.max(0, roundEnd - now);
    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    setCountdown(
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };

  return { race, winner, countdown };
};

export default useRaceData;