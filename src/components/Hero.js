// src/components/Hero.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleFreeTrial = () => {
    sessionStorage.setItem('freeTrialPending', 'true');
    navigate('/register', { state: { freeTrial: true } });
  };

  return (
    <div className="bg-[#0FFCBE] flex flex-col items-center justify-center text-center min-h-screen pt-20 pb-16 px-4 md:px-10 lg:px-20">
      <div className="flex flex-col items-center">
        <h5 className="text-3xl font-bold text-[#362f2f] md:text-4xl lg:text-5xl max-w-2xl leading-tight">
        UNLEASH YOUR CONTENT'S POTENTIAL BY TRANSCRIBING WITH SCRIPTORFI
        </h5>
        
        <p className="text-base text-black max-w-lg mt-4 mb-6 md:text-lg lg:text-xl">
        Powered by AI, Perfected by Humans. Scriptorfi delivers quick, accurate transcription with expert human oversight
        </p>
        
        <div className="flex space-x-4">
          <button
            onClick={handleFreeTrial}
            className="bg-black text-white py-2 px-4 rounded font-semibold"
          >
            Free Trial
          </button>
          <button className="border border-black py-2 px-4 rounded font-semibold">
            <Link to="/upload">Upload a file @ $0.5/min</Link> 
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
