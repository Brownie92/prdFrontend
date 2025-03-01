import { useEffect, useState } from "react";
import useRaceAPI from "./useRaceAPI"; // ✅ API calls
import useRaceWebSocket from "./useRaceWebSocket"; // ✅ WebSocket updates

const useRaceData = () => {
  // ✅ Haal race-data op via API
  const {
    race: apiRace,
    fetchRaceData,
    fetchWinnerData, // ✅ Haal laatste winnaar op
    winner,
    loading,
    error,
  } = useRaceAPI();

  // ✅ Gebruik WebSocket met de API-race als initiële waarde
  const {
    race: wsRace,
    sendJsonMessage,
    readyState,
    webSocketStatus,
  } = useRaceWebSocket(apiRace);

  const [countdown, setCountdown] = useState<string>("00:00");

  // ✅ Gebruik WebSocket-data als prioriteit, anders API-data
  const race = wsRace ?? apiRace;

// ✅ **Laatste winnaar ophalen als er geen actieve race is**
useEffect(() => {
  if (!race || race.currentRound === 0 || !race.currentRound) {
    console.log("[INFO] No active race found, fetching latest winner...");
    fetchWinnerData(); // ✅ Alleen laatste winnaar ophalen als er echt geen race is
  } else {
    console.log("[INFO] Active race detected, skipping winner fetch.");
  }
}, [race?.raceId, race?.currentRound]); // ✅ Nu triggert het ook op `currentRound`

  // ✅ **UI correct updaten naar ronde 1**
  useEffect(() => {
    if (race?.currentRound === 1) {
      console.log("[INFO] New race detected! Updating UI to round 1.");
    }
  }, [race?.currentRound]);

  // ✅ **Automatische countdown update**
  useEffect(() => {
    if (!race?.roundEndTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const roundEnd = new Date(race.roundEndTime!).getTime();
      const timeDiff = Math.max(0, roundEnd - now);
      const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
      const seconds = Math.floor((timeDiff / 1000) % 60);
      setCountdown(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [race?.roundEndTime]);

  return {
    race,
    winner,
    countdown,
    loading,
    error,
    refreshRaceData: fetchRaceData,
    refreshWinnerData: fetchWinnerData,
    sendJsonMessage, // ✅ WebSocket berichten sturen
    readyState,
    webSocketStatus,
  };
};

export default useRaceData;