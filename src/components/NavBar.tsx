import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { Navs } from "../utils/constants";

export default function NavBar({
  setPage,
  currentPage,
}: {
  setPage: (page: Navs) => void;
  currentPage: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = (nav: string) =>
    `cursor-pointer px-3 py-1 rounded transition-all ${
      currentPage === nav
        ? "bg-primary text-white shadow"
        : "text-gray-300 hover:text-white hover:bg-surface"
    }`;

  return (
    // <nav className="fixed top-0 left-0 w-full z-50 bg-background text-white shadow-md">
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/40 backdrop-blur-md border-b border-surface shadow-lg">
      <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-primary">LensJobs</div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 items-center">
          {Object.values(Navs).map((nav) => (
            <li
              key={nav}
              onClick={() => setPage(nav)}
              className={navClass(nav)}
            >
              {nav.charAt(0).toUpperCase() + nav.slice(1)}
            </li>
          ))}
        </ul>

        {/* Wallet Button */}
        <div className="hidden md:block">
          <ConnectKitButton />
        </div>

        {/* Hamburger for Mobile */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-background border-t border-surface text-gray-200">
          <ul className="flex flex-col gap-3">
            {Object.values(Navs).map((nav) => (
              <li
                key={nav}
                onClick={() => {
                  setPage(nav);
                  setMenuOpen(false);
                }}
                className={navClass(nav)}
              >
                {nav.charAt(0).toUpperCase() + nav.slice(1)}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <ConnectKitButton />
          </div>
        </div>
      )}
    </nav>
  );
}
