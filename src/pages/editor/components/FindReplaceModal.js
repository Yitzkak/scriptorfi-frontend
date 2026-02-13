import React, { useRef, useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const FindReplaceModal = ({
  isOpen,
  onClose,
  findText,
  replaceText,
  setFindText,
  setReplaceText,
  handleFind,
  handleReplace,
  handleReplaceAll,
  caseSensitive,
  setCaseSensitive,
  wholeWord,
  setWholeWord,
}) => {
  const modalRef = useRef(null);
  const headerRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;
    setPosition({ x: 20, y: 80 });
  }, [isOpen]);

  const onMouseDown = (e) => {
    if (!headerRef.current || !modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 0);
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const onMouseUp = () => setDragging(false);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dragging, offset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        ref={modalRef}
        className="absolute bg-white w-[360px] rounded-2xl shadow-2xl border border-gray-100 pointer-events-auto overflow-hidden"
        style={{ left: position.x, top: position.y }}
      >
        {/* Header */}
        <div
          ref={headerRef}
          className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100 cursor-move"
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-2">
            <FiSearch className="text-gray-400" size={16} />
            <span className="font-semibold text-gray-700 text-sm">Find & Replace</span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <FiX className="text-gray-400" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Find</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Search text..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Replace with</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={e => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 accent-teal-500 rounded"
              />
              <span className="text-xs text-gray-600">Case sensitive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={e => setWholeWord(e.target.checked)}
                className="w-4 h-4 accent-teal-500 rounded"
              />
              <span className="text-xs text-gray-600">Whole word</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleFind}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
            >
              Find Next
            </button>
            <button
              onClick={handleReplace}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-400 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              className="px-4 py-2 text-sm font-medium text-teal-600 border border-teal-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all"
            >
              All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindReplaceModal;
