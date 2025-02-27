import React, { useMemo } from "react";

interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
  boostAmount?: number;
  totalSol?: number;
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

  // ✅ Sorteer memes op totalSol om de top 3 te bepalen
  const sortedByBoost = [...memes].sort(
    (a, b) => (b.totalSol ?? 0) - (a.totalSol ?? 0)
  );
  const topBoosted = sortedByBoost
    .slice(0, 3)
    .filter((meme) => (meme.totalSol ?? 0) > 0);

  // ✅ Rangen toekennen (mits er genoeg boosts zijn)
  const medalClasses: { [key: number]: string } = {
    0: "border-yellow-400", // 🥇 Goud
    1: "border-gray-400", // 🥈 Zilver
    2: "border-orange-500", // 🥉 Brons
  };

  // ✅ Max progress bepalen voor schaal van progress bars
  const maxProgress = useMemo(
    () => Math.max(...memes.map((m) => m.progress), 1),
    [memes]
  );

  // ✅ Max boost bepalen voor correcte schaal boost-balk
  const maxBoost = useMemo(
    () => Math.max(...memes.map((m) => m.boostAmount ?? 0), 1),
    [memes]
  );

  return (
    <div className="space-y-2">
      {memes.map((meme) => {
        const progressWidth = Math.max((meme.progress / maxProgress) * 100, 10); // Min 10% zichtbaar
        const boostWidth = meme.boostAmount
          ? Math.max((meme.boostAmount / maxBoost) * 100, 5)
          : 0; // Min 5% zichtbaar
        const rankIndex = topBoosted.findIndex((m) => m.memeId === meme.memeId);
        const borderColor =
          rankIndex !== -1 ? medalClasses[rankIndex] : "border-transparent";

        return (
          <div key={meme.memeId} className="flex items-center mb-2">
            {/* Meme Image met rand als boost */}
            <img
              src={meme.url}
              alt={`Meme: ${meme.name}`}
              className={`w-12 h-12 rounded-full mr-3 border-4 shadow-lg ${borderColor}`}
            />

            {/* Progress Bar met boost */}
            <div className="flex-1 bg-gray-300 rounded-full h-5 relative">
              {/* Overal progress */}
              <div
                className="bg-green-400 h-5 rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              ></div>
              {/* Boost progress */}
              {boostWidth > 0 && (
                <div
                  className="bg-purple-500 h-5 rounded-full absolute left-0"
                  style={{ width: `${boostWidth}%` }}
                ></div>
              )}
            </div>

            {/* Progress Value */}
            <span className="ml-3 font-bold text-white">{meme.progress}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MemeProgress;
