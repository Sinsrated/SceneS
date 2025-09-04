"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 3000); 
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Background animated glows */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-red-500/20 blur-3xl animate-pulse -top-40 -left-40" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-300 -bottom-40 -right-40" />
      </div>

      {/* Glass cinematic card */}
      <div className="relative z-10 px-10 py-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center space-y-6 animate-fadeIn">
        <h1 className="text-white text-4xl sm:text-6xl font-extrabold tracking-wide drop-shadow-lg animate-pulse">
          Scenecs
        </h1>

        {/* Progress bar */}
        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 animate-[loading_5s_linear_infinite]" />
        </div>

        <p className="text-gray-200 text-sm sm:text-base animate-fadeIn">
          Preparing your experience...
        </p>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
