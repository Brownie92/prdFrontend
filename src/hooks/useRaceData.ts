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
  }, [race, vault]);

  useEffect(() => {
    if (!race) return;

    if (race.status === "closed") {
      fetchWinnerData();
    } else if (race.status === "waiting") {
      setCountdown("Gathering Legends...");
    } else if (race.roundEndTime) {
      const updateTimer = () => {
        const now = Date.now();
        const roundEnd = new Date(race.roundEndTime!).getTime();
        const timeDiff = Math.max(0, roundEnd - now);
        const hours = Math.floor((timeDiff / 1000 / 60 / 60) % 24);
        const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);
        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );

        if (timeDiff <= 0) {
          clearInterval(interval);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [race?.status, race?.roundEndTime]);

  useEffect(() => {
    if (race?.raceId) {
      fetchVaultData(race.raceId);
    }
  }, [race?.raceId]);

  useEffect(() => {
    if (race?.currentRound === 1) {
    }
  }, [race?.currentRound]);

  useEffect(() => {
    const combinedBoosts = wsBoosts && Object.keys(wsBoosts).length ? wsBoosts : apiBoosts;
    setBoosts(combinedBoosts);
  }, [apiBoosts, wsBoosts]);

  useEffect(() => {
    if (race?.raceId && race.currentRound > 0) {
      fetchBoostsData(race.raceId, race.currentRound).then((newBoosts) => {
        setBoosts(newBoosts);
      });
    }
  }, [race?.raceId, race?.currentRound, fetchBoostsData]);

  useEffect(() => {
    if (race?.currentRound) {
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