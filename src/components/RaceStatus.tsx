import React, { useState, useEffect } from "react";

interface RaceStatusProps {
  currentRound: number | null;
  roundEndTime: string | null; // ✅ Haal de ronde eindtijd binnen als string
  status: string;
}

const formatCountdown = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours > 0 ? `${String(hours).padStart(2, "0")}:` : ""}${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const RaceStatus: React.FC<RaceStatusProps> = ({
  currentRound,
  roundEndTime,
  status,
}) => {
  const [countdown, setCountdown] = useState<string>("00:00");

  useEffect(() => {
    if (!roundEndTime) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = new Date(roundEndTime).getTime();
      const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

      setCountdown(formatCountdown(timeLeft));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [roundEndTime]);

  let statusMessage;

  if (currentRound === null) {
    statusMessage = "Loading...";
  } else if (status === "waiting") {
    statusMessage = "Meme racers loading...";
  } else if (currentRound >= 1 && currentRound < 7) {
    statusMessage = `Next round in: ${countdown}`;
  } else {
    statusMessage = "🏁 Race finished!";
  }

  return (
    <div className="flex justify-between text-lg font-semibold mb-3">
      <span>Round: {currentRound}</span>
      <span>{statusMessage}</span>
    </div>
  );
};

export default RaceStatus;
