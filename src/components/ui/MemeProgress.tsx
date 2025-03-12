import React, { useEffect, useMemo, useState } from "react";
import useRaceData from "../../hooks/useRaceData";
import ProgressBar from "./ProgressBar";
import BoostIcon from "./BoostIcon";
import SelectedMemeHighlighter from "./SelectedMemeHighlighter";

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
  selectedMeme: string; // Added selectedMeme
}

const MemeProgress: React.FC<MemeProgressProps> = ({
  memes,
  raceId,
  currentRound,
}) => {
  const { boosts, fetchBoostsData } = useRaceData();
  const [currentRoundBoosts, setCurrentRoundBoosts] = useState<
    Map<string, number>
  >(new Map());

  useEffect(() => {
    if (raceId && currentRound > 0) {
      fetchBoostsData(raceId, currentRound);
    }
  }, [raceId, currentRound, fetchBoostsData]);

  useEffect(() => {
    setCurrentRoundBoosts(
      new Map(
        Object.entries(boosts).map(([memeId, totalSol]) => [memeId, totalSol])
      )
    );
  }, [boosts]);

  const validatedMemes = useMemo(() => {
    return memes.map((meme) => ({
      ...meme,
      progress: typeof meme.progress === "number" ? meme.progress : 0,
      boostAmount: currentRoundBoosts.get(meme.memeId) || 0,
    }));
  }, [memes, currentRoundBoosts]);

  const sortedByBoost = useMemo(
    () =>
      [...validatedMemes].sort(
        (a, b) => (b.boostAmount ?? 0) - (a.boostAmount ?? 0)
      ),
    [validatedMemes]
  );

  const topBoosted = useMemo(
    () => sortedByBoost.slice(0, 3).filter((m) => m.boostAmount > 0),
    [sortedByBoost]
  );

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
        const rankPosition = rankIndex !== -1 ? rankIndex : null;

        return (
          <div
            key={meme.memeId}
            className="flex items-center space-x-3 transition-all duration-500"
          >
            <div className="relative">
              <img
                src={meme.url}
                alt={meme.name}
                className={`w-12 h-12 rounded-full transition-all duration-500 ${SelectedMemeHighlighter({ raceId, memeId: meme.memeId })}`}
              />
            </div>
            <ProgressBar progress={progressWidth} boostProgress={boostWidth} />
            <span className="ml-3 font-bold text-white flex items-center min-w-[50px] justify-end">
              {meme.progress}
              <BoostIcon
                boostAmount={meme.boostAmount ?? 0}
                rankIndex={rankPosition}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MemeProgress;
