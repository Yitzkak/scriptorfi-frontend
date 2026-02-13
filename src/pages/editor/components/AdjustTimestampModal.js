import React, { useState } from 'react';

const AdjustTimestampModal = ({ isOpen, onClose, onAdjust }) => {
  const [seconds, setSeconds] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    const value = parseFloat(seconds);
    if (!isNaN(value) && value !== 0) {
      onAdjust(Math.abs(value));
      setSeconds('');
      onClose();
    }
  };

  const handleSubtract = () => {
    const value = parseFloat(seconds);
    if (!isNaN(value) && value !== 0) {
      onAdjust(-Math.abs(value));
      setSeconds('');
      onClose();
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      if (action === 'add') {
        handleAdd();
      } else if (action === 'subtract') {
        handleSubtract();
      }
    }
  };

  const isValid = !isNaN(parseFloat(seconds)) && parseFloat(seconds) !== 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[380px] border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Adjust Timestamps</h2>
            <p className="text-xs text-gray-500 mt-0.5">Shift all selected timestamps</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Input field */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Seconds to adjust
          </label>
          <input
            type="number"
            step="0.1"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'add')}
            placeholder="e.g., 5 or 2.5"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
            autoFocus
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubtract}
            disabled={!isValid}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              isValid
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 12H4"/>
            </svg>
            Subtract
          </button>
          <button
            onClick={handleAdd}
            disabled={!isValid}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              isValid
                ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustTimestampModal;
