import React from "react";
import SolVault from "./SolVault";

interface WinnerProps {
  winner: {
    name: string;
    image: string;
    totalVault: number;
    totalWinners: number;
  };
}

const WinnerDisplay: React.FC<WinnerProps> = ({ winner }) => {
  if (!winner || !winner.name || !winner.image) {
    return (
      <div className="bg-orange-400 p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold">No Winner Data Available</h2>
        <p className="text-lg">Please wait for the next race results.</p>
      </div>
    );
  }

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold">Most Recent Winner</h2>
      <h3 className="text-xl font-semibold">{winner.name}</h3>
      <img
        src={winner.image}
        alt={winner.name}
        className="w-32 h-32 mx-auto rounded-full mt-4"
      />

      {/* Display SolVault statistics */}
      <SolVault
        totalVault={winner.totalVault}
        totalWinners={winner.totalWinners}
      />
    </div>
  );
};

export default WinnerDisplay;
