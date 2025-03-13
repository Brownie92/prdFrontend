import { useEffect, useState } from "react";
import useRaceAPI from "../hooks/useRaceAPI";
import useRaceWebSocket from "../hooks/useRaceWebSocket";

const VaultInfo = () => {
  const { race, vault, fetchVaultData, fetchLatestActiveVaultData } =
    useRaceAPI();
  const { vault: wsVault, race: wsRace } = useRaceWebSocket(null);

  const [totalVault, setTotalVault] = useState<number | null>(null);

  // Fetch vault data when the race changes
  useEffect(() => {
    if (race?.raceId) {
      fetchVaultData(race.raceId);
    } else {
      fetchLatestActiveVaultData();
    }
  }, [race?.raceId, fetchVaultData, fetchLatestActiveVaultData]);

  // Process API vault data
  useEffect(() => {
    if (vault?.totalSol !== undefined) {
      setTotalVault(vault.totalSol);
    } else {
      setTotalVault(null);
    }
  }, [vault]);

  // Handle real-time WebSocket updates
  useEffect(() => {
    if (wsVault?.totalSol !== undefined) {
      setTotalVault(wsVault.totalSol);
    }
  }, [wsVault]);

  // Listen for new race events
  useEffect(() => {
    if (wsRace?.raceId) {
      fetchVaultData(wsRace.raceId);
    }
  }, [wsRace?.raceId, fetchVaultData]);

  // Reset vault when the race is closed
  useEffect(() => {
    if (race?.status === "closed") {
      setTotalVault(null);
    }
  }, [race?.status]);

  return (
    <div className="bg-orange-400 bg-opacity-90 p-4 rounded-xl text-center my-4 text-lg font-semibold shadow-md">
      {race?.status === "closed" ||
      totalVault === null ||
      totalVault === undefined ? (
        <>No current vault</>
      ) : (
        <>CURRENT VAULT: {totalVault.toFixed(2)} SOL</>
      )}
    </div>
  );
};

export default VaultInfo;
