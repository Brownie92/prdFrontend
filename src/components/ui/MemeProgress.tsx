import React, { useMemo } from "react";
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
}

const MemeProgress: React.FC<MemeProgressProps> = ({ memes }) => {
  if (!memes.length) {
    return (
      <p className="text-center text-white">No progress data available.</p>
    );
  }

  // ✅ Zorg ervoor dat boostAmount nooit undefined is
  const validatedMemes = memes.map((meme) => ({
    ...meme,
    progress: typeof meme.progress === "number" ? meme.progress : 0,
    boostAmount: typeof meme.boostAmount === "number" ? meme.boostAmount : 0,
  }));

  console.log("[DEBUG] Incoming memes:", memes);
  console.log("[DEBUG] Validated memes:", validatedMemes);

  // ✅ Sorteer op boostAmount per ronde
  const sortedByBoost = [...validatedMemes].sort(
    (a, b) => (b.boostAmount ?? 0) - (a.boostAmount ?? 0)
  );

  console.log("[DEBUG] Sorted by Boost:", sortedByBoost);

  // ✅ Alleen top 3 tonen als er daadwerkelijk boosts zijn geweest
  const topBoosted = sortedByBoost.slice(0, 3).filter((m) => m.boostAmount > 0);

  console.log("[DEBUG] Top Boosted Memes:", topBoosted);

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
            : 0; // ✅ Fix voor crash

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
