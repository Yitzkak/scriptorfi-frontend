import React from "react";
import { Link } from "react-router-dom";
import { FiZap } from "react-icons/fi";

const LaunchOfferBanner = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-amber-900">
            48-Hour Launch Offer: 20% off your first order + free 5-minute trial. Ends soon.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
          >
            Claim Before Deadline <FiZap className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">48-Hour Launch Offer</p>
          <p className="text-sm font-semibold text-amber-900 md:text-base">
            Get 20% off your first transcription order and a free 5-minute trial. Offer closes soon.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Claim Offer Now
          <FiZap className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default LaunchOfferBanner;