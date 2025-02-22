import { useState } from "react";
import MemeSelection from "./MemeSelection";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import RaceStatus from "./RaceStatus";
import WinnerDisplay from "./WinnerDisplay";
import MemeProgress from "./MemeProgress";
import PickMemeButton from "./ui/PickMemeButton";
import useRaceData from "../hooks/useRaceData";

const RaceSection = () => {
  const { connected } = useWallet(); // ✅ Wallet status ophalen
  const { setVisible } = useWalletModal(); // ✅ Wallet connect modal
  const { race, winner, countdown } = useRaceData();
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg">
      {winner && winner.name && winner.image ? (
        <WinnerDisplay winner={winner} />
      ) : (
        <>
          <RaceStatus
            currentRound={race?.currentRound ?? 0}
            countdown={countdown}
          />

          {race && race.currentRound === 1 ? (
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
            />
          ) : (
            <div className="space-y-2">
              {race && race.currentRound > 1 && (
                <MemeProgress memes={race.memes} />
              )}
            </div>
          )}

          {/* ✅ Nu wordt de Wallet Connect correct verwerkt */}
          <PickMemeButton
            selectedMeme={selectedMeme}
            setSelectedMeme={setSelectedMeme}
            connected={connected} // ✅ Wallet status doorgeven
            setVisible={setVisible} // ✅ Wallet modal doorgeven
          />
        </>
      )}
    </div>
  );
};

export default RaceSection;
