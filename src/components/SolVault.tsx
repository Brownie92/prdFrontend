import { useEffect, useState } from "react";
import useRaceAPI from "../hooks/useRaceAPI";
import useRaceWebSocket from "../hooks/useRaceWebSocket";

const SolVault = () => {
  const { race, vault, fetchVaultData, fetchLatestVaultData } = useRaceAPI();
  const { vault: wsVault } = useRaceWebSocket(null);

  const [totalVault, setTotalVault] = useState<number>(0);

  // Update vault from API response
  useEffect(() => {
    if (vault?.totalSol !== undefined) {
      setTotalVault(vault.totalSol || 0);
    }
  }, [vault]);

  // Update vault in real-time via WebSocket
  useEffect(() => {
    if (wsVault?.totalSol !== undefined) {
      setTotalVault(wsVault.totalSol || 0);
    }
  }, [wsVault]);

  // Fetch vault data on initial render
  useEffect(() => {
    if (race?.status === "active" && race?.raceId) {
      fetchVaultData(race.raceId);
    } else {
      fetchLatestVaultData().then((latestVault) => {
        if (latestVault?.totalSol !== undefined) {
          setTotalVault(latestVault.totalSol);
        }
      });
    }
  }, [race?.status, race?.raceId]);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg text-center mt-4">
      <h3 className="text-lg font-semibold">WINNERS VAULT</h3>
      <p className="text-xl font-bold">{totalVault.toFixed(2)} SOL</p>
    </div>
  );
};

export default SolVault;
