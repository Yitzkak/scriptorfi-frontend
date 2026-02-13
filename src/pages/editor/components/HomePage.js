import React from 'react';
import { FiPlay, FiUpload, FiClock, FiEdit3, FiDownload, FiUsers } from 'react-icons/fi';

const HomePage = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <img 
            src="/images/logo-icon-black.png" 
            alt="Scriptorfi" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal-500 font-semibold">Scriptorfi</p>
            <p className="text-base font-semibold text-gray-900">Editor</p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all hover:-translate-y-0.5"
        >
          <FiPlay size={14} />
          Open Editor
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          Professional Transcription Suite
        </div>
        <h1 className="text-5xl font-semibold text-gray-900 leading-tight tracking-tight mb-6">
          Edit transcripts with<br />
          <span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">precision and speed</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
          A streamlined workspace for reviewing, editing, and polishing transcripts. 
          Audio controls, timestamps, and formatting tools—all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-gray-900 rounded-full shadow-xl hover:bg-gray-800 transition-all hover:-translate-y-0.5"
          >
            <FiUpload size={16} />
            Upload & Start
          </button>
          <button className="px-7 py-3.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-full hover:border-gray-300 hover:text-gray-900 transition-all">
            View Demo
          </button>
        </div>
      </section>

      {/* Preview Card */}
      <section className="max-w-3xl mx-auto px-8 pb-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          {/* Mock player UI */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">interview_recording.mp3</h3>
              <p className="text-sm text-gray-400">42 min · 3 speakers</p>
            </div>
            <button className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <FiPlay className="text-white ml-1" size={22} />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-gray-400 tabular-nums">12:34</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-[30%] h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-400 tabular-nums">42:00</span>
          </div>

          {/* Waveform visualization */}
          <div className="h-12 bg-gray-50 rounded-xl flex items-center justify-center gap-[3px] px-4 overflow-hidden">
            {[...Array(80)].map((_, i) => {
              const height = 6 + Math.sin(i * 0.3) * 12 + Math.random() * 8;
              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-full ${i < 24 ? 'bg-teal-400' : 'bg-gray-200'}`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<FiClock />}
            title="Timestamp Navigation"
            description="Click any timestamp to jump to that moment. Navigate with precision."
          />
          <FeatureCard 
            icon={<FiEdit3 />}
            title="Smart Editing"
            description="Auto-suggestions, find & replace, and quick formatting tools."
          />
          <FeatureCard 
            icon={<FiUsers />}
            title="Speaker Management"
            description="Swap labels, identify speakers, and keep dialogue organized."
          />
          <FeatureCard 
            icon={<FiDownload />}
            title="Easy Export"
            description="Download clean transcripts ready for any publishing workflow."
          />
          <FeatureCard 
            icon={<FiPlay />}
            title="Playback Control"
            description="Variable speed, skip controls, and volume amplification."
          />
          <FeatureCard 
            icon={<span className="text-base">Aa</span>}
            title="Clean Formatting"
            description="Fix capitalization, remove fillers, join paragraphs instantly."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <p className="text-sm text-gray-400">© 2024 Scriptorfi. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <button className="hover:text-gray-600 transition-colors">Support</button>
            <button className="hover:text-gray-600 transition-colors">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-100/50 transition-all hover:-translate-y-1">
    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-teal-500 text-lg mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default HomePage;
