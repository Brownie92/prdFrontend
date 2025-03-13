import { useEffect, useState } from "react";

interface Winner {
  raceId: string;
  name: string;
  memeUrl: string;
  createdAt: string;
}

const PreviousRaces = () => {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_WINNERS}`
        );
        if (!response.ok) throw new Error("Failed to fetch winners");
        const data: Winner[] = await response.json();

        // Sort and keep only the last 10 winners
        const sortedWinners = data
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10);

        setWinners(sortedWinners);
      } catch (error) {
        // Error fetching winners
      }
    };

    fetchWinners();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2 text-white">Previous Races</h2>

      {winners.length === 0 ? (
        <p className="text-white">No previous races available.</p>
      ) : (
        <div className="flex space-x-3 mt-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {winners.map((winner, index) => (
            <div
              key={index}
              className="bg-orange-400 bg-opacity-90 p-3 rounded-xl text-center w-24 md:w-28 shadow-lg flex-shrink-0 snap-start"
            >
              <p className="text-xs md:text-sm font-semibold text-white">
                Winner:
              </p>
              <div className="flex justify-center mt-2">
                <img
                  src={winner.memeUrl}
                  alt={`Winner of race ${winner.raceId}`}
                  className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-lg bg-[#FFB877] p-1 shadow-md"
                />
              </div>
              <p className="text-xs md:text-sm font-semibold text-white mt-2">
                {new Date(winner.createdAt).toLocaleDateString("nl-NL")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviousRaces;
