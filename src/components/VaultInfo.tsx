import { useEffect, useState } from "react";
import useRaceAPI from "../hooks/useRaceAPI";
import useRaceWebSocket from "../hooks/useRaceWebSocket";

const VaultInfo = () => {
  const { race, vault, fetchVaultData, fetchLatestActiveVaultData } =
    useRaceAPI();
  const { vault: wsVault, race: wsRace } = useRaceWebSocket(null);

  const [totalVault, setTotalVault] = useState<number | null>(null);

  // ✅ **Stap 1: Haal Vault data op zodra race verandert**
  useEffect(() => {
    if (race?.raceId) {
      console.log(`[DEBUG] ✅ Actieve race gevonden: ${race.raceId}`);
      console.log(`[DEBUG] 🔍 Fetching Vault for raceId: ${race.raceId}`);
      fetchVaultData(race.raceId);
    } else {
      console.warn(
        "[DEBUG] ❌ Geen actieve race gevonden, ophalen laatste actieve Vault..."
      );
      fetchLatestActiveVaultData();
    }
  }, [race?.raceId, fetchVaultData, fetchLatestActiveVaultData]);

  // ✅ **Stap 2: API Vault Data verwerken**
  useEffect(() => {
    console.log(`[DEBUG] 🔄 Checking API Vault state:`, vault);
    if (vault?.totalSol !== undefined) {
      console.log(`[DEBUG] 🏦 Vault updated from API: ${vault.totalSol} SOL`);
      setTotalVault(vault.totalSol);
    } else {
      console.warn("[DEBUG] ❌ Geen geldige Vault data ontvangen van API.");
      setTotalVault(null);
    }
  }, [vault]);

  // ✅ **Stap 3: Real-time WebSocket Updates**
  useEffect(() => {
    if (wsVault?.totalSol !== undefined) {
      console.log(`[DEBUG] 🔥 WebSocket Vault Update: ${wsVault.totalSol} SOL`);
      setTotalVault(wsVault.totalSol);
    } else {
      console.warn("[DEBUG] ⚠️ Geen geldige WebSocket Vault data ontvangen.");
    }
  }, [wsVault]);

  // ✅ **Stap 4: Luister naar nieuwe race events**
  useEffect(() => {
    if (wsRace?.raceId) {
      console.log(`[DEBUG] 🏁 Nieuwe race gestart: ${wsRace.raceId}`);
      console.log(
        `[DEBUG] 🔄 Opnieuw ophalen van Vault-data voor raceId: ${wsRace.raceId}`
      );
      fetchVaultData(wsRace.raceId);
    }
  }, [wsRace?.raceId, fetchVaultData]);

  // Reset de Vault bij een gesloten race
  useEffect(() => {
    if (race?.status === "closed") {
      console.log("[DEBUG] 🏁 Race is gesloten. Resetting vault...");
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
