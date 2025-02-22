import React from "react";
import SolVault from "./SolVault"; // ✅ SolVault importeren

interface WinnerProps {
  winner: {
    name: string;
    image: string;
    totalVault: number;
    totalWinners: number; // ✅ Deze property was niet meegegeven in SolVault
  };
}

const WinnerDisplay: React.FC<WinnerProps> = ({ winner }) => {
  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold">MOST RECENT WINNER:</h2>
      <h3 className="text-xl font-semibold">{winner.name}</h3>
      <img
        src={winner.image}
        alt={winner.name}
        className="w-32 h-32 mx-auto rounded-full mt-4"
      />

      {/* ✅ SolVault Component (NU MET totalWinners) */}
      <SolVault
        totalVault={winner.totalVault}
        totalWinners={winner.totalWinners}
      />
    </div>
  );
};

export default WinnerDisplay;
