import React from "react";

interface PickMemeButtonProps {
  selectedMeme: string | null;
  setSelectedMeme: React.Dispatch<React.SetStateAction<string | null>>;
  connected: boolean;
  setVisible: (visible: boolean) => void;
}

const PickMemeButton: React.FC<PickMemeButtonProps> = ({
  selectedMeme,
  connected,
  setVisible,
}) => {
  return (
    <button
      onClick={() => {
        if (!connected) {
          setVisible(true); // ✅ Open wallet modal als wallet niet is verbonden
        } else {
          console.log(`Meme selected: ${selectedMeme}`);
        }
      }}
      className="w-full bg-green-400 text-white font-bold py-3 rounded-lg mt-4 hover:bg-green-500 transition shadow-md"
    >
      PICK YOUR MEME!
    </button>
  );
};

export default PickMemeButton;
