import { useState } from "react";
import MemeSelection from "./MemeSelection";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

const RaceSection = () => {
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const { connected } = useWallet();
  const { setVisible } = useWalletModal(); // Wallet selection modal

  return (
    <div className="bg-orange-400 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between text-lg font-semibold mb-3">
        <span>Round: 1</span>
        <span>Next round: 00:00:00</span>
      </div>

      {/* Meme Selection */}
      <MemeSelection
        selectedMeme={selectedMeme}
        setSelectedMeme={setSelectedMeme}
      />

      {/* Pick Your Meme / Connect Wallet Button */}
      <button
        onClick={() => {
          if (!connected) {
            setVisible(true); // Open wallet modal if no wallet is connected
          } else {
            console.log(`Meme selected: ${selectedMeme}`);
          }
        }}
        className="w-full bg-green-400 text-white font-bold py-3 rounded-lg mt-4 hover:bg-green-400 transition shadow-md"
      >
        PICK YOUR MEME!
      </button>
    </div>
  );
};

export default RaceSection;
