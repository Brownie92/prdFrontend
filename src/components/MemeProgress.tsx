import React, { useMemo } from "react";

interface Meme {
  memeId: string;
  name: string;
  url: string;
  progress: number;
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

  // Compute max progress value to scale bars (memoized for efficiency)
  const maxProgress = useMemo(
    () => Math.max(...memes.map((m) => m.progress), 1),
    [memes]
  );

  return (
    <div className="space-y-2">
      {memes.map((meme) => {
        const progressWidth = Math.max((meme.progress / maxProgress) * 100, 10); // Ensure visibility

        return (
          <div key={meme.memeId} className="flex items-center mb-2">
            {/* Meme Image */}
            <img
              src={meme.url}
              alt={`Meme: ${meme.name}, progress: ${meme.progress}`}
              className="w-12 h-12 rounded-full mr-3 border-2 border-white shadow-lg"
            />

            {/* Progress Bar */}
            <div className="flex-1 bg-gray-300 rounded-full h-5 relative">
              <div
                className="bg-green-400 h-5 rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              ></div>
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
