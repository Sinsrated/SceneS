"use client";

import { Home, Film, Tv, Calendar, Settings, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

  // 🔄 Auto-hide loading after navigation finishes
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => setLoading(false), 1200); // 1.2s cinematic delay
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // 🧭 Handle navigation with loading effect
  const handleNav = (href: string) => {
    setLoading(true);
    router.push(href);
  };

  return (
    <>
      {/* 🌐 Desktop Glassmorphism Top Navbar */}
      <nav className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-3 items-center justify-between shadow-lg z-50">
        {/* Logo */}
        <div className="text-red-500 font-bold text-xl cursor-pointer" onClick={() => handleNav("/home")}>
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

        {/* Search Bar + Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 w-64">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
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

      {/* 📱 Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-4 py-3 flex justify-around items-center shadow-lg z-50">
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

      {/* 🎬 Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-lg z-[9999]">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
};

export default Navbar;
