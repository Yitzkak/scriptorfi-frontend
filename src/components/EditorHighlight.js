import React from "react";

const EditorHighlight = () => {
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-teal-500 to-mint-green rounded-3xl p-8 md:p-12 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-white/80">Scriptorfi Editor</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">Polish transcripts with a pro editing suite</h2>
            <p className="mt-4 text-white/90 text-lg">
              Review, edit, and finalize transcripts in the Scriptorfi Editor with timestamps, speaker tools,
              and playback controls designed for speed.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/editor-home"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-white text-teal-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Open the Editor
              </a>
              <a
                href="/upload"
                className="inline-flex items-center justify-center border border-white/60 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition"
              >
                Upload new audio
              </a>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <ul className="space-y-4 text-sm text-white/90">
              <li>✓ Timestamp-aware editing and speaker labels</li>
              <li>✓ Fast playback controls and audio amplification</li>
              <li>✓ Find & replace, version history, and export tools</li>
              <li>✓ Built for long-form audio and podcasts</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorHighlight;
