import React from "react";
import { FaShieldAlt, FaTachometerAlt, FaCheckCircle, FaDollarSign } from "react-icons/fa";

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">About</p>
          <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Human‑verified transcription, powered by AI
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Scriptorfi blends smart automation with expert review to deliver transcripts you can trust—fast, accurate, and affordable.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our mission</h2>
            <p className="mt-4 text-gray-600">
              We make professional transcription accessible for teams, creators, and researchers by combining AI speed with human precision.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Transparent pricing with no surprises",
                "Human‑reviewed quality control",
                "Secure handling of sensitive content",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-teal-500"></span>
                  <p className="text-gray-700">{text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <img
              src="/images/laptop-and-headset.jpg"
              alt="Our mission"
              className="rounded-xl w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why teams choose Scriptorfi</h2>
            <p className="mt-3 text-gray-600">
              Reliable turnaround, airtight security, and transcripts polished by experts.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Secure by default",
                desc: "Your files are protected from upload to delivery with strict confidentiality.",
                icon: FaShieldAlt,
              },
              {
                title: "Fast turnaround",
                desc: "AI speed with human QA delivers transcripts on schedule.",
                icon: FaTachometerAlt,
              },
              {
                title: "Human‑verified accuracy",
                desc: "Every transcript is reviewed by professionals for clarity and completeness.",
                icon: FaCheckCircle,
              },
              {
                title: "Fair pricing",
                desc: "Transparent per‑minute rates that scale to any project size.",
                icon: FaDollarSign,
              },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  <item.icon />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-teal-500 to-mint-green rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Ready to get started?</h2>
              <p className="mt-3 text-white/90">
                Upload your files and get a clean transcript quickly with full visibility into pricing.
              </p>
            </div>
            <div className="flex md:justify-end">
              <a
                href="/upload"
                className="inline-flex items-center justify-center bg-white text-teal-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Upload a file
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
