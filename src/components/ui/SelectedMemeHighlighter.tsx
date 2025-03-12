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
      if (!publicKey || !raceId) {
        console.warn("[DEBUG] ❌ Missing publicKey or raceId, skipping fetch");
        return;
      }

      try {
        console.log(
          `[DEBUG] 🔄 Fetching selected meme for wallet: ${publicKey.toString()} in race: ${raceId}`
        );

        const response = await fetch(
          `${API_BASE_URL}/participants/check/${raceId}/${publicKey.toString()}`
        );

        if (!response.ok) {
          console.warn("[API] ⚠️ No meme found for this user.");
          return;
        }

        const data = await response.json();
        console.log("[DEBUG] ✅ Selected meme data:", data);

        if (data.memeId) {
          setSelectedMeme(data.memeId);
        } else {
          console.warn("[DEBUG] ❌ No memeId found in API response.");
        }
      } catch (error) {
        console.error("[API] ❌ Error fetching selected meme:", error);
      }
    };

    fetchSelectedMeme();
  }, [publicKey, raceId]);

  // ✅ Controleer of de huidige meme de geselecteerde meme is
  const isSelected = selectedMeme === memeId;

  return isSelected ? "border-green-400 border-4 shadow-lg relative" : "";
};

export default SelectedMemeHighlighter;
