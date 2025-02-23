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

  // ✅ Zorg ervoor dat selectedMeme correct wordt bijgehouden
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  const memoizedRace = useMemo(() => race, [race]); // 🔥 Voorkomt overbodige renders

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg">
      {winner && winner.name && winner.image ? (
        <WinnerDisplay winner={winner} />
      ) : (
        <>
          <RaceStatus
            currentRound={memoizedRace?.currentRound ?? 0}
            countdown={countdown}
          />
          {memoizedRace?.currentRound === 1 ? (
            // ✅ Fix: Props correct doorgegeven aan MemeSelection
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
            />
          ) : (
            <div className="space-y-2">
              {memoizedRace && memoizedRace.currentRound > 1 && (
                <MemeProgress memes={memoizedRace.memes} />
              )}
            </div>
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
