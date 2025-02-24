import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketProvider";

// ✅ TypeScript interface voor memes
interface Meme {
  memeId: string;
  url: string;
  name: string;
}

// ✅ Props voor MemeSelection component
interface MemeSelectionProps {
  selectedMeme: string | null;
  setSelectedMeme: (id: string | null) => void;
}

// ✅ API URL uit .env bestand
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/races/current`;

const MemeSelection: React.FC<MemeSelectionProps> = ({
  selectedMeme,
  setSelectedMeme,
}) => {
  const { socket } = useWebSocket();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 📡 **Memes ophalen bij component load**
  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Race niet gevonden");
        const data = await response.json();

        setMemes(data.memes || []); // ✅ Voorkom undefined fout
        console.log("[API] ✅ Memes geladen:", data.memes);
      } catch (error) {
        console.error("[API] ❌ Fout bij ophalen memes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  // 🎧 **Luister naar WebSocket race updates**
  useEffect(() => {
    if (!socket) return;

    const handleRaceUpdate = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "raceUpdate") {
          setMemes(message.data.memes || []);
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
