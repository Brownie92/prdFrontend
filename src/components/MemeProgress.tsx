import React from "react";

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
  if (!memes || memes.length === 0) {
    return (
      <p className="text-center text-white">
        🚨 Geen progressiegegevens beschikbaar.
      </p>
    );
  }

  // ✅ Hoogste progressie bepalen voor schaalverdeling
  const maxProgress = Math.max(...memes.map((meme) => meme.progress), 1);

  return (
    <div className="space-y-2">
      {memes.map((meme) => {
        // ✅ Bereken de breedte van de progressiebalk
        const progressWidth = Math.max((meme.progress / maxProgress) * 100, 10); // Minimaal 10% breed

        return (
          <div key={meme.memeId} className="flex items-center mb-2">
            {/* ✅ Meme afbeelding */}
            <img
              src={meme.url}
              alt={meme.name}
              className="w-12 h-12 rounded-full mr-3 border-2 border-white shadow-lg"
            />

            {/* ✅ Progressiebalk */}
            <div className="flex-1 bg-gray-300 rounded-full h-5 relative">
              <div
                className="bg-green-400 h-5 rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              ></div>
            </div>

            {/* ✅ Progressiewaarde */}
            <span className="ml-3 font-bold text-white">{meme.progress}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MemeProgress;
