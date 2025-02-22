import React from "react";

interface PickMemeButtonProps {
  selectedMeme: string | null;
  setSelectedMeme: (memeId: string | null) => void;
  connected: boolean; // ✅ Wallet status
  setVisible: (visible: boolean) => void; // ✅ Wallet modal functie
}

const PickMemeButton: React.FC<PickMemeButtonProps> = ({
  selectedMeme,
  setSelectedMeme,
  connected,
  setVisible,
}) => {
  return (
    <button
      onClick={() => {
        if (!connected) {
          setVisible(true); // ✅ Open wallet connect modal als wallet niet verbonden is
          return;
        }
        if (!selectedMeme) {
          console.warn("⚠️ Geen meme geselecteerd!");
          return;
        }
        console.log(`Meme selected: ${selectedMeme}`);
        setSelectedMeme(selectedMeme);
      }}
      className="w-full bg-green-400 text-white font-bold py-3 rounded-lg mt-4 hover:bg-green-400 transition shadow-md"
    >
      PICK YOUR MEME!
    </button>
  );
};

export default PickMemeButton;
