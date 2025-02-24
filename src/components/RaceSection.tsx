import { useState, useMemo } from "react";
import MemeSelection from "./MemeSelection";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import RaceStatus from "./RaceStatus";
import WinnerDisplay from "./WinnerDisplay";
import MemeProgress from "./MemeProgress";
import PickMemeButton from "./ui/PickMemeButton";
import useRaceData from "../hooks/useRaceData";

const RaceSection = () => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { race, winner, countdown } = useRaceData();
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  // ✅ Ensure memoization prevents unnecessary re-renders
  const memoizedRace = useMemo(() => race ?? null, [race]);

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg">
      {winner ? (
        <WinnerDisplay winner={winner} />
      ) : (
        <>
          <RaceStatus
            currentRound={memoizedRace?.currentRound ?? 0}
            countdown={countdown}
          />

          {memoizedRace && memoizedRace.currentRound === 1 ? (
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
            />
          ) : (
            memoizedRace &&
            memoizedRace.currentRound > 1 && (
              <MemeProgress memes={memoizedRace.memes ?? []} />
            )
          )}

          <PickMemeButton
            selectedMeme={selectedMeme}
            setSelectedMeme={setSelectedMeme}
            connected={connected}
            setVisible={setVisible}
          />
        </>
      )}
    </div>
  );
};

export default RaceSection;
