import { useEffect, useState } from "react";
import useRaceAPI from "./useRaceAPI";
import useRaceWebSocket from "./useRaceWebSocket";
import { Race } from "./useRaceWebSocket"; // ✅ Zorg dat Race correct wordt geïmporteerd

const useRaceData = () => {
  const {
    race: apiRace,
    vault: apiVault, // ✅ Voeg Vault toe uit API
    apiBoosts,
    fetchRaceData,
    fetchWinnerData,
    fetchVaultData, // ✅ Vault ophalen indien nodig
    fetchBoostsData, // ✅ Zorg dat boosts correct worden opgehaald
    winner,
    loading,
    error,
  } = useRaceAPI();

  const {
    race: wsRace,
    vault: wsVault, // ✅ Voeg Vault toe uit WebSocket
    wsBoosts,
    sendJsonMessage,
    readyState,
    webSocketStatus,
  } = useRaceWebSocket(apiRace);

  const [countdown, setCountdown] = useState<string>("00:00");
  const [boosts, setBoosts] = useState<{ [key: string]: number }>({});

  // ✅ Gebruik WebSocket data als die er is, anders API-data
  const race: Race | null = wsRace ?? apiRace;
  const vault = wsVault ?? apiVault;

  // ✅ Debug logs voor race en vault updates
  useEffect(() => {
    console.log("[DEBUG] 🏁 Current Race:", race);
    console.log("[DEBUG] 💰 Current Vault:", vault);
  }, [race, vault]);

  // ✅ **Check of er een actieve race is en haal zo nodig winnaar op**
  useEffect(() => {
    if (!race || race.status === "closed") {
      console.log("[INFO] 🏁 No active race or race closed, fetching latest winner...");
      fetchWinnerData();
    } else {
      console.log("[INFO] 🚀 Active race detected, skipping winner fetch.");
    }
  }, [race?.status, race?.raceId, race?.currentRound]);

  // ✅ **Vault ophalen bij nieuwe race**
  useEffect(() => {
    if (race?.raceId) {
      console.log("[INFO] 💰 Fetching vault for race:", race.raceId);
      fetchVaultData(race.raceId);
    }
  }, [race?.raceId]);

  // ✅ **Update UI als een nieuwe race start**
  useEffect(() => {
    if (race?.currentRound === 1) {
      console.log("[INFO] 🎉 New race detected! Updating UI to round 1.");
    }
  }, [race?.currentRound]);

  // ✅ **Countdown timer voor de ronde**
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

  // ✅ **Combineer API- en WebSocket-boosts**
  useEffect(() => {
    const combinedBoosts = wsBoosts && Object.keys(wsBoosts).length ? wsBoosts : apiBoosts;
    setBoosts(combinedBoosts);
    console.log("[INFO] 🔄 Combined boosts updated:", combinedBoosts);
  }, [apiBoosts, wsBoosts]);

  // ✅ **Zorg ervoor dat boosts worden opgehaald bij een nieuwe ronde**
  useEffect(() => {
    if (race?.raceId && race.currentRound > 0) {
      console.log(`[INFO] 📡 Fetching boosts for Race ${race.raceId}, Round ${race.currentRound}`);
      fetchBoostsData(race.raceId, race.currentRound);
    }
  }, [race?.raceId, race?.currentRound]);

  return {
    race,
    vault,
    winner,
    countdown,
    loading,
    error,
    boosts, // ✅ Gecombineerde boost-data nu beschikbaar!
    refreshRaceData: fetchRaceData,
    refreshWinnerData: fetchWinnerData,
    refreshVaultData: fetchVaultData,
    fetchBoostsData,  // ✅ Fix: deze moet worden doorgegeven
    sendJsonMessage,
    readyState,
    webSocketStatus,
  };
};

export default useRaceData;