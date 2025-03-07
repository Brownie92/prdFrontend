import React, { useEffect, useMemo, useState, useCallback } from "react";
import useRaceAPI from "../../hooks/useRaceAPI";
import useRaceWebSocket from "../../hooks/useRaceWebSocket";
import ProgressBar from "./ProgressBar";

interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
  boostAmount?: number;
}

interface MemeProgressProps {
  memes: Meme[];
  raceId: string;
  currentRound: number;
}

const MemeProgress: React.FC<MemeProgressProps> = ({
  memes,
  raceId,
  currentRound,
}) => {
  const { fetchBoostsData, apiBoosts } = useRaceAPI();
  const { race: wsRace, vault, wsBoosts } = useRaceWebSocket(null);
  const [vaultUpdated, setVaultUpdated] = useState<boolean>(false);

  useEffect(() => {
    console.log("[INFO] 🏁 Actieve Race ID:", raceId);
    console.log("[INFO] 🔄 Nieuwe ronde gedetecteerd:", currentRound);
  }, [raceId, currentRound]);

  const loadApiBoosts = useCallback(async () => {
    if (raceId && currentRound > 0) {
      console.log(
        `[API] 📡 Fetching boosts voor race ${raceId}, ronde ${currentRound}...`
      );

      const boostsData = await fetchBoostsData(raceId, currentRound);
      if (Array.isArray(boostsData)) {
        const groupedBoosts = boostsData.reduce(
          (acc: { [key: string]: number }, boost: any) => {
            acc[String(boost.memeId)] = boost.totalSol;
            return acc;
          },
          {}
        );

        console.log("[API] ✅ Boosts opgehaald via API:", groupedBoosts);
      } else {
        console.warn("[API] ⚠️ Geen boosts gevonden in API.");
      }
    }
  }, [raceId, currentRound, fetchBoostsData]);

  useEffect(() => {
    loadApiBoosts();
  }, [loadApiBoosts]);

  useEffect(() => {
    console.log("[INFO] 🛠️ Reset WebSocket & API boosts bij ronde-start.");
    loadApiBoosts();
  }, [currentRound]);

  useEffect(() => {
    if (wsRace?.memes) {
      console.log("[WS] 🚀 WebSocket boost update ontvangen:", wsRace.memes);

      console.log(
        "[MemeProgress] ✅ Boost state geüpdatet na WebSocket-update:",
        wsRace.memes
      );
    } else {
      console.warn("[WS] ⚠️ Geen WebSocket meme-data ontvangen.");
    }
  }, [wsRace?.memes]);

  useEffect(() => {
    if (vault) {
      console.log("[INFO] 💰 Vault-update ontvangen:", vault);
      setVaultUpdated(true);
    }
  }, [vault]);

  useEffect(() => {
    if (!wsRace) {
      console.log("[INFO] 🏆 Winner gedetecteerd, reset boosts...");
    }
  }, [wsRace]);

  const combinedBoosts = useMemo(() => {
    console.log("[MemeProgress] 🔍 Samenvoegen van API en WS boosts...");

    const mergedBoosts = { ...apiBoosts };
    Object.entries(wsBoosts).forEach(([memeId, boost]) => {
      mergedBoosts[memeId] = (mergedBoosts[memeId] ?? 0) + boost;
    });

    console.log(
      "[MemeProgress] ✅ Gecombineerde Boosts (API + WS):",
      mergedBoosts
    );
    return mergedBoosts;
  }, [apiBoosts, wsBoosts]);

  const validatedMemes = useMemo(() => {
    const combinedMemes = memes.map((meme) => ({
      ...meme,
      progress: typeof meme.progress === "number" ? meme.progress : 0,
      boostAmount: combinedBoosts[String(meme.memeId)] ?? 0,
    }));

    console.log(
      "[MemeProgress] 🏁 Race memes vóór boost merging:",
      JSON.stringify(memes, null, 2)
    );
    console.log("[MemeProgress] 🔄 Ontvangen API-boosts:", apiBoosts);
    console.log("[MemeProgress] 🔄 Ontvangen WebSocket-boosts:", wsBoosts);

    return combinedMemes;
  }, [memes, combinedBoosts, apiBoosts, wsBoosts]);

  const sortedByBoost = useMemo(
    () =>
      [...validatedMemes].sort(
        (a, b) => (b.boostAmount ?? 0) - (a.boostAmount ?? 0)
      ),
    [validatedMemes]
  );

  const topBoosted = sortedByBoost.slice(0, 3).filter((m) => m.boostAmount > 0);

  const rankingIcons: { [key: number]: string } = {
    0: "🥇",
    1: "🥈",
    2: "🥉",
  };

  const maxProgress = useMemo(
    () => Math.max(...validatedMemes.map((m) => m.progress ?? 0), 1),
    [validatedMemes]
  );

  const maxBoost = useMemo(
    () => Math.max(...validatedMemes.map((m) => m.boostAmount ?? 0), 1),
    [validatedMemes]
  );

  return (
    <div className="space-y-2">
      {sortedByBoost.map((meme) => {
        const progressWidth = Math.max((meme.progress / maxProgress) * 100, 10);
        const boostWidth =
          meme.boostAmount && maxBoost > 0
            ? Math.max((meme.boostAmount / maxBoost) * 100, 5)
            : 0;

        const rankIndex = topBoosted.findIndex((m) => m.memeId === meme.memeId);
        const boostIcon =
          rankIndex !== -1
            ? rankingIcons[rankIndex]
            : meme.boostAmount && meme.boostAmount > 0
              ? "🔥"
              : "";

        return (
          <div
            key={meme.memeId}
            className="flex items-center space-x-3 transition-all duration-500"
          >
            <img
              src={meme.url}
              alt={meme.name}
              className="w-12 h-12 rounded-full border-4 border-transparent transition-all duration-500"
            />
            <ProgressBar progress={progressWidth} boostProgress={boostWidth} />
            <span className="ml-3 font-bold text-white flex items-center min-w-[50px] justify-end">
              {meme.progress}{" "}
              <span className="ml-1 text-xl w-6 flex justify-center">
                {boostIcon ? boostIcon : ""}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MemeProgress;
