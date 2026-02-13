import React, { useState } from "react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const [duration, setDuration] = useState(0);
  const [verbatim, setVerbatim] = useState(false);
  const [rushOrder, setRushOrder] = useState(false);

  const baseRate = 0.5;
  const verbatimRate = 0.2;
  const rushOrderRate = 0.5;

  const calculatePrice = () => {
    let total = duration * baseRate;
    if (verbatim) total += duration * verbatimRate;
    if (rushOrder) total += duration * rushOrderRate;
    return total.toFixed(2);
  };

  return (
    <section className="bg-white py-20 px-6 md:px-12 2xl:px-[19rem]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Pricing</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Simple & transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Clear per‑minute rates with optional add‑ons. Know your total before you upload.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50 border border-teal-100 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-600">Base rate</p>
                <h3 className="text-3xl font-bold text-gray-900">$0.50 / min</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Typical delivery</p>
                <p className="text-lg font-semibold text-gray-900">24–48 hours</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Verbatim</span>
                <span className="font-semibold text-gray-900">+$0.20 / min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Rush order</span>
                <span className="font-semibold text-gray-900">+$0.50 / min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Timestamps & speakers</span>
                <span className="font-semibold text-gray-900">Included</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900">Estimate your price</h3>
            <p className="text-sm text-gray-600 mt-1">Adjust options to preview your total.</p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Audio duration (minutes)</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={duration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(value) && value.trim() !== "")) {
                    setDuration(value === "" ? "" : Math.max(0, Number(value)));
                  }
                }}
                placeholder="Enter duration"
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-gray-700">Verbatim (+$0.20/min)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={verbatim} onChange={() => setVerbatim(!verbatim)} />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer-checked:bg-teal-500 transition-colors"></div>
                <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></span>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-gray-700">Rush order (+$0.50/min)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={rushOrder} onChange={() => setRushOrder(!rushOrder)} />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer-checked:bg-teal-500 transition-colors"></div>
                <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-700 font-medium">Estimated total</span>
              <span className="text-2xl font-bold text-gray-900">${calculatePrice()}</span>
            </div>

            <Link
              to="/upload"
              className="mt-6 block w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
