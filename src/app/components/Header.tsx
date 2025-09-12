"use client";

import { Home, Film, Tv, Calendar, Settings, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";



const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 🔍 Search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
      const timeout = setTimeout(() => setLoading(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // 🧭 Handle navigation with loading effect
const handleNav = (href: string) => {
  setLoading(true);
  router.push(href);
};

// 🔍 Handle Enter key
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (suggestions.length > 0) {
    // Take the first matching suggestion
    const first = suggestions[0];
    handleNav(`/movies/${first.id}`);
    setShowDropdown(false);
    setQuery("");
  }
};


  // 🔍 Fetch movie suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from("movies")
        .select("id, title, year, poster_url")
        .ilike("title", `%${query}%`) // case-insensitive search
        .limit(6);

      if (!error && data) {
        setSuggestions(data);
        setShowDropdown(true);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300); // debounce typing
    return () => clearTimeout(debounce);
  }, [query]);

  // ❌ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* 🌐 Desktop Navbar */}
      <nav className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-3 items-center justify-between shadow-lg z-50">
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
        <div className="flex items-center gap-4" ref={searchRef}>
          <div className="relative w-64">
            <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none text-white text-sm flex-1"
                onFocus={() => query && setShowDropdown(true)}
              />
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute top-12 left-0 w-full bg-black/90 border border-white/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {suggestions.map((movie) => (
                  <li
                    key={movie.id}
                    onClick={() => {
                      handleNav(`/movies/${movie.id}`);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 p-2 cursor-pointer hover:bg-white/10 transition"
                  >
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-10 h-14 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm text-white font-medium">
                        {movie.title}
                      </p>
                      <p className="text-xs text-gray-400">{movie.year}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
        <div className="flex-1 ml-4" ref={searchRef}>
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 flex items-center">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none text-white text-sm flex-1"
                onFocus={() => query && setShowDropdown(true)}
              />
            </div>

            {/* Mobile suggestions */}
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute top-12 left-0 w-full bg-black/90 border border-white/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {suggestions.map((movie) => (
                  <li
                    key={movie.id}
                    onClick={() => {
                      handleNav(`/movies/${movie.id}`);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 p-2 cursor-pointer hover:bg-white/10 transition"
                  >
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-10 h-14 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm text-white font-medium">
                        {movie.title}
                      </p>
                      <p className="text-xs text-gray-400">{movie.year}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
