"use client";

import { Home, Film, Tv, Calendar, User, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: <Home size={22} />, href: "/home" },
    { name: "Movies", icon: <Film size={22} />, href: "/movies" },
    { name: "Series", icon: <Tv size={22} />, href: "/series" },
    { name: "Upcoming", icon: <Calendar size={22} />, href: "/upcoming" },
    { name: "Profile", icon: <User size={22} />, href: "/profile" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href);

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
              <Link
                href={item.href}
                className={`relative transition ${
                  isActive(item.href)
                    ? "text-red-400"
                    : "hover:text-red-300"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-red-400 rounded-full animate-pulse" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search Bar + Profile (Desktop only) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 w-64">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
          </div>
          <Link
            href="/profile"
            className={`p-2 rounded-full transition ${
              isActive("/profile")
                ? "bg-red-500/20 text-red-400"
                : "hover:bg-white/10 text-white"
            }`}
          >
            <User size={22} />
          </Link>
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
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center transition ${
              isActive(item.href)
                ? "text-red-400"
                : "text-gray-300 hover:text-red-300"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
