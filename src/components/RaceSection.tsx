import { useState, useEffect } from "react";
import MemeSelection from "./ui/MemeSelection";
import { useWallet } from "@solana/wallet-adapter-react";
import RaceStatus from "./RaceStatus";
import WinnerDisplay from "./WinnerDisplay";
import MemeProgress from "./ui/MemeProgress";
import useRaceData from "../hooks/useRaceData";

const RaceSection = () => {
  const { connected } = useWallet();
  const { race, winner, countdown, refreshWinnerData, refreshRaceData } =
    useRaceData();

  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const [hasConfirmedMeme, setHasConfirmedMeme] = useState<boolean>(false);
  const [showWinner, setShowWinner] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // ✅ **Race data ophalen bij eerste render**
  useEffect(() => {
    if (!initialized) {
      console.log("[INFO] Initializing race data...");
      refreshRaceData();
      setInitialized(true);
    }
  }, [initialized, refreshRaceData]);

  // ✅ **Schakel tussen winnaar en race zonder extra API-calls**
  useEffect(() => {
    if (race?.currentRound && race.currentRound > 0) {
      console.log("[INFO] 🚀 Active race detected. Switching to race view.");
      setShowWinner(false);
    } else {
      console.log("[INFO] 🏁 No active race. Fetching latest winner...");
      setShowWinner(true);
      refreshWinnerData();
    }
  }, [race?.raceId, race?.currentRound]);

  // ✅ **Extra Debugging voor wallet connect & ronde 1**
  useEffect(() => {
    console.log("[DEBUG] Wallet Connected Status:", connected);
    console.log("[DEBUG] Selected Meme:", selectedMeme);
    console.log("[DEBUG] Has Confirmed Meme:", hasConfirmedMeme);
    console.log("[DEBUG] Current Round:", race?.currentRound);
  }, [connected, selectedMeme, hasConfirmedMeme, race?.currentRound]);

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

          {/* ✅ **MemeSelection wordt alleen in ronde 1 weergegeven** */}
          {race?.currentRound === 1 && (
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
              hasConfirmedMeme={hasConfirmedMeme}
              setHasConfirmedMeme={setHasConfirmedMeme}
              raceId={race?.raceId ?? ""}
            />
          )}

          {/* ✅ **MemeProgress wordt alleen in ronde 2-6 weergegeven** */}
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
        </>
      )}
    </div>
  );
};

export default RaceSection;
