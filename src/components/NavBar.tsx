import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { Navs } from "../utils/constants";

export default function NavBar({ setPage } : {setPage: Function}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between px-4 py-3 md:py-4">
        <div className="text-xl font-bold text-blue-600">LensJobs</div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
          {Object.values(Navs).map((nav) => (
            <li
              key={nav}
              onClick={() => setPage(nav)}
              className="cursor-pointer hover:text-blue-600 transition"
            >
              {`${nav.charAt(0).toUpperCase()}${nav.substring(1)}`}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {/* Button/text for md and lg screens */}
          {/* <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition hidden md:block"
          >
            Connect Wallet
          </button> */}
          <div className="hidden md:block">
            <ConnectKitButton />
          </div>

          {/* Hamburger for Mobile */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 bg-white border-t">
          <ul className="flex flex-col gap-3 text-gray-700">
            {Object.values(Navs).map((nav) => (
              <li
                key={nav}
                onClick={() => {
                  setPage(nav);
                  setMenuOpen(false);
                }}
                className="cursor-pointer hover:text-blue-600 transition"
              >
                {`${nav.charAt(0).toUpperCase()}${nav.substring(1)}`}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            {/* <button
              className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button> */}
            <ConnectKitButton />
          </div>
        </div>
      )}
    </nav>
  );
}
