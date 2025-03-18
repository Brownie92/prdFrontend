import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface SelectedMemeHighlighterProps {
  raceId: string;
  memeId: string;
}

const SelectedMemeHighlighter: React.FC<SelectedMemeHighlighterProps> = ({
  raceId,
  memeId,
}) => {
  const { publicKey } = useWallet();
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedMeme = async () => {
      if (!publicKey || !raceId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}${import.meta.env.VITE_API_PARTICIPANT_CHECK}/${raceId}/${publicKey.toString()}`
        );
        if (!response.ok) return;

        const data = await response.json();
        setSelectedMeme(data.memeId);
      } catch (error) {
        console.error("Error fetching selected meme:", error);
      }
    };

    fetchSelectedMeme();
  }, [publicKey, raceId]);

  // Check if the current meme is the selected one
  return selectedMeme === memeId
    ? "border-green-400 border-4 shadow-lg relative"
    : "";
};

export default SelectedMemeHighlighter;
