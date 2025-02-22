import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketProvider";

interface Meme {
  memeId: string; // Unieke ID van de meme uit de backend
  url: string; // URL van de afbeelding
  name: string; // Naam van de meme
}

interface MemeSelectionProps {
  selectedMeme: string | null;
  setSelectedMeme: (id: string) => void;
}

const API_URL = "http://localhost:6001/api/races/current"; // 🔗 API endpoint voor de actieve race

const MemeSelection: React.FC<MemeSelectionProps> = ({
  selectedMeme,
  setSelectedMeme,
}) => {
  const { socket } = useWebSocket();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  // ⏳ API-call: Ophalen van memes bij het laden van de pagina
  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Race niet gevonden");
        const data = await response.json();
        setMemes(data.memes); // 🎯 Zet memes uit de API in de state
      } catch (error) {
        console.error("❌ Fout bij ophalen memes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  // 🎧 WebSocket luisteren naar race updates
  useEffect(() => {
    if (!socket) return;

    const handleRaceUpdate = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "raceUpdate") {
          setMemes(message.data.memes);
          console.log("[WS] 🏁 Meme lijst geüpdatet:", message.data.memes);
        }
      } catch (error) {
        console.error("[WS] ❌ Fout bij verwerken raceUpdate:", error);
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
            key={meme.memeId} // ✅ Unieke key gebruiken (memeId uit backend)
            onClick={() => setSelectedMeme(meme.memeId)}
            className={`rounded-full p-1 transition ${
              selectedMeme === meme.memeId
                ? "ring-4 ring-green-400 scale-110"
                : "hover:scale-105"
            }`}
          >
            <img
              src={meme.url} // ✅ Meme afbeelding uit de backend gebruiken
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
