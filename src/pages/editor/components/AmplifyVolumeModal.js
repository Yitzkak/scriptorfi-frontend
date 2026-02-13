import React from 'react';
import { FiX, FiMinus, FiPlus, FiVolume2 } from 'react-icons/fi';

const AmplifyVolumeModal = ({ isOpen, onClose, onIncrease, onDecrease, amplification }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[320px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <FiVolume2 className="text-teal-500" size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">Amplify Audio</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current value display */}
          <div className="text-center mb-6">
            <div className="text-4xl font-light text-gray-900 tabular-nums">
              {amplification.toFixed(1)}x
            </div>
            <p className="text-sm text-gray-400 mt-1">amplification level</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onDecrease}
              className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <FiMinus className="text-gray-600" size={20} />
            </button>
            
            {/* Visual indicator */}
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${((amplification - 1) / 4) * 100}%` }}
              />
            </div>
            
            <button
              onClick={onIncrease}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all"
            >
              <FiPlus className="text-white" size={20} />
            </button>
          </div>

          {/* Range labels */}
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <span>1.0x</span>
            <span>5.0x</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmplifyVolumeModal;
