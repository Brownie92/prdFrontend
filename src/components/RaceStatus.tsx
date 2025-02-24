import React from "react";

interface RaceStatusProps {
  currentRound: number | null;
  countdown: string;
}

const RaceStatus: React.FC<RaceStatusProps> = ({ currentRound, countdown }) => {
  return (
    <div className="flex justify-between text-lg font-semibold mb-3">
      <span>Round: {currentRound !== null ? currentRound : "Loading..."}</span>
      <span>Next round in: {countdown || "Calculating..."}</span>
    </div>
  );
};

export default RaceStatus;
