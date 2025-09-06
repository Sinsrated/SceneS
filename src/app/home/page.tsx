"use client"
 import HeroCarousel from "../components/homehero";
 import Header from "../components/Header"
 import Footer from "../components/footer"
 import MoviesPage from "../movies/page";
import Trending from "../components/trending";
import LatestMovies from "../components/latestm";
import LatestSeries from "../components/latests";
import Animation from "../components/animation";


export default function Movies() {
  
   return(
     <>
    <Header /> 
     <HeroCarousel /> 
     <Trending />
     <LatestMovies />
     <LatestSeries />
     <Animation />
     <Footer /> 
     </> 
   );
    

 }


