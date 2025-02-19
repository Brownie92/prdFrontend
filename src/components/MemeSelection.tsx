interface MemeSelectionProps {
  selectedMeme: string | null;
  setSelectedMeme: (id: string) => void;
}

import bonk from "../assets/bonk.png";
import dogwifhat from "../assets/dogwifhat.png";
import moodeng from "../assets/moodeng.png";
import peanut from "../assets/Peanut.png";
import popcat from "../assets/popcat.png";
import pudgy from "../assets/pudgy.png";

const memes = [
  { id: "1", src: bonk, name: "Bonk" },
  { id: "2", src: dogwifhat, name: "dogwifhat" },
  { id: "3", src: moodeng, name: "Moodeng" },
  { id: "4", src: peanut, name: "Peanut" },
  { id: "5", src: popcat, name: "Popcat" },
  { id: "6", src: pudgy, name: "Pudgy" },
];

const MemeSelection: React.FC<MemeSelectionProps> = ({
  selectedMeme,
  setSelectedMeme,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 my-4 place-items-center">
      {memes.map((meme) => (
        <button
          key={meme.id}
          onClick={() => setSelectedMeme(meme.id)}
          className={`rounded-full p-1 transition ${
            selectedMeme === meme.id
              ? "ring-4 ring-green-400 scale-110"
              : "hover:scale-105"
          }`}
        >
          <img
            src={meme.src}
            alt={meme.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg bg-[#FFB877] p-1"
          />
        </button>
      ))}
    </div>
  );
};

export default MemeSelection;
