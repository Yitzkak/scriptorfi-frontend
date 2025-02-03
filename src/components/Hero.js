// src/components/Hero.js
import React from 'react';

const Hero = () => {
  return (
    <div className="bg-[#0FFCBE] flex flex-col items-center justify-center text-center py-16 px-4 md:py-24 md:px-10 lg:px-20">
      <h5 className="text-3xl font-bold text-[#362f2f] md:text-4xl lg:text-5xl max-w-2xl leading-tight">
      UNLEASH YOUR CONTENT'S POTENTIAL BY TRANSCRIBING WITH SCRIPTORFI
      </h5>
      
      <p className="text-base text-black max-w-lg mt-4 mb-6 md:text-lg lg:text-xl">
      Powered by AI, Perfected by Humans. Scriptorfi delivers quick, accurate transcription with expert human oversight
      </p>
      
      <div className="flex space-x-4">
        <button className="bg-black text-white py-2 px-4 rounded font-semibold">
          Free Trial
        </button>
        <button className="border border-black py-2 px-4 rounded font-semibold">
          Upload a file @ $0.5/min
        </button>
      </div>
    </div>
  );
};

export default Hero;
