import { useEffect, useState } from "react";
import useRaceAPI from "../hooks/useRaceAPI";
import useRaceWebSocket from "../hooks/useRaceWebSocket";

const SolVault = () => {
  const { race, vault, fetchVaultData, fetchLatestVaultData } = useRaceAPI();
  const { vault: wsVault } = useRaceWebSocket(null);

  const [totalVault, setTotalVault] = useState<number>(0);

  // ✅ **Vault updaten via API**
  useEffect(() => {
    if (vault?.totalSol !== undefined) {
      console.log(
        `[SolVault] 🔄 Setting vault from API: ${vault.totalSol} SOL`
      );
      setTotalVault(vault.totalSol || 0);
    }
  }, [vault]);

  // ✅ **Vault live updaten via WebSocket**
  useEffect(() => {
    if (wsVault?.totalSol !== undefined) {
      console.log(
        `[SolVault] 🔄 WebSocket vault update: ${wsVault.totalSol} SOL`
      );
      setTotalVault(wsVault.totalSol || 0);
    }
  }, [wsVault]);

  // ✅ **Vault ophalen bij eerste render**
  useEffect(() => {
    if (race?.status === "active" && race?.raceId) {
      console.log(
        `[SolVault] 🔄 Fetching Vault for active race: ${race.raceId}`
      );
      fetchVaultData(race.raceId);
    } else {
      console.log(
        "[SolVault] 🔄 No active race, fetching latest closed vault."
      );
      fetchLatestVaultData().then((latestVault) => {
        console.log("[SolVault] ✅ Latest Vault fetched:", latestVault);
        if (latestVault?.totalSol !== undefined) {
          console.log(
            `[SolVault] 🔄 Setting state: ${latestVault.totalSol} SOL`
          );
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
