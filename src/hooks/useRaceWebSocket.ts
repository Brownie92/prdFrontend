import { useEffect, useState } from "react";
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
  const [wsBoosts, setWsBoosts] = useState<{ [key: string]: number }>({});

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
        setRace(message.data);
        break;

      case "raceCreated":
        console.log("🚀 [WS] New race created, updating UI...", message.data);
        setRace(message.data);
        break;

      case "boostUpdate":
        console.log("🚀 [WS] Boost Update ontvangen:", JSON.stringify(message.data, null, 2));

        setRace((prevRace) => {
          if (!prevRace) return prevRace;

          const updatedMemes = prevRace.memes.map((meme) => {
            const foundBoost = message.data.boosts.find(
              (b: any) => String(b.memeId) === String(meme.memeId)
            );

            return {
              ...meme,
              boostAmount: foundBoost ? foundBoost.totalSol : 0,
            };
          });

          return { ...prevRace, memes: updatedMemes };
        });

        setWsBoosts(() => {
          const newBoosts = message.data.boosts.reduce((acc: { [key: string]: number }, boost: any) => {
            acc[String(boost.memeId)] = boost.totalSol;
            return acc;
          }, {});

          console.log("[WS] ✅ WebSocket Boost state bijgewerkt:", newBoosts);
          return newBoosts;
        });

        break;

      case "vaultUpdate":
        console.log("💰 [WS] Vault Update received:", message.data);
        setVault(message.data);
        break;

      case "winnerUpdate":
        console.log("🏆 [WS] Winner Update received:", message.data);
        setRace(null);
        setVault(null);
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

  useEffect(() => {
    if (race?.currentRound) {
      console.log("[WS] 🔄 Nieuwe ronde gedetecteerd, reset WebSocket boosts...");
      setWsBoosts({});
    }
  }, [race?.currentRound]);

  useEffect(() => {
    if (race?.currentRound) {
      console.log("[WS] 🔄 Nieuwe ronde gedetecteerd, reset WebSocket boosts...");
      setWsBoosts({});
    }
  }, [race?.currentRound]);

  return { race, vault, wsBoosts, sendJsonMessage, readyState, webSocketStatus: getWebSocketStatus() };
};

export default useRaceWebSocket;