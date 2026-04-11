import React from "react";
import LaunchOfferBanner from "../components/LaunchOfferBanner";

const faqGroups = [
  {
    title: "Pricing",
    items: [
      {
        q: "How much does transcription cost?",
        a: "Human transcription starts at $0.50 per minute. Auto transcription starts at $0.07 per minute.",
      },
      {
        q: "Are there add-ons?",
        a: "For human transcription, Verbatim is +$0.20 per minute and Rush Order is +$0.50 per minute.",
      },
      {
        q: "Do you support multiple currencies?",
        a: "Yes. Checkout supports multiple currencies and shows your estimate before payment.",
      },
    ],
  },
  {
    title: "Turnaround",
    items: [
      {
        q: "How fast will I get my transcript?",
        a: "Auto transcription is typically delivered in minutes. Human transcription is typically delivered in 24 to 72 hours, based on file complexity and selected options.",
      },
      {
        q: "What affects turnaround time?",
        a: "Audio quality, file duration, number of speakers, background noise, and whether rush order is selected.",
      },
    ],
  },
  {
    title: "Revisions and Refunds",
    items: [
      {
        q: "Do I get revisions?",
        a: "Yes. If your transcript does not match your submitted instructions, you can request a revision.",
      },
      {
        q: "How do refunds work?",
        a: "If work has not started and no transcript was delivered, you can request a full refund. If a transcript has been delivered, we first offer revisions. If a confirmed quality issue cannot be resolved, a partial or full refund may be approved.",
      },
      {
        q: "How can I contact support?",
        a: "Email support@scriptorfi.com with your order reference, file name, and request details.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <LaunchOfferBanner compact />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">Everything you need to know before placing your order.</p>
        </div>

        <div className="space-y-8">
          {faqGroups.map((group) => (
            <section key={group.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-5">{group.title}</h2>
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.q} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900">{item.q}</h3>
                    <p className="text-gray-700 mt-2">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;