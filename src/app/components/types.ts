// types.ts
export type Item = {
  id: number;
  type: "movie" | "tvshow";   // only movies and tvshows
  title: string;
  poster_url: string;
  backdrop_url?: string;
 overview?: string;
  release_date?: string;
  trailer_url?: string;
  watch_url?: string;
  genres?: string[];
  vj?: string;
  created_at?: string; 
  status?: string;        // optional for sorting
};
