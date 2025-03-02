import { useEffect, useState, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WS_URL = import.meta.env.VITE_WS_URL;

interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
  boostAmount: number;
}

export interface Race {
  raceId: string;
  currentRound: number;
  roundEndTime?: string;
  status?: string;
  memes: Meme[];
}

interface Vault {
  raceId: string;
  totalSol: number;
}

interface WebSocketMessage {
  event: string;
  data?: any;
}

const useRaceWebSocket = (initialRace: Race | null) => {
  const [race, setRace] = useState<Race | null>(initialRace);
  const [vault, setVault] = useState<Vault | null>(null);
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
    if (!lastJsonMessage) return;
    const message = lastJsonMessage as WebSocketMessage;

    switch (message.event) {
      case "connection":
        console.log("🔗 [WS] Connection established:", message.data);
        break;

      case "raceUpdate":
        console.log("🔄 [WS] Updating race data:", message.data);
        setRace((prevRace) => {
          if (!message.data.raceId) return prevRace;

          const updatedRace: Race = {
            raceId: message.data.raceId,
            currentRound: message.data.currentRound,
            roundEndTime: message.data.roundEndTime,
            status: message.data.status,
            memes: Array.isArray(message.data.memes)
              ? message.data.memes.map((m: any) => ({
                  ...m,
                  boostAmount: 0,
                }))
              : prevRace?.memes ?? [],
          };

          raceRef.current = updatedRace;
          return updatedRace;
        });
        break;

      case "raceCreated":
        console.log("🚀 [WS] New race created, updating UI...", message.data);
        setRace(message.data);
        break;

      case "boostUpdate":
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
        break;

      case "vaultUpdate":
        console.log("💰 [WS] Vault Update received:", message.data);
        setVault(message.data);
        break;

      case "raceClosed":
        console.log("🏁 [WS] Race closed, switching to winner view...");
        setRace(null);
        setVault(null);
        break;

      default:
        console.warn(`[WS] ⚠️ Unhandled WebSocket event: ${message.event}`, message.data);
        break;
    }
  }, [lastJsonMessage]);

  return { race, vault, sendJsonMessage, readyState, webSocketStatus: getWebSocketStatus() };
};

export default useRaceWebSocket;