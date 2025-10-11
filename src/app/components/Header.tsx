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
    { name: "Tvshows", icon: <Tv size={22} />, href: "/tvshows" },
    { name: "Vjs", icon: <Calendar size={22} />, href: "/vjs" },
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
      <nav
        className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl 
        bg-gradient-to-br from-cyan-400/10 via-cyan-300/5 to-transparent 
        backdrop-blur-5xl border border-cyan-400/30 
        rounded-3xl px-8 py-3 items-center justify-between z-50
        transition-all duration-500"
      >
        {/* Logo */}
        <div
          onClick={() => handleNav("/home")}
          className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300 
          font-extrabold text-2xl tracking-wide cursor-pointer select-none 
          hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.7)] transition-all duration-300"
        >
          KYOGOBE<span className="text-cyan-200"></span>
        </div>

        {/* Links */}
        <ul className="flex gap-10 text-white/80 font-medium">
          {navItems.slice(0, 4).map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNav(item.href)}
                className={`relative flex items-center gap-1 transition-all duration-300
                  ${
                    isActive(item.href)
                      ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]"
                      : "hover:text-cyan-300"
                  }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.7)]" />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Search + Settings */}
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Search />
          </div>
          <button
            onClick={() => handleNav("/setting")}
            className={`p-2 rounded-full transition-all duration-300
              ${
                isActive("/setting")
                  ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                  : "hover:bg-cyan-400/10 text-cyan-200"
              }`}
          >
            <Settings size={22} />
          </button>
        </div>
      </nav>

      {/* 📱 Mobile Top Bar */}
      <header
        className="md:hidden fixed top-3 left-1/2 -translate-x-1/2 w-[92%] 
        bg-gradient-to-br from-cyan-400/10 via-cyan-300/5 to-transparent 
        backdrop-blur-x5 border border-cyan-400/20 
         rounded-2xl px-4 py-2 flex items-center justify-between z-50"
      >
        <div
          className="text-cyan-400 font-bold text-lg tracking-wide cursor-pointer"
          onClick={() => handleNav("/home")}
        >
          Kyogobe
        </div>
        <div className="flex-1 ml-3">
          <Search />
        </div>
      </header>

      {/* 📱 Mobile Bottom Navbar */}
      <nav
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md 
        bg-gradient-to-t from-cyan-400/10 via-cyan-300/5 to-transparent 
        backdrop-blur-x5 border border-cyan-400/20 
        rounded-3xl px-4 py-3 flex justify-around items-center z-50"
      >
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNav(item.href)}
            className={`flex flex-col items-center transition-all duration-300 ${
              isActive(item.href)
                ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.7)]"
                : "text-cyan-100/70 hover:text-cyan-300"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
