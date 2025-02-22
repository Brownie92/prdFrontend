import React from "react";

interface RaceStatusProps {
  currentRound: number | null;
  countdown: string;
}

const RaceStatus: React.FC<RaceStatusProps> = ({ currentRound, countdown }) => {
  return (
    <div className="flex justify-between text-lg font-semibold mb-3">
      <span>Round: {currentRound !== null ? currentRound : "Laden..."}</span>
      <span>Next round: {countdown}</span>
    </div>
  );
};

export default RaceStatus;
