import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import useRaceAPI from "./useRaceAPI"; // ✅ Correcte import

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
  const [pendingBoosts, setPendingBoosts] = useState<any[]>([]); // ✅ Bewaar boost voor later
  const [wsBoosts, setWsBoosts] = useState<{ [key: string]: number }>({}); // ✅ Houd WebSocket-boosts bij

  const { fetchRaceData } = useRaceAPI(); // ✅ Gebruik de race API om data op te halen

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
          return {
            ...message.data,
            memes: message.data.memes.map((m: any) => ({
              ...m,
              boostAmount: m.boostAmount ?? 0,
            })),
          };
        });
        break;
  
      case "raceCreated":
        console.log("🚀 [WS] New race created, updating UI...", message.data);
        setRace(message.data);
        break;
  
      case "boostUpdate":
        console.log("🚀 [WS] Boost Update received:", JSON.stringify(message.data, null, 2));

        setRace((prevRace) => {
            if (!prevRace) {
                console.warn("[WS] ❌ No previous race found. Fetching race first...");
                console.log("[WS] 🔍 Fetching race before processing boost...");
                fetchRaceData().then(() => {
                    console.log("[WS] ✅ Race fetched, retrying boost update...");
                    setPendingBoosts((prev) => [...prev, message.data]);
                }).catch((error) => {
                    console.error("[WS] ❌ Error fetching race:", error);
                });
                return prevRace;
            }

            const updatedMemes = prevRace.memes.map((meme) => {
                const foundBoost = message.data.boosts.find(
                    (b: any) => String(b._id) === String(meme.memeId) || String(b.memeId) === String(meme.memeId)
                );

                return { 
                    ...meme, 
                    boostAmount: foundBoost ? foundBoost.totalSol : meme.boostAmount 
                };
            });

            return { ...prevRace, memes: updatedMemes };
        });

        // ✅ Update WebSocket-boosts state apart
        setWsBoosts((prevWsBoosts) => {
            const newBoosts = { ...prevWsBoosts };
            message.data.boosts.forEach((boost: any) => {
                newBoosts[String(boost._id)] = boost.totalSol;
            });

            console.log("[WS] ✅ WebSocket Boost state updated:", newBoosts);
            return newBoosts;
        });

        break;
  
      case "vaultUpdate":
        console.log("💰 [WS] Vault Update received:", message.data);
        setVault(message.data);
        break;
  
      case "winnerUpdate":
        console.log("🏆 [WS] Winner Update received:", message.data);
        setRace(null); // Race afsluiten
        setVault(null); // Vault resetten
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
    if (race && pendingBoosts.length > 0) {
        console.log("[WS] 🔄 Processing pending boosts...");
        
        setRace((prevRace) => {
            if (!prevRace) return prevRace;

            const updatedMemes = prevRace.memes.map((meme) => {
                const foundBoost = pendingBoosts.find((boostData) =>
                    boostData.boosts.some((b: any) =>
                        String(b._id) === String(meme.memeId) || String(b.memeId) === String(meme.memeId)
                    )
                );

                return { 
                    ...meme, 
                    boostAmount: foundBoost ? foundBoost.boosts[0].totalSol : meme.boostAmount 
                };
            });

            return { ...prevRace, memes: updatedMemes };
        });

        setPendingBoosts([]); // ✅ Wis de opgeslagen boosts nadat ze zijn verwerkt
    }
}, [race]); // 🔄 Zodra de race beschikbaar is, verwerken we de opgeslagen boosts

  return { race, vault, wsBoosts, sendJsonMessage, readyState, webSocketStatus: getWebSocketStatus() };
};

export default useRaceWebSocket;