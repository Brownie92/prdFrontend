import { useState, useCallback, useEffect } from "react";
import useRaceWebSocket from "./useRaceWebSocket";

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

  const { wsBoosts } = useRaceWebSocket(race);

  const fetchWinnerData = useCallback(async () => {
    if (race && race.currentRound > 0) return;

    try {
      const response = await fetch(API_WINNER_URL);
      if (!response.ok) return null;

      const data: Winner = await response.json();
      setWinner(data);
      return data;
    } catch (error) {
      //console.error("[API] ❌ Error fetching winner:", error);
      return null;
    }
  }, [race]);

  const fetchVaultData = useCallback(async (raceId: string) => {
    try {
      if (!raceId.startsWith("race")) return null;

      const response = await fetch(`${API_VAULT_URL}/${raceId}`);
      if (!response.ok) return null;

      const data: Vault = await response.json();
      setVault(data);
      return data;
    } catch (error) {
      //console.error("[API] ❌ Error fetching vault:", error);
      setVault(null);
      return null;
    }
  }, []);

  const fetchLatestVaultData = useCallback(async () => {
    try {
      const response = await fetch(`${API_VAULT_URL}/latest`);
      if (!response.ok) return null;

      const data: Vault = await response.json();
      setLatestVault(data);
      return data;
    } catch (error) {
      //console.error("[API] ❌ Error fetching latest vault:", error);
      setLatestVault(null);
      return null;
    }
  }, []);

  const fetchRaceData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_RACE_URL);
      if (!response.ok) throw new Error("Race not found");

      const data: Race = await response.json();
      if (!data.raceId) return;

      setRace(data);
      setWinner(null);
      await fetchVaultData(data.raceId);
    } catch (error) {
      //console.error("[API] ❌ Error fetching race:", error);
      setError("Race not found.");
    } finally {
      setLoading(false);
    }
  }, [fetchVaultData]);

  const fetchBoostsData = useCallback(async (raceId: string, round: number) => {
    if (!raceId || round <= 0) return {};

    try {
      const response = await fetch(`${API_BOOSTS_URL}/${raceId}/${round}`);

      if (!response.ok) {
        return {};
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.boosts) || data.boosts.length === 0) {
        return {};
      }

      const formattedBoosts = data.boosts.reduce(
        (acc: Record<string, number>, boost: { memeId: string; totalSol: number }) => {
          acc[boost.memeId] = boost.totalSol;
          return acc;
        },
        {} as Record<string, number>
      );

      setApiBoosts(formattedBoosts);
      return formattedBoosts;
    } catch (error) {
      //console.error("[API] ❌ Error fetching boosts:", error);
      return {};
    }
  }, []);

  const fetchLatestActiveVaultData = useCallback(async () => {
    try {
      const response = await fetch(`${API_VAULT_URL}/active`);
      if (!response.ok) return null;
  
      const data: Vault = await response.json();
      setVault(data);
      return data;
    } catch (error) {
      //console.error("[API] ❌ Error fetching latest active vault:", error);
      setVault(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (race?.raceId && race.currentRound > 0) {
      if (!wsBoosts || Object.keys(wsBoosts).length === 0) {
        fetchBoostsData(race.raceId, race.currentRound).then(setApiBoosts);
      }
    }
  }, [race?.raceId, race?.currentRound, fetchBoostsData, wsBoosts]);

  useEffect(() => {
    setApiBoosts((prevBoosts) => ({ ...prevBoosts, ...(wsBoosts || {}) }));
  }, [wsBoosts]);

  return {
    race,
    vault,
    latestVault,
    winner,
    loading,
    error,
    apiBoosts,
    fetchRaceData,
    fetchWinnerData,
    fetchVaultData,
    fetchLatestVaultData,
    fetchLatestActiveVaultData,
    fetchBoostsData,
  };
};

export default useRaceAPI;