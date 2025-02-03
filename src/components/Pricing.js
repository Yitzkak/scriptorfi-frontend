import React, { useState } from "react";

const Pricing = () => {
  const [duration, setDuration] = useState(0);
  const [verbatim, setVerbatim] = useState(false);
  const [rushOrder, setRushOrder] = useState(false);

  const baseRate = 0.6;
  const verbatimRate = 0.2;
  const rushOrderRate = 0.5;

  const calculatePrice = () => {
    let total = duration * baseRate;
    if (verbatim) total += duration * verbatimRate;
    if (rushOrder) total += duration * rushOrderRate;
    return total.toFixed(2);
  };

  return (
    <div className="bg-gray-50 py-16 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="text-3xl font-bold text-center mb-4 text-gray-900 pt-10 md:text-4xl lg:text-5xl">Simple <span className="text-[#0FFCBE] font-semibold italic">&</span> Transparent Pricing</div>
        <p className="text-lg text-gray-600 mb-8">
          Get high-quality transcriptions at an unbeatable rate of <span className=" font-semibold">$0.6 per minute</span>.
          Customize your order with extra features for precise and fast results.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 max-w-xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Calculate Your Price</h3>
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Audio Duration (minutes)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]"
            value={duration}
            onChange={(e) => setDuration(Math.max(0, Number(e.target.value)))}
            placeholder="Enter duration"
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700">Verbatim (+$0.2/min)</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={verbatim} onChange={() => setVerbatim(!verbatim)} />
            <div className="w-10 h-5 bg-gray-300 peer-focus:ring-[#0FFCBE] rounded-full peer-checked:bg-[#0FFCBE]"></div>
          </label>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-700">Rush Order (+$0.5/min)</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={rushOrder} onChange={() => setRushOrder(!rushOrder)} />
            <div className="w-10 h-5 bg-gray-300 peer-focus:ring-[#0FFCBE] rounded-full peer-checked:bg-[#0FFCBE]"></div>
          </label>
        </div>

        <div className="text-lg font-semibold text-gray-800 mb-6">Total Cost: <span className="">${calculatePrice()}</span></div>
        <button className="w-full bg-[#0FFCBE] text-white py-3 rounded-lg font-semibold hover:bg-[#0DCFA2] transition">Get Started</button>
      </div>
    </div>
  );
};

export default Pricing;
