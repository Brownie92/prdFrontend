import { useState, useCallback, useRef, useEffect } from "react";
import useWebSocket from "react-use-websocket";

// ✅ TypeScript interfaces
interface Race {
  currentRound: number;
  roundEndTime: string;
}

// ✅ WebSocket bericht type
interface WebSocketMessage {
  event: string;
  data: Race;
}

// ✅ API en WebSocket URL's
const API_RACE_URL = "http://localhost:6001/api/races/current";
const WS_URL = "ws://localhost:6001";

const RaceTest = () => {
  const [race, setRace] = useState<Race | null>(null);
  const raceRef = useRef<Race | null>(null);

  console.log("[TEST] 🎬 Rendering RaceTest...");

  // ✅ Gebruik react-use-websocket met correcte typing
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<WebSocketMessage>(
    WS_URL,
    {
      onOpen: () => console.log("[WS] ✅ Verbonden met WebSocket!"),
      onClose: () => console.log("[WS] ❌ WebSocket afgesloten!"),
      shouldReconnect: () => true,
    }
  );

  // 🔄 **API Call om initiële race op te halen**
  const fetchRaceData = useCallback(async () => {
    console.log("[TEST] 🔄 Race ophalen van API...");
    try {
      const response = await fetch(API_RACE_URL);
      if (!response.ok) throw new Error("Race niet gevonden");
      const data: Race = await response.json();
      console.log("[TEST] ✅ Race state ingeladen:", data);
      raceRef.current = data;
      setRace({ ...data });
    } catch (error) {
      console.error("[TEST] ❌ Fout bij ophalen race:", error);
    }
  }, []);

  // 🎧 **Gebruik useEffect om WebSocket updates correct te verwerken**
  useEffect(() => {
    if (!lastJsonMessage) return;
    if (lastJsonMessage.event !== "raceUpdate") return;

    console.log("[TEST] 📨 WebSocket event ontvangen:", lastJsonMessage);

    if (raceRef.current?.currentRound !== lastJsonMessage.data.currentRound) {
      console.log(
        "[TEST] 🔄 Race wordt bijgewerkt naar:",
        lastJsonMessage.data
      );
      raceRef.current = lastJsonMessage.data;
      setRace({ ...lastJsonMessage.data });
    } else {
      console.log(
        "[TEST] ⚠️ WebSocket update genegeerd (geen verandering in ronde)."
      );
    }
  }, [lastJsonMessage]); // ✅ Alleen uitvoeren als lastJsonMessage verandert

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg">
      <h1 className="text-xl font-bold">Race Test</h1>
      <p>Huidige ronde: {race?.currentRound ?? "Laden..."}</p>

      <button
        onClick={fetchRaceData}
        className="mt-4 px-4 py-2 bg-blue-500 rounded"
      >
        🚀 Laad initiële race (API)
      </button>
      <button
        onClick={() => {
          console.log("[TEST] 🎭 Simuleer WebSocket update...");
          sendJsonMessage({
            event: "raceUpdate",
            data: {
              currentRound: (race?.currentRound ?? 0) + 1,
              roundEndTime: new Date(Date.now() + 60000).toISOString(),
            },
          });
        }}
        className="ml-4 px-4 py-2 bg-green-500 rounded"
      >
        📡 Simuleer WebSocket Update
      </button>
    </div>
  );
};

export default RaceTest;
