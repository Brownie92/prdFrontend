import { useEffect, useState } from "react";
import useRaceAPI from "../hooks/useRaceAPI";
import useRaceWebSocket from "../hooks/useRaceWebSocket";

const VaultInfo = () => {
  const { race, vault, fetchVaultData } = useRaceAPI(); // ✅ Race toegevoegd
  const { vault: wsVault } = useRaceWebSocket(null);

  const [totalVault, setTotalVault] = useState<number>(0);

  // ✅ **Vault updaten via API**
  useEffect(() => {
    if (vault?.totalSol !== undefined) {
      setTotalVault(vault.totalSol);
    }
  }, [vault]);

  // ✅ **Vault live updaten via WebSocket**
  useEffect(() => {
    if (wsVault?.totalSol !== undefined) {
      setTotalVault(wsVault.totalSol);
    }
  }, [wsVault]);

  // ✅ **Vault ophalen bij eerste render als er een race is**
  useEffect(() => {
    if (race?.raceId) {
      console.log(`[DEBUG] 🔍 Fetching Vault for raceId: ${race.raceId}`);
      fetchVaultData(race.raceId); // ✅ Nu met correct `raceId`
    } else {
      console.warn("[DEBUG] ❌ No active raceId found, skipping Vault fetch.");
    }
  }, [race?.raceId, fetchVaultData]);

  return (
    <div className="bg-orange-400 bg-opacity-90 p-4 rounded-xl text-center my-4 text-lg font-semibold shadow-md">
      CURRENT VAULT: {totalVault.toFixed(2)} SOL
    </div>
  );
};

export default VaultInfo;
