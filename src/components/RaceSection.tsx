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

  // ✅ **Fetch race data on initial render**
  useEffect(() => {
    if (!initialized) {
      refreshRaceData();
      setInitialized(true);
    }
  }, [initialized, refreshRaceData]);

  // ✅ **Switch to WinnerDisplay if the race is finished or null**
  useEffect(() => {
    if (!race || race.status === "closed") {
      setShowWinner(true);
      refreshWinnerData();
      if (!race) {
        refreshRaceData(); // ✅ Force race refresh if race is null
      }
    } else {
      setShowWinner(false);
    }
  }, [race?.status, race?.currentRound, refreshWinnerData, refreshRaceData]);

  // ✅ **Debugging logs for additional verification**
  useEffect(() => {}, [
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

          {/* ✅ **MemeSelection is displayed only in round 1** */}
          {race?.currentRound === 1 && (
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
              hasConfirmedMeme={hasConfirmedMeme}
              setHasConfirmedMeme={setHasConfirmedMeme}
              raceId={race?.raceId ?? ""}
            />
          )}

          {/* ✅ **MemeProgress and BoostMemeInput are displayed only in rounds 2-6** */}
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
