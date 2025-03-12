import { useState, useEffect } from "react";
import MemeSelection from "./ui/MemeSelection";
import { useWallet } from "@solana/wallet-adapter-react";
import RaceStatus from "./RaceStatus";
import WinnerDisplay from "./WinnerDisplay";
import MemeProgress from "./ui/MemeProgress";
import useRaceData from "../hooks/useRaceData";
import BoostMemeInput from "./ui/BoostMemeInput";

const RaceSection = () => {
  const { connected } = useWallet();
  const { race, winner, countdown, refreshWinnerData, refreshRaceData } =
    useRaceData();

  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const [hasConfirmedMeme, setHasConfirmedMeme] = useState<boolean>(false);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // ✅ **Race data ophalen bij eerste render**
  useEffect(() => {
    if (!initialized) {
      console.log("[INFO] Initializing race data...");
      refreshRaceData();
      setInitialized(true);
    }
  }, [initialized, refreshRaceData]);

  // ✅ **Schakel naar WinnerDisplay als de race is afgelopen of null is**
  useEffect(() => {
    if (!race || race.status === "closed") {
      console.log("[INFO] 🏁 Geen actieve race. WinnerDisplay tonen...");
      setShowWinner(true);
      refreshWinnerData();
      if (!race) {
        console.log("[INFO] 🔄 Race is null, opnieuw race data ophalen...");
        refreshRaceData(); // ✅ Forceer race refresh als race null is
      }
    } else {
      setShowWinner(false);
    }
  }, [race?.status, race?.currentRound, refreshWinnerData, refreshRaceData]);

  // ✅ **Debugging logs voor extra controle**
  useEffect(() => {
    console.log("[DEBUG] 🏁 Current Race:", race);
    console.log("[DEBUG] Selected Meme:", selectedMeme);
    console.log("[DEBUG] Has Confirmed Meme:", hasConfirmedMeme);
    console.log("[DEBUG] Current Round:", race?.currentRound);
    console.log("[DEBUG] Show Winner:", showWinner);
  }, [
    connected,
    race,
    selectedMeme,
    hasConfirmedMeme,
    race?.currentRound,
    showWinner,
  ]);

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

          {/* ✅ **MemeProgress en BoostMemeInput worden alleen in ronde 2-6 weergegeven** */}
          {race?.currentRound &&
            race.currentRound > 1 &&
            race.currentRound < 7 &&
            race.memes?.length > 0 && (
              <>
                <MemeProgress
                  memes={race.memes}
                  raceId={race?.raceId ?? ""}
                  currentRound={race?.currentRound ?? 0}
                  selectedMeme={selectedMeme ?? ""}
                />
                <BoostMemeInput
                  raceId={race?.raceId ?? ""}
                  currentRound={race?.currentRound ?? 0}
                />
              </>
            )}
        </>
      )}
    </div>
  );
};

export default RaceSection;
