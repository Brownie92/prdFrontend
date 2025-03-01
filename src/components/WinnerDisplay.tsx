import React from "react";
import SolVault from "./SolVault";

interface Winner {
  memeUrl: string;
  progress: number;
  createdAt: string;
}

const WinnerDisplay: React.FC<WinnerProps> = ({ winner }) => {
  if (!winner || !winner.memeUrl) {
    return (
      <div className="bg-orange-400 p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-white">
          No Winner Data Available
        </h2>
        <p className="text-lg text-white">
          Please wait for the next race results.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold text-white">Most Recent Winner</h2>

      {/* Winnaar afbeelding */}
      <img
        src={winner.memeUrl}
        alt="Winning Meme"
        className="w-32 h-32 mx-auto rounded-full mt-4 border-4 border-white shadow-lg"
      />

      {/* Winnaar details */}
      <p className="text-lg text-white mt-2">
        Progress: <span className="font-semibold">{winner.progress}</span>{" "}
        points
      </p>
      <p className="text-sm text-gray-200">
        Won on: {new Date(winner.createdAt).toLocaleDateString()}
      </p>

      {/* Placeholder voor toekomstige statistieken */}
      <SolVault totalVault={4.1} totalWinners={10} />
    </div>
  );
};

export default WinnerDisplay;
