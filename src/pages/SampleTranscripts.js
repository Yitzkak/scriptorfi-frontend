import React from "react";
import { Link } from "react-router-dom";
import LaunchOfferBanner from "../components/LaunchOfferBanner";

const samples = [
  {
    title: "Podcast Interview (Human-Reviewed)",
    transcript: [
      "00:00:02 HOST: Welcome back to Founder Stories. Today we are joined by Amaka, founder of GreenCart.",
      "00:00:08 GUEST: Thanks for having me. I am excited to share what we are building.",
      "00:00:16 GUEST: The first challenge was trust. Customers liked the idea, but they worried we could not deliver on time.",
      "00:00:26 GUEST: We started publishing weekly delivery metrics publicly. Once people saw consistency, orders increased.",
      "00:00:49 GUEST: Start with one painful customer problem. Sell before you scale.",
    ],
  },
  {
    title: "User Research Interview (Verbatim)",
    transcript: [
      "00:00:01 RESEARCHER: Can you walk me through what happens when you try to upload your file?",
      "00:00:06 PARTICIPANT: Yeah, so, um, I click upload, and then I kind of wait because I am not sure if it is working.",
      "00:00:17 PARTICIPANT: The bar moves, but there is no message like, you know, upload complete.",
      "00:00:29 PARTICIPANT: Maybe a big green check, and maybe text saying, your file is safe, now go to payment.",
      "00:00:40 PARTICIPANT: Yeah, the pricing is okay, but I need to know turnaround before I pay.",
    ],
  },
  {
    title: "Team Meeting Notes (Auto)",
    transcript: [
      "00:00:03 SPEAKER 1: Quick updates. We shipped the dashboard changes yesterday.",
      "00:00:08 SPEAKER 2: Did we confirm payment webhook retries are active?",
      "00:00:13 SPEAKER 1: Yes. Failed events now retry three times.",
      "00:00:29 SPEAKER 1: Action item: add a delivery-time box at checkout and update upload tips.",
      "00:00:43 SPEAKER 1: Great. Next standup is tomorrow at 9:30.",
    ],
  },
];

const SampleTranscripts = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <LaunchOfferBanner compact />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Sample Transcript Outputs</h1>
          <p className="text-lg text-gray-600">
            Review examples across human-reviewed, verbatim, and auto-transcription formats.
          </p>
        </div>

        <div className="space-y-6">
          {samples.map((sample) => (
            <section key={sample.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{sample.title}</h2>
              <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap text-sm leading-7 font-mono">
                  {sample.transcript.join("\n")}
                </pre>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/upload"
            className="inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition"
          >
            Upload a File and Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SampleTranscripts;