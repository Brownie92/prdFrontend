import { useEffect, useState, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WS_URL = import.meta.env.VITE_WS_URL;

interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
  boostAmount: number; // ✅ Boost per ronde, niet per race
  lastRoundBoost?: number;
  boostRound?: number;
}

interface Race {
  raceId: string;
  currentRound: number;
  roundEndTime?: string;
  memes: Meme[];
}

interface WebSocketMessage {
  event: string;
  data?: any;
}

const useRaceWebSocket = (initialRace: Race | null) => {
  const [race, setRace] = useState<Race | null>(initialRace);
  const raceRef = useRef<Race | null>(initialRace);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => console.log("[WS] ✅ WebSocket Connected"),
    shouldReconnect: () => true,
  });

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

  useEffect(() => {
    console.log(`[WS] Current WebSocket State: ${getWebSocketStatus()}`);
  }, [readyState]);

  useEffect(() => {
    if (!lastJsonMessage) return;

    const message = lastJsonMessage as WebSocketMessage;

    // ✅ **Race Update (Volledige update van de race)**
    if (message.event === "raceUpdate") {
      console.log("🔄 [WS] Updating race data:", message.data);

      setRace((prevRace) => {
        if (!message.data.raceId) return prevRace;

        return {
          raceId: message.data.raceId,
          currentRound: message.data.currentRound,
          roundEndTime: message.data.roundEndTime,
          memes: Array.isArray(message.data.memes)
            ? message.data.memes.map((m: any) => ({
                ...m,
                boostAmount: 0, // ✅ Reset boostAmount bij elke nieuwe race-update
              }))
            : prevRace?.memes ?? [],
        };
      });
    }

    // ✅ **Boost Update (Wordt getriggerd als een boost wordt ingezet)**
    if (message.event === "boostUpdate") {
      console.log("🚀 [WS] Boost Update received:", message.data);

      setRace((prevRace) => {
        if (!prevRace || !Array.isArray(prevRace.memes)) return prevRace;

        const updatedMemes = prevRace.memes.map((meme) => {
          const foundBoost = message.data.boosts.find((b: any) => b._id === meme.memeId);

          return {
            ...meme,
            boostAmount: foundBoost ? foundBoost.totalSol : meme.boostAmount ?? 0,
          };
        });

        console.log("[WS] ✅ Updated Memes with Boosts:", updatedMemes);
        return { ...prevRace, memes: updatedMemes };
      });
    }

    // ✅ **Round Update (Nieuwe ronde, verwerkt boosts & progressie)**
    if (message.event === "roundUpdate" && message.data?.boosts) {
      console.log("🔥 [WS] Round Update received:", message.data);

      setRace((prevRace) => {
        if (!prevRace || !Array.isArray(prevRace.memes)) return prevRace;

        const boosts = Array.isArray(message.data.boosts) ? message.data.boosts : [];
        console.log("[WS] 🚀 Processing Boosts:", boosts);

        const updatedMemes = prevRace.memes.map((meme) => {
          const foundBoost = boosts.find((b: any) => b._id === meme.memeId);

          console.log(`[WS] 🔍 Boost match: ${meme.memeId} →`, foundBoost ? foundBoost.totalSol : "No boost found");

          return {
            ...meme,
            boostAmount: foundBoost ? foundBoost.totalSol : meme.boostAmount ?? 0,
          };
        });

        console.log("[WS] ✅ Updated Memes with Boosts:", updatedMemes);
        return { ...prevRace, memes: updatedMemes };
      });
    }
  }, [lastJsonMessage]); // ✅ **Belangrijke fix: 1 enkele `useEffect` en niet genest**

  return { race, sendJsonMessage, readyState, webSocketStatus: getWebSocketStatus() };
};

export default useRaceWebSocket;