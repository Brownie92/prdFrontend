import { useEffect, useState } from "react";
import PickMemeButton from "./PickMemeButton";
import SelectedMemeDisplay from "./SelectedMemeDisplay";
import ConnectButton from "./ConnectButton";
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

const API_RACE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_RACE_CURRENT}`;
const API_CHECK_PARTICIPANT = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PARTICIPANT_CHECK}`;

const MemeSelection: React.FC<MemeSelectionProps> = ({
  selectedMeme,
  setSelectedMeme,
  hasConfirmedMeme,
  setHasConfirmedMeme,
  raceId,
}) => {
  const { connected, publicKey } = useWallet();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_RACE_URL);
        if (!response.ok) throw new Error("Race not found");
        const data = await response.json();

        if (!Array.isArray(data.memes)) {
          throw new Error("Invalid memes data received.");
        }

        setMemes(data.memes);
      } catch (error) {
        setError("Error loading memes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRaceData();
  }, []);

  useEffect(() => {
    if (connected && publicKey && raceId) {
      const checkExistingParticipant = async () => {
        try {
          const response = await fetch(
            `${API_CHECK_PARTICIPANT}/${raceId}/${publicKey.toString()}`
          );
          const data = await response.json();

          if (data.exists) {
            setSelectedMeme(data.memeId);
            setHasConfirmedMeme(true); // Prevents the button from remaining visible
          }
        } catch (error) {
          console.error("Error checking participant:", error);
        }
      };

      checkExistingParticipant();
    }
  }, [connected, publicKey, raceId]);

  if (loading)
    return <p className="text-center text-white">⏳ Loading memes...</p>;
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

      {!connected ? (
        <ConnectButton />
      ) : (
        <PickMemeButton
          selectedMeme={selectedMeme}
          setHasConfirmedMeme={setHasConfirmedMeme}
          raceId={raceId}
          hasConfirmedMeme={hasConfirmedMeme}
        />
      )}
    </div>
  );
};

export default MemeSelection;
