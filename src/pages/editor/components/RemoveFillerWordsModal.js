import React, { useState } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';

const commonFillers = [
  { word: 'uh', label: 'uh' },
  { word: 'um', label: 'um' },
  { word: 'umm', label: 'umm' },
  { word: 'like', label: 'like' },
  { word: 'you know', label: 'you know' },
  { word: 'I mean', label: 'I mean' },
  { word: 'sort of', label: 'sort of' },
  { word: 'kind of', label: 'kind of' },
  { word: 'basically', label: 'basically' },
  { word: 'literally', label: 'literally' },
  { word: 'actually', label: 'actually' },
  { word: 'right', label: 'right' },
  { word: 'okay', label: 'okay' },
  { word: 'so', label: 'so' },
  { word: 'well', label: 'well' },
  { word: 'yeah', label: 'yeah' },
  { word: 'hmm', label: 'hmm' },
  { word: 'huh', label: 'huh' },
];

const RemoveFillerWordsModal = ({ isOpen, onClose, onRemoveFillers }) => {
  const [selectedFillers, setSelectedFillers] = useState([]);

  if (!isOpen) return null;

  const handleToggleFiller = (word) => {
    setSelectedFillers(prev => 
      prev.includes(word) 
        ? prev.filter(f => f !== word)
        : [...prev, word]
    );
  };

  const handleSelectAll = () => {
    if (selectedFillers.length === commonFillers.length) {
      setSelectedFillers([]);
    } else {
      setSelectedFillers(commonFillers.map(f => f.word));
    }
  };

  const handleRemove = () => {
    if (selectedFillers.length > 0) {
      onRemoveFillers(selectedFillers);
      setSelectedFillers([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[440px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <FiTrash2 className="text-red-400" size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">Remove Filler Words</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-500 mb-4">
            Select the filler words to remove from your transcript:
          </p>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="text-xs font-medium text-teal-600 hover:text-teal-700 mb-4"
          >
            {selectedFillers.length === commonFillers.length ? 'Deselect all' : 'Select all'}
          </button>

          {/* Filler words grid */}
          <div className="grid grid-cols-2 gap-2">
            {commonFillers.map(({ word, label }) => (
              <label
                key={word}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedFillers.includes(word) 
                    ? 'bg-teal-50 border border-teal-200' 
                    : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFillers.includes(word)}
                  onChange={() => handleToggleFiller(word)}
                  className="w-4 h-4 accent-teal-500 rounded"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {selectedFillers.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              disabled={selectedFillers.length === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedFillers.length > 0
                  ? 'text-white bg-gradient-to-r from-red-500 to-red-400 shadow-sm hover:shadow-md'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}
            >
              Remove Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveFillerWordsModal;
