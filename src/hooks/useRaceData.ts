import { useEffect, useState } from "react";
import useRaceAPI from "./useRaceAPI";
import useRaceWebSocket from "./useRaceWebSocket";
import { Race } from "./useRaceWebSocket";

const useRaceData = () => {
  const {
    race: apiRace,
    vault: apiVault,
    apiBoosts,
    fetchRaceData,
    fetchWinnerData,
    fetchVaultData,
    fetchBoostsData,
    winner,
    loading,
    error,
  } = useRaceAPI();

  const {
    race: wsRace,
    vault: wsVault,
    wsBoosts,
    sendJsonMessage,
    readyState,
    webSocketStatus,
  } = useRaceWebSocket(apiRace);

  const [countdown, setCountdown] = useState<string>("00:00");
  const [boosts, setBoosts] = useState<{ [key: string]: number }>({});

  const race: Race | null = wsRace ?? apiRace;
  const vault = wsVault ?? apiVault;

  useEffect(() => {
    console.log("[DEBUG] 🏁 Current Race:", race);
    console.log("[DEBUG] 💰 Current Vault:", vault);
  }, [race, vault]);

  useEffect(() => {
    if (!race || race.status === "closed") {
      console.log("[INFO] 🏁 No active race or race closed, fetching latest winner...");
      fetchWinnerData();
    } else {
      console.log("[INFO] 🚀 Active race detected, skipping winner fetch.");
    }
  }, [race?.status, race?.raceId, race?.currentRound]);

  useEffect(() => {
    if (race?.raceId) {
      console.log("[INFO] 💰 Fetching vault for race:", race.raceId);
      fetchVaultData(race.raceId);
    }
  }, [race?.raceId]);

  useEffect(() => {
    if (race?.currentRound === 1) {
      console.log("[INFO] 🎉 New race detected! Updating UI to round 1.");
    }
  }, [race?.currentRound]);

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

  useEffect(() => {
    const combinedBoosts = wsBoosts && Object.keys(wsBoosts).length ? wsBoosts : apiBoosts;
    setBoosts(combinedBoosts);
    console.log("[INFO] 🔄 Combined boosts updated:", combinedBoosts);
  }, [apiBoosts, wsBoosts]);

  useEffect(() => {
    if (race?.raceId && race.currentRound > 0) {
      console.log(`[INFO] 📡 Fetching boosts for new round ${race.currentRound}`);
      
      fetchBoostsData(race.raceId, race.currentRound).then((newBoosts) => {
        console.log("[INFO] ✅ Boosts updated for new round:", newBoosts);
        setBoosts(newBoosts);
      });
    }
  }, [race?.raceId, race?.currentRound, fetchBoostsData]);

  useEffect(() => {
    if (race?.currentRound) {
      console.log(`[INFO] 🔄 New round ${race.currentRound} detected, resetting boosts...`);
      setBoosts({});
    }
  }, [race?.currentRound]);

  return {
    race,
    vault,
    winner,
    countdown,
    loading,
    error,
    boosts,
    refreshRaceData: fetchRaceData,
    refreshWinnerData: fetchWinnerData,
    refreshVaultData: fetchVaultData,
    fetchBoostsData,
    sendJsonMessage,
    readyState,
    webSocketStatus,
  };
};

export default useRaceData;