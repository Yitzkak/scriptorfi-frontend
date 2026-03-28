import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiClock, FiDollarSign, FiCheck } from "react-icons/fi";
import { FaRobot, FaUserTie } from "react-icons/fa";

const steps = [
  {
    step: "01",
    title: "Upload your audio",
    description: "Drop any audio or video file — MP3, MP4, WAV, M4A, and more.",
  },
  {
    step: "02",
    title: "Select Auto Transcription",
    description: 'Choose "Auto Transcription" on the upload page — powered by Google Chirp AI.',
  },
  {
    step: "03",
    title: "Get your transcript",
    description: "Pay and your transcript appears in your dashboard within minutes.",
  },
];

const comparison = [
  { feature: "Turnaround", auto: "Minutes", human: "24–48 hours" },
  { feature: "Price per minute", auto: "from $0.07", human: "from $0.50" },
  { feature: "Accuracy", auto: "High (clear audio)", human: "99% verified" },
  { feature: "Punctuation", auto: "Auto-detected", human: "Manually reviewed" },
  { feature: "Speaker labels", auto: "Coming soon", human: "Included" },
  { feature: "Best for", auto: "Interviews, podcasts, lectures", human: "Legal, medical, sensitive content" },
];

export default function AutoTranscriptionSection() {
  return (
    <section className="bg-gray-50 py-20 px-6 md:px-12 2xl:px-[19rem]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
            <FiZap className="w-3.5 h-3.5" /> New feature
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Meet Auto Transcription
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powered by Google's Chirp AI — our fastest, most affordable option.
            Get accurate transcripts in minutes, not days.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: <FiClock className="w-7 h-7" />, value: "~Minutes", label: "Average turnaround" },
            { icon: <FiDollarSign className="w-7 h-7" />, value: "from $0.07/min", label: "86% cheaper than human" },
            { icon: <FiZap className="w-7 h-7" />, value: "Google Chirp", label: "State-of-the-art AI model" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase text-center mb-8">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative bg-white border border-gray-200 rounded-2xl p-6"
              >
                <span className="text-6xl font-black text-teal-50 select-none absolute top-4 right-5 leading-none">
                  {s.step}
                </span>
                <p className="text-sm font-bold text-teal-600 mb-2">Step {s.step}</p>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{s.title}</h4>
                <p className="text-gray-600 text-sm">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase mb-4">
              Auto vs. Human
            </p>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span>Feature</span>
                <span className="text-center flex items-center justify-center gap-1">
                  <FaRobot className="text-teal-500" /> Auto
                </span>
                <span className="text-center flex items-center justify-center gap-1">
                  <FaUserTie className="text-gray-500" /> Human
                </span>
              </div>
              {comparison.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 px-5 py-3.5 text-sm border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <span className="text-gray-600 font-medium">{row.feature}</span>
                  <span className="text-center text-teal-700 font-semibold">{row.auto}</span>
                  <span className="text-center text-gray-700">{row.human}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-8 text-white flex flex-col justify-between h-full">
            <div>
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-6">
                <FiZap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Try Auto Transcription today</h3>
              <p className="text-teal-100 mb-6">
                Upload your file, pick Auto Transcription, and receive a polished transcript within minutes — at a fraction of the manual price.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  "Google Chirp AI — latest model",
                  "Automatic punctuation",
                  "US, British, Australian & Canadian English",
                  "Instant delivery to your dashboard",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-teal-50">
                    <FiCheck className="w-4 h-4 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/upload"
              className="block w-full bg-white text-teal-600 font-semibold py-3 rounded-lg hover:bg-teal-50 transition text-center"
            >
              Upload & Transcribe Now
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
