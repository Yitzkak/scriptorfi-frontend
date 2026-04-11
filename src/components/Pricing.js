import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import getSymbolFromCurrency from 'currency-symbol-map';
import { FiZap, FiUser } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import LaunchOfferBanner from "./LaunchOfferBanner";

const Pricing = () => {
  const [duration, setDuration] = useState(0);
  const [verbatim, setVerbatim] = useState(false);
  const [rushOrder, setRushOrder] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD']);
  const [pricingType, setPricingType] = useState('human'); // 'human' | 'auto'

  const humanRate = 0.5;
  const autoRate = 0.07;
  const verbatimRate = 0.2;
  const rushOrderRate = 0.5;

  // Fetch available currencies and user's preference
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await fetch('/api/user-profile/');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.currency) setCurrency(userData.currency);
        }
      } catch (error) {
        // not logged in
      }
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates) {
          const currencies = ['USD', ...Object.keys(data.rates)].sort();
          setAvailableCurrencies(currencies);
        }
      } catch (error) {
        console.error('Error fetching available currencies:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currency === 'USD') { setExchangeRate(1); return; }
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates[currency]) {
          setExchangeRate(data.rates[currency]);
        } else {
          setExchangeRate(1);
        }
      } catch (error) {
        setExchangeRate(1);
      }
    };
    fetchExchangeRate();
  }, [currency]);

  const baseRate = pricingType === 'auto' ? autoRate : humanRate;

  const calculatePrice = () => {
    if (pricingType === 'auto') {
      return (duration * autoRate * exchangeRate).toFixed(2);
    }
    let total = duration * humanRate;
    if (verbatim) total += duration * verbatimRate;
    if (rushOrder) total += duration * rushOrderRate;
    return (total * exchangeRate).toFixed(2);
  };

  const fmt = (usdRate) => (usdRate * exchangeRate).toFixed(2);
  const sym = getSymbolFromCurrency(currency) || currency + ' ';

  return (
    <section className="bg-white py-20 px-6 md:px-12 2xl:px-[19rem]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Pricing</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Simple &amp; transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Clear per-minute rates with optional add-ons. Know your total before you upload.
          </p>
        </div>

        <div className="mt-6 max-w-4xl mx-auto">
          <LaunchOfferBanner compact />
        </div>

        {/* Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setPricingType('human'); setVerbatim(false); setRushOrder(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                pricingType === 'human'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUser className="w-4 h-4" /> Human Transcription
            </button>
            <button
              onClick={() => setPricingType('auto')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                pricingType === 'auto'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiZap className="w-4 h-4" />
              Auto (Google Chirp AI)
              {pricingType !== 'auto' && (
                <span className="ml-1 bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full">86% cheaper</span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-start">

          {/* Pricing card */}
          {pricingType === 'human' ? (
            <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50 border border-teal-100 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-600">Base rate</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {sym}{fmt(humanRate)} / min
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Typical delivery</p>
                  <p className="text-lg font-semibold text-gray-900">24–48 hours</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Verbatim</span>
                  <span className="font-semibold text-gray-900">+{sym}{fmt(verbatimRate)} / min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Rush order</span>
                  <span className="font-semibold text-gray-900">+{sym}{fmt(rushOrderRate)} / min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Timestamps & speakers</span>
                  <span className="font-semibold text-gray-900">Included</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaRobot className="w-5 h-5 text-teal-200" />
                    <p className="text-sm font-semibold text-teal-100">Google Chirp AI</p>
                  </div>
                  <h3 className="text-3xl font-bold">
                    {sym}{fmt(autoRate)} / min
                  </h3>
                  <p className="text-teal-100 text-sm mt-1">86% cheaper than human transcription</p>
                </div>
                <div className="text-right">
                  <p className="text-teal-200 text-sm">Typical delivery</p>
                  <p className="text-lg font-semibold">Minutes</p>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {[
                  "Automatic punctuation & formatting",
                  "US, British, Australian & Canadian English",
                  "Delivered instantly to your dashboard",
                  "Best for clear audio recordings",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-teal-50 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculator */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900">Estimate your price</h3>
            <p className="text-sm text-gray-600 mt-1">
              {pricingType === 'auto'
                ? 'Google Chirp AI — pay by the minute, get results in minutes.'
                : 'Adjust options to preview your total.'}
            </p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              >
                {availableCurrencies.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>

            <div className="mt-2">
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

            {pricingType === 'human' && (
              <>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-gray-700">Verbatim (+{sym}{fmt(verbatimRate)}/min)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={verbatim} onChange={() => setVerbatim(!verbatim)} />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer-checked:bg-teal-500 transition-colors"></div>
                    <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></span>
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-gray-700">Rush order (+{sym}{fmt(rushOrderRate)}/min)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={rushOrder} onChange={() => setRushOrder(!rushOrder)} />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer-checked:bg-teal-500 transition-colors"></div>
                    <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></span>
                  </label>
                </div>
              </>
            )}

            {pricingType === 'auto' && (
              <div className="mt-5 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700 flex items-start gap-2">
                <FiZap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Flat rate {sym}{fmt(autoRate)}/min.</strong> No add-ons needed — punctuation, formatting, and delivery are all included.
                </span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-700 font-medium">Estimated total</span>
              <span className="text-2xl font-bold text-gray-900">{sym}{calculatePrice()}</span>
            </div>

            <Link
              to="/upload"
              className={`mt-6 block w-full py-3 rounded-lg font-semibold transition text-center text-white ${
                pricingType === 'auto' ? 'bg-teal-500 hover:bg-teal-600' : 'bg-teal-500 hover:bg-teal-600'
              }`}
            >
              {pricingType === 'auto' ? '⚡ Try Auto Transcription' : 'Get Started'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Pricing;