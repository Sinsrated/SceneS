"use client";

import { useState } from "react";
import { Home, Film, Tv, Calendar, User, Search } from "lucide-react";

const Navbar = () => {
  const [active, setActive] = useState("home");

  const navItems = [
    { name: "Home", icon: <Home size={22} />, href: "#home" },
    { name: "Movies", icon: <Film size={22} />, href: "#movies" },
    { name: "Series", icon: <Tv size={22} />, href: "#series" },
    { name: "Upcoming", icon: <Calendar size={22} />, href: "#upcoming" },
    { name: "Profile", icon: <User size={22} />, href: "#profile" },
  ];

  return (
    <>
      {/* 🌐 Desktop Glassmorphism Top Navbar */}
      <nav className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-3 items-center justify-between shadow-lg z-50">
        {/* Logo */}
        <div className="text-red-500 font-bold text-xl">SceneS</div>

        {/* Links */}
        <ul className="flex gap-8 text-white font-medium">
          {navItems.slice(0, 4).map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={() => setActive(item.name.toLowerCase())}
                className={`relative transition ${
                  active === item.name.toLowerCase()
                    ? "text-red-400"
                    : "hover:text-red-300"
                }`}
              >
                {item.name}
                {active === item.name.toLowerCase() && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-red-400 rounded-full animate-pulse" />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Search Bar (Windows / Desktop) */}
        <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-white text-sm flex-1"
          />
        </div>
      </nav>

      {/* 📱 Mobile Top Bar (Dynamic Island style, no profile) */}
      <header className="md:hidden fixed top-2 left-0 w-full flex items-center justify-between px-4 z-50">
        {/* Logo */}
        <div className="text-red-500 font-bold text-lg">SceneS</div>

        {/* Search Bar */}
        <div className="flex-1 ml-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 flex items-center">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
          </div>
        </div>
      </header>

      {/* 📱 Mobile Bottom Glassmorphism Navbar */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-4 py-3 flex justify-around items-center shadow-lg z-50">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={() => setActive(item.name.toLowerCase())}
            className={`flex flex-col items-center transition ${
              active === item.name.toLowerCase()
                ? "text-red-400"
                : "text-gray-300 hover:text-red-300"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.name}</span>
          </a>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
