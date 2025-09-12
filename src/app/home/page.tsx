"use client"
 import HeroCarousel from "../components/homehero";
 import Header from "../components/Header"
 import Footer from "../components/footer"
import Trending from "../components/trending";
import LatestMovies from "../components/latestm";
import LatestSeries from "../components/latests";
import Animation from "../components/animation";


export default function Home() {
  
   return(
     <>
    
     <HeroCarousel /> 
     <Header />
     <Trending />
     <LatestMovies />
     <LatestSeries />
     <Animation />
     <Footer /> 
     </> 
   );
    

 }


