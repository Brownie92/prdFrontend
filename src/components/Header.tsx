import { useState } from "react";
import HamburgerMenu from "./HamburgerMenu";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex justify-between items-center relative">
      <h1 className="text-3xl font-bold">THE MEME RACE</h1>

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-white text-2xl"
      >
        ☰
      </button>

      {/* The menu is rendered here */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Header;
