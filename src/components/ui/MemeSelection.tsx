import { useEffect, useState } from "react";
import { useWebSocket } from "../../context/WebSocketProvider";

interface Meme {
  memeId: string;
  url: string;
  name: string;
}

interface MemeSelectionProps {
  selectedMeme: string | null;
  setSelectedMeme: (id: string | null) => void;
}

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/races/current`;

const MemeSelection: React.FC<MemeSelectionProps> = ({
  selectedMeme,
  setSelectedMeme,
}) => {
  const { socket } = useWebSocket();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Race niet gevonden");
        const data = await response.json();

        if (!data.memes || !Array.isArray(data.memes)) {
          throw new Error("Ongeldige memes data ontvangen.");
        }

        setMemes(data.memes);
        console.log("[API] ✅ Memes geladen:", data.memes);
      } catch (error) {
        console.error("[API] ❌ Fout bij ophalen memes:", error);
        setError("Fout bij laden van memes. Probeer opnieuw.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRaceUpdate = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (
          message.event === "raceUpdate" &&
          Array.isArray(message.data.memes)
        ) {
          setMemes(message.data.memes);
          console.log("[WS] 🔄 Meme lijst geüpdatet via WebSocket.");
        }
      } catch (error) {
        console.error(
          "[WS] ❌ Fout bij verwerken WebSocket raceUpdate:",
          error
        );
      }
    };

    socket.addEventListener("message", handleRaceUpdate);
    return () => {
      socket.removeEventListener("message", handleRaceUpdate);
    };
  }, [socket]);

  if (loading) {
    return <p className="text-center text-white">⏳ Memes laden...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-4 my-4 place-items-center">
      {memes.length > 0 ? (
        memes.map((meme) => (
          <button
            key={meme.memeId}
            onClick={() => setSelectedMeme(meme.memeId)}
            className={`rounded-full p-1 transition ${
              selectedMeme === meme.memeId
                ? "ring-4 ring-green-400 scale-110"
                : "hover:scale-105"
            }`}
            aria-label={`Select meme: ${meme.name}`}
          >
            <img
              src={meme.url}
              alt={meme.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg bg-[#FFB877] p-1"
            />
          </button>
        ))
      ) : (
        <p className="text-center text-white">❌ Geen memes beschikbaar</p>
      )}
    </div>
  );
};

export default MemeSelection;
