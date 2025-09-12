"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  description: string;
  year: string;
  rating: number;
  genre: string[];
  trailer_url: string;
}

interface MovieContextType {
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <MovieContext.Provider value={{ selectedMovie, setSelectedMovie }}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovie = () => {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error("useMovie must be inside MovieProvider");
  return ctx;
};
