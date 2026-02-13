import React from "react";
import { FiX, FiRefreshCw, FiArrowRight } from "react-icons/fi";

const SwapSpeakerModal = ({ onClose, handleReplaceClick, handleSwapClick, fromLabel, toLabel, setFromLabel, setToLabel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[380px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <FiRefreshCw className="text-teal-500" size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">Speaker Labels</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
              <input
                type="text"
                value={fromLabel}
                onChange={(e) => setFromLabel(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                placeholder="S1"
              />
            </div>
            <div className="pt-5">
              <FiArrowRight className="text-gray-300" size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
              <input
                type="text"
                value={toLabel}
                onChange={(e) => setToLabel(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                placeholder="S2"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReplaceClick}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
          >
            Replace
          </button>
          <button
            onClick={handleSwapClick}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-400 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            Swap
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapSpeakerModal;
