import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`absolute top-14 right-2 bg-[#FFB877] p-6 rounded-xl shadow-lg flex flex-col items-center w-56 transition-all duration-300 ${
        isOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="text-white text-2xl absolute top-4 right-5 hover:text-gray-200 transition"
        aria-label="Close menu"
      >
        ✕
      </button>

      {/* Wallet Connect Button */}
      <div className="mt-8">
        <WalletMultiButton className="bg-[#74FF9B] hover:bg-[#5CDB7D] text-black font-bold py-3 px-6 rounded-lg shadow-md transition" />
      </div>
    </div>
  );
};

export default HamburgerMenu;
