import { useState, useCallback, useEffect } from "react";

const API_RACE_URL = `${import.meta.env.VITE_API_BASE_URL}/races/current`;
const API_WINNER_URL = `${import.meta.env.VITE_API_BASE_URL}/winners/latest`;
const API_VAULT_URL = `${import.meta.env.VITE_API_BASE_URL}/vaults`;
const API_BOOSTS_URL = `${import.meta.env.VITE_API_BASE_URL}/boosts`;

// TypeScript interfaces
interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
  boostAmount: number;
}

interface Race {
  raceId: string;
  currentRound: number;
  roundEndTime?: string;
  status?: string;
  memes: Meme[];
}

interface Vault {
  raceId: string;
  totalSol: number;
}

interface Winner {
  memeUrl: string;
  progress: number;
  createdAt: string;
}

const useRaceAPI = () => {
  const [race, setRace] = useState<Race | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const [latestVault, setLatestVault] = useState<Vault | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBoosts, setApiBoosts] = useState<{ [key: string]: number }>({});

  const fetchWinnerData = useCallback(async () => {
    if (race && race.currentRound > 0) {
      console.log("[API] 🚀 Skipping winner fetch - active race detected.");
      return;
    }

    try {
      console.log("[API] 🔍 Fetching latest winner...");
      const response = await fetch(API_WINNER_URL);
      if (!response.ok) {
        console.warn("[API] ⚠️ No winner found.");
        return null;
      }
      const data: Winner = await response.json();
      console.log("[API] 🏆 Winner retrieved:", data);
      setWinner(data);
      return data;
    } catch (error) {
      console.error("[API] ❌ Error fetching winner:", error);
      return null;
    }
  }, [race]);

  const fetchVaultData = useCallback(async (raceId: string) => {
    try {
      if (!raceId || !raceId.startsWith("race")) {
        console.error("[API] ❌ Invalid raceId format for Vault fetch:", raceId);
        return null;
      }

      console.log(`[API] 💰 Fetching Vault for Race ID: ${raceId}`);
      const response = await fetch(`${API_VAULT_URL}/${raceId}`);

      if (!response.ok) {
        console.warn(`[API] ⚠️ Vault not found for raceId: ${raceId}`);
        return null;
      }

      const data: Vault = await response.json();
      console.log("[API] ✅ Vault data retrieved:", data);
      setVault(data);
      return data;
    } catch (error) {
      console.error("[API] ❌ Error fetching vault:", error);
      setVault(null);
      return null;
    }
  }, []);

  const fetchLatestActiveVaultData = useCallback(async () => {
    try {
      console.log("[API] 🔍 Fetching latest active race vault...");
      const response = await fetch(`${API_VAULT_URL}/active`);

      if (!response.ok) {
        console.warn("[API] ⚠️ No active vault found.");
        return null;
      }

      const data: Vault = await response.json();
      console.log("[API] ✅ Latest Active Vault data retrieved:", data);
      setVault(data);
      return data;
    } catch (error) {
      console.error("[API] ❌ Error fetching latest active vault:", error);
      setVault(null);
      return null;
    }
  }, []);

  const fetchLatestVaultData = useCallback(async () => {
    try {
      console.log("[API] 🔍 Fetching latest closed race vault...");
      const response = await fetch(`${API_VAULT_URL}/latest`);

      if (!response.ok) {
        console.warn("[API] ⚠️ No closed vault found.");
        return null;
      }

      const data: Vault = await response.json();
      console.log("[API] ✅ Latest Vault data retrieved:", data);
      setLatestVault(data);
      return data;
    } catch (error) {
      console.error("[API] ❌ Error fetching latest vault:", error);
      setLatestVault(null);
      return null;
    }
  }, []);

  const fetchRaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[API] 🏁 Calling fetchRaceData...");
      const response = await fetch(API_RACE_URL);
      if (!response.ok) throw new Error("Race not found");

      const data: Race = await response.json();
      console.log("[API] 🔄 Race API response received:", data);

      if (!data.raceId) {
        console.error("[ERROR] ❌ Race received without raceId!", data);
        return;
      }

      if (data.currentRound && data.currentRound > 0) {
        console.log("[API] ✅ Active race found, updating state.");
        setRace(data);
        console.log("[API] ✅ Race state updated successfully:", data);
        setWinner(null);

        console.log("[API] 🔄 Fetching Vault for active race...");
        await fetchVaultData(data.raceId);
      } else {
        console.log("[API] ⚠️ No active race found, fetching latest winner...");
        await fetchWinnerData();
        await fetchLatestVaultData();
      }
    } catch (error) {
      console.error("[API] ❌ Error fetching race:", error instanceof Error ? error.message : error);
      setError("Race not found. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [fetchWinnerData, fetchVaultData, fetchLatestVaultData]);

  const fetchBoostsData = useCallback(async (raceId: string, round: number) => {
    try {
      console.log(`[API] 📡 Fetching boosts voor race ${raceId}, ronde ${round}...`);
      const response = await fetch(`${API_BOOSTS_URL}/${raceId}/${round}`);
  
      if (!response.ok) {
        console.warn(`[API] ⚠️ No boosts found for race ${raceId}, round ${round}`);
        return null;
      }
  
      const data = await response.json();
      console.log("[API] ✅ Boost data retrieved:", data.boosts);
  
      // Groepeer boosts per memeId
      const groupedBoosts = data.boosts.reduce((acc: { [key: string]: number }, boost: any) => {
        acc[String(boost.memeId)] = boost.totalSol;
        return acc;
      }, {});
  
      console.log("[API] 🔄 Gecombineerde Boosts na ophalen:", groupedBoosts);
      setApiBoosts(groupedBoosts);
      return groupedBoosts;
    } catch (error) {
      console.error("[API] ❌ Error fetching boosts:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (race && race.raceId && race.currentRound > 0) {
      console.log(`[API] 🔄 Nieuwe race/ronde gedetecteerd. Fetching boosts voor race ${race.raceId}, ronde ${race.currentRound}...`);
      fetchBoostsData(race.raceId, race.currentRound);
    }
  }, [race?.raceId, race?.currentRound]);

  return {
    race,
    vault,
    latestVault,
    winner,
    loading,
    error,
    apiBoosts, // ✅ Nu beschikbaar in andere hooks/components
    fetchRaceData,
    fetchWinnerData,
    fetchVaultData,
    fetchLatestActiveVaultData,
    fetchLatestVaultData,
    fetchBoostsData,
  };
};

export default useRaceAPI;