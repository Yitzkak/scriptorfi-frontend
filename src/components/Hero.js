// src/components/Hero.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';
import LaunchOfferBanner from './LaunchOfferBanner';

const Hero = () => {
  const navigate = useNavigate();

  const handleFreeTrial = () => {
    sessionStorage.setItem('freeTrialPending', 'true');
    navigate('/register', { state: { freeTrial: true } });
  };

  return (
    <div className="relative bg-[#0FFCBE] flex flex-col items-center justify-center text-center min-h-screen pt-20 pb-16 px-4 md:px-10 lg:px-20">
      <div className="pointer-events-auto absolute left-0 right-0 top-24 z-10 mx-auto max-w-6xl px-4 md:px-8">
        <LaunchOfferBanner compact />
      </div>
      <div className="flex flex-col items-center">
        {/* Auto-transcription badge */}
        <Link
          to="/upload"
          className="mb-6 inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-gray-900 transition"
        >
          <FiZap className="w-3.5 h-3.5 text-[#0FFCBE]" />
          New: Google Chirp AI Auto-Transcription from $0.07/min
          <span className="ml-1 text-[#0FFCBE]">&rarr;</span>
        </Link>

        <h5 className="text-3xl font-bold text-[#362f2f] md:text-4xl lg:text-5xl max-w-2xl leading-tight">
        UNLEASH YOUR CONTENT'S POTENTIAL BY TRANSCRIBING WITH SCRIPTORFI
        </h5>
        
        <p className="text-base text-black max-w-lg mt-4 mb-6 md:text-lg lg:text-xl">
        Powered by AI, Perfected by Humans. Choose instant Google Chirp AI auto-transcription or expert human review — both at transparent per-minute rates.
        </p>

        <p className="text-sm md:text-base text-gray-900 max-w-2xl mb-6 font-medium">
          Scriptorfi turns your audio and video into clean, publication-ready transcripts fast, with AI speed or human-reviewed accuracy at transparent per-minute pricing.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm font-semibold">
          <Link to="/sample-transcripts" className="text-gray-900 underline hover:text-black">
            View Sample Transcripts
          </Link>
          <Link to="/faq" className="text-gray-900 underline hover:text-black">
            Read FAQ
          </Link>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleFreeTrial}
            className="bg-black text-white py-2 px-4 rounded font-semibold"
          >
            Free Trial
          </button>
          <button className="border border-black py-2 px-4 rounded font-semibold">
            <Link to="/upload">Upload a file</Link> 
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
