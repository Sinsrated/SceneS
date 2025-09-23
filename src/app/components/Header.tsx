// ...existing code...
"use client";

import { Home, Film, Tv, Calendar, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Search from "./search";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const navItems = [
    { name: "Home", icon: <Home size={22} />, href: "/home" },
    { name: "Movies", icon: <Film size={22} />, href: "/movies" },
    { name: "Series", icon: <Tv size={22} />, href: "/series" },
    { name: "Upcoming", icon: <Calendar size={22} />, href: "/upcoming" },
    { name: "Setting", icon: <Settings size={22} />, href: "/setting" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href);

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => setLoading(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const handleNav = (href: string) => {
    setLoading(true);
    router.push(href);
  };

  return (
    <>
      {/* 🌐 Desktop Navbar */}
      <nav className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl bg-white/5 backdrop-blur-5g border border-white/20 rounded-2xl px-6 py-3 items-center justify-between shadow-lg z-50">
        {/* Logo */}
        <div
          className="text-red-500 font-bold text-xl cursor-pointer"
          onClick={() => handleNav("/home")}
        >
          ScenecS
        </div>

        {/* Links */}
        <ul className="flex gap-8 text-white font-medium">
          {navItems.slice(0, 4).map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNav(item.href)}
                className={`relative transition ${
                  isActive(item.href) ? "text-red-400" : "hover:text-red-300"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-red-400 rounded-full animate-pulse" />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Search + Settings */}
        <div className="flex items-center gap-4">
          {/* use shared Search component */}
          <div className="w-64">
            <Search />
          </div>

          <button
            onClick={() => handleNav("/setting")}
            className={`p-2 rounded-full transition ${
              isActive("/setting")
                ? "bg-red-500/20 text-red-400"
                : "hover:bg-white/10 text-white"
            }`}
          >
            <Settings size={22} />
          </button>
        </div>
      </nav>

      {/* 📱 Mobile Top Bar */}
      <header className="md:hidden fixed top-2 left-0 w-full flex items-center justify-between px-4 z-50">
        <div
          className="text-red-500 font-bold text-lg cursor-pointer"
          onClick={() => handleNav("/home")}
        >
          SceneS
        </div>
        <div className="flex-1 ml-4">
          {/* mobile uses same Search component (responsible for its own layout) */}
          <Search  />
        </div>
      </header>

      {/* 📱 Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/5 backdrop-blur-5g border border-white/20 rounded-2xl px-4 py-3 flex justify-around items-center shadow-lg z-50">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNav(item.href)}
            className={`flex flex-col items-center transition ${
              isActive(item.href)
                ? "text-red-400"
                : "text-gray-300 hover:text-red-300"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.name}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
// ...existing code...