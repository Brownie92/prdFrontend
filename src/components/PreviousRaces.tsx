import { useRef } from "react";
import pudgy from "../assets/pudgy.png";
import popcat from "../assets/popcat.png";
import bonk from "../assets/bonk.png";

// ✅ TypeScript type voor race objecten
interface Race {
  date: string;
  winner: string;
}

// ✅ Simulatie van eerdere races (kan later uit API komen)
const previousRaces: Race[] = [
  { date: "13-2-2025", winner: pudgy },
  { date: "12-2-2025", winner: popcat },
  { date: "11-2-2025", winner: bonk },
  { date: "10-2-2025", winner: pudgy },
  { date: "09-2-2025", winner: popcat },
  { date: "08-2-2025", winner: bonk },
  { date: "07-2-2025", winner: pudgy },
  { date: "06-2-2025", winner: popcat },
  { date: "05-2-2025", winner: bonk },
  { date: "04-2-2025", winner: pudgy },
];

const PreviousRaces = () => {
  const scrollRef = useRef<HTMLDivElement>(null); // ✅ TypeScript safety

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2 text-white">Previous Races</h2>

      <div
        ref={scrollRef}
        className="flex space-x-3 mt-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
        aria-label="Scroll through previous race winners"
      >
        {previousRaces.map((race, index) => (
          <div
            key={index}
            className="bg-orange-400 bg-opacity-90 p-3 rounded-xl text-center w-24 md:w-28 shadow-lg flex-shrink-0 snap-start"
          >
            <p className="text-xs md:text-sm font-semibold text-white">
              Winner:
            </p>

            <div className="flex justify-center mt-2">
              <img
                src={race.winner}
                alt={`Winner of race on ${race.date}`}
                className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-lg bg-[#FFB877] p-1 shadow-md"
              />
            </div>

            {/* ✅ Race datum staat nu ONDER de afbeelding */}
            <p className="text-xs md:text-sm font-semibold text-white mt-2">
              {race.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousRaces;
