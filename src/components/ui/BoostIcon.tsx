import React from "react";

interface BoostIconProps {
  boostAmount: number;
  rankIndex: number | null;
}

const rankingIcons: { [key: number]: string } = { 0: "🥇", 1: "🥈", 2: "🥉" };

const BoostIcon: React.FC<BoostIconProps> = ({ boostAmount, rankIndex }) => {
  let icon = "";

  if (rankIndex !== null && rankIndex in rankingIcons) {
    icon = rankingIcons[rankIndex]; // 🥇🥈🥉 voor de top 3
  } else if (boostAmount > 0) {
    icon = "🔥"; // 🔥 voor andere boosts
  }

  return <span className="ml-1 text-xl w-6 flex justify-center">{icon}</span>;
};

export default BoostIcon;
