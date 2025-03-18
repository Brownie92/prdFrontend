import { useState, useCallback } from "react";
import HamburgerMenu from "./HamburgerMenu";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Toggle the hamburger menu state
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  return (
    <header className="flex justify-between items-center relative p-4">
      <h1 className="text-3xl font-bold text-white">THE MEME RACE</h1>

      <button
        onClick={toggleMenu}
        aria-label="Toggle menu"
        className="text-white text-3xl focus:outline-none transition-transform transform hover:scale-110"
      >
        ☰
      </button>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
};

export default Header;
