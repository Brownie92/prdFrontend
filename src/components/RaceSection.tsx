import { useState } from "react";
import MemeSelection from "./MemeSelection";
import { useWallet } from "@solana/wallet-adapter-react";
import RaceStatus from "./RaceStatus";
import WinnerDisplay from "./WinnerDisplay";
import MemeProgress from "./MemeProgress";
import PickMemeButton from "./ui/PickMemeButton";
import useRaceData from "../hooks/useRaceData";

const RaceSection = () => {
  const { connected } = useWallet();
  const { race, winner, countdown } = useRaceData(); // ✅ Haalt race data op

  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg">
      {winner ? (
        <WinnerDisplay winner={winner} />
      ) : (
        <>
          {/* ✅ Voorkom undefined errors met veilige toegang */}
          <RaceStatus
            currentRound={race?.currentRound ?? 0} // ✅ Valt terug op 0 als `undefined`
            countdown={countdown}
          />

          {/* ✅ Voorkomt TypeScript fouten bij `race` */}
          {race?.currentRound === 1 ? (
            <MemeSelection
              selectedMeme={selectedMeme}
              setSelectedMeme={setSelectedMeme}
            />
          ) : (
            race?.currentRound &&
            race.currentRound > 1 && (
              <MemeProgress
                memes={
                  race.memes?.map((meme) => ({
                    ...meme,
                    boostAmount: meme.boostAmount ?? 0, // ✅ Zorgt ervoor dat het veld altijd aanwezig is
                    totalSol: meme.totalSol ?? 0, // ✅ Zorgt ervoor dat het veld altijd aanwezig is
                  })) ?? []
                }
              />
            )
          )}

          <PickMemeButton
            selectedMeme={selectedMeme}
            setSelectedMeme={setSelectedMeme}
            connected={connected}
            raceId={race?.raceId ?? ""} // ✅ Fallback naar lege string
          />
        </>
      )}
    </div>
  );
};

export default RaceSection;
