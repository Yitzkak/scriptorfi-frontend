import React from 'react';
import { FiX } from 'react-icons/fi';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: "Shift + Tab", action: "Toggle play/pause" },
    { keys: "Shift + ←", action: "Skip backward 5 seconds" },
    { keys: "Shift + →", action: "Skip forward 5 seconds" },
    { keys: "Ctrl + Shift", action: "Insert timestamp" },
    { keys: "Alt + S", action: "Format text with dashes (J-O-H-N)" },
    { keys: "Ctrl + U", action: "Convert to uppercase" },
    { keys: "Ctrl + G", action: "Title case (capitalize words)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-sm">⌨️</span>
            </div>
            <h2 className="font-semibold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX className="text-gray-400" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-1">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-600">{shortcut.action}</span>
                <kbd className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
