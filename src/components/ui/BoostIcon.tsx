import React from "react";

interface BoostIconProps {
  boostAmount: number;
  rankIndex: number | null;
}

const rankingIcons: { [key: number]: string } = { 0: "🥇", 1: "🥈", 2: "🥉" };

const BoostIcon: React.FC<BoostIconProps> = ({ boostAmount, rankIndex }) => {
  let icon = "";

  if (rankIndex !== null && rankIndex in rankingIcons) {
    icon = rankingIcons[rankIndex];
  } else if (boostAmount > 0) {
    icon = "🔥";
  }

  return <span className="ml-1 text-xl w-6 flex justify-center">{icon}</span>;
};

export default BoostIcon;
