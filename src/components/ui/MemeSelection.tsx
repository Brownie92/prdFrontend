import { useEffect, useState } from "react";
import PickMemeButton from "./PickMemeButton";
import SelectedMemeDisplay from "./SelectedMemeDisplay";
import ConnectButton from "./ConnectButton"; // ✅ Nieuwe import
import { useWallet } from "@solana/wallet-adapter-react";

interface Meme {
  memeId: string;
  url: string;
  name: string;
}

interface MemeSelectionProps {
  selectedMeme: string | null;
  setSelectedMeme: (id: string | null) => void;
  hasConfirmedMeme: boolean;
  setHasConfirmedMeme: (confirmed: boolean) => void;
  raceId: string;
}

const API_RACE_URL = `${import.meta.env.VITE_API_BASE_URL}/races/current`;

const MemeSelection: React.FC<MemeSelectionProps> = ({
  selectedMeme,
  setSelectedMeme,
  hasConfirmedMeme,
  setHasConfirmedMeme,
  raceId,
}) => {
  const { connected } = useWallet(); // ✅ Wallet-status ophalen
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_RACE_URL);
        if (!response.ok) throw new Error("Race niet gevonden");
        const data = await response.json();

        if (!Array.isArray(data.memes)) {
          throw new Error("Ongeldige memes data ontvangen.");
        }

        setMemes(data.memes);
      } catch (error) {
        console.error("[API] ❌ Fout bij ophalen memes:", error);
        setError("Fout bij laden van memes. Probeer opnieuw.");
      } finally {
        setLoading(false);
      }
    };

    fetchRaceData();
  }, []);

  if (loading)
    return <p className="text-center text-white">⏳ Memes laden...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="text-center">
      {hasConfirmedMeme ? (
        <SelectedMemeDisplay memeId={selectedMeme} memes={memes} />
      ) : (
        <div className="grid grid-cols-3 gap-4 my-4 place-items-center">
          {memes.map((meme) => (
            <button
              key={meme.memeId}
              onClick={() => setSelectedMeme(meme.memeId)}
              className={`rounded-full p-1 transition ${
                selectedMeme === meme.memeId
                  ? "ring-4 ring-green-400 scale-110"
                  : "hover:scale-105"
              }`}
              disabled={hasConfirmedMeme}
            >
              <img
                src={meme.url}
                alt={meme.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg bg-[#FFB877] p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* ✅ **Toon ConnectButton als de wallet NIET verbonden is** */}
      {!connected ? (
        <ConnectButton />
      ) : (
        <PickMemeButton
          selectedMeme={selectedMeme}
          setHasConfirmedMeme={setHasConfirmedMeme}
          raceId={raceId}
          hasConfirmedMeme={hasConfirmedMeme} // ✅ Nieuwe prop toevoegen
        />
      )}
    </div>
  );
};

export default MemeSelection;
