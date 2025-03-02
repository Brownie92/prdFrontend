import { useState, useEffect } from "react";
import MemeSelection from "./ui/MemeSelection";
import { useWallet } from "@solana/wallet-adapter-react";
import RaceStatus from "./RaceStatus";
import WinnerDisplay from "./WinnerDisplay";
import MemeProgress from "./ui/MemeProgress";
import PickMemeButton from "./ui/PickMemeButton";
import useRaceData from "../hooks/useRaceData";

const RaceSection = () => {
  const { connected } = useWallet();
  const { race, winner, countdown, refreshWinnerData, refreshRaceData } =
    useRaceData();
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // ✅ **Race data ophalen bij eerste render (alleen indien nodig)**
  useEffect(() => {
    if (!initialized) {
      console.log("[INFO] Initializing race data...");
      refreshRaceData();
      setInitialized(true);
    }
  }, [initialized, refreshRaceData]);

  // ✅ **Automatische UI-overgang tussen race en winnaar**
  useEffect(() => {
    if (race?.status === "closed") {
      console.log("[INFO] 🏁 Race closed. Fetching latest winner...");
      setShowWinner(true);
      refreshWinnerData();
    } else if (race?.currentRound && race.currentRound > 0) {
      console.log("[INFO] 🚀 Active race detected. Showing race view.");
      setShowWinner(false);
    } else {
      console.log("[INFO] ❌ No active race. Fetching latest winner.");
      setShowWinner(true);
      refreshWinnerData();
    }
  }, [race?.status]); // ✅ Alleen renderen als de race-status wijzigt

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg">
      {showWinner && winner ? (
        <WinnerDisplay winner={winner} />
      ) : (
        <>
          <RaceStatus
            currentRound={race?.currentRound ?? 0}
            countdown={countdown}
          />

          {/* ✅ Ronde 1: Meme Selection */}
          {race?.currentRound === 1 && (
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
            />
          )}

          {/* ✅ Ronde 2-6: Progressie tonen */}
          {race?.currentRound &&
            race.currentRound > 1 &&
            race.memes?.length > 0 && (
              <MemeProgress
                memes={race.memes.map((meme) => ({
                  ...meme,
                  boostAmount: meme.boostAmount ?? 0,
                }))}
              />
            )}

          {/* ✅ Meme Kiezen Knop (alleen zichtbaar in ronde 1) */}
          {race?.currentRound === 1 && (
            <PickMemeButton
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
              connected={connected}
              raceId={race?.raceId ?? ""}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RaceSection;
