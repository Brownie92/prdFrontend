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

  // ✅ **Schakel tussen winnaar en race zonder extra API-calls**
  useEffect(() => {
    if (race && race.currentRound > 0) {
      console.log("[INFO] Active race found, switching to race view.");
      setShowWinner(false);
    } else if (!race || race.currentRound === 0) {
      console.log("[INFO] No active race, showing latest winner.");
      setShowWinner(true);
      refreshWinnerData(); // ✅ Laatste winnaar ophalen
    }
  }, [race?.raceId, race?.currentRound]);

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

          {/* ✅ Fix voor ronde 1 */}
          {race?.currentRound === 1 && (
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
            />
          )}

          {/* ✅ Fix voor ronde 2-6 */}
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

          {/* ✅ Pick Meme Button (alleen zichtbaar in ronde 1) */}
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
