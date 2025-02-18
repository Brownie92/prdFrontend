import Header from "../components/Header";
import VaultInfo from "../components/VaultInfo";
import RaceSection from "../components/RaceSection";
import PreviousRaces from "../components/PreviousRaces";

const RacePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF7A00] via-[#402C1B] to-[#0F0F0F] text-white px-4 py-6 flex flex-col items-center">
      <div className="w-full max-w-md relative">
        <Header />
        <VaultInfo />
        <RaceSection />
        <PreviousRaces />
      </div>
    </div>
  );
};

export default RacePage;
