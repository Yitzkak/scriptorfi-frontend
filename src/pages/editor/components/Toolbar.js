// Toolbar.js
import React, { useRef, useState, useEffect } from 'react';
import AmplifyVolumeModal from './AmplifyVolumeModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import RemoveFillerWordsModal from './RemoveFillerWordsModal';

// Icons
import { FiDownload, FiZoomIn, FiZoomOut, FiSave, FiClock, FiRotateCcw, FiUpload, FiSettings, FiSearch } from 'react-icons/fi';
import { HiOutlinePlay, HiOutlinePause } from 'react-icons/hi2';
import { TbRewindBackward5, TbRewindForward5, TbPlayerSkipBack, TbPlayerSkipForward } from 'react-icons/tb';
import { RiVolumeUpLine, RiVolumeMuteLine } from 'react-icons/ri';
import { MdMoreTime } from 'react-icons/md';

const Toolbar = ({ 
  onFileUpload,
  setPerformanceMode,
  togglePlayPause,
  increaseVolume,
  decreaseVolume,
  volume,
  onVolumeChange,
  skipBack,
  skipForward,
  goToStart,
  goToEnd,
  increaseFontSize,
  decreaseFontSize,
  currentTime,
  onGetTimestamp,
  onInsertTimestamp,
  rightCtrlInsertProper,
  setRightCtrlInsertProper,
  rightCtrlSpeaker,
  setRightCtrlSpeaker,
  toggleFindReplace,
  onAmplifyClick,
  handleAmplificationChange,
  amplification,
  onIncrease, 
  onDecrease,
  downloadTranscript,
  speed, 
  onSpeedChange,
  onReplaceSpeakerLabel, 
  onSwapSpeakerLabels,
  handlePreventBlur,
  showSwapModal,
  setShowSwapModal,
  fromLabel,
  toLabel,
  setFromLabel,
  setToLabel,
  handleSwapClick,
  handleReplaceClick,
  handleAmplifyIncrease,
  handleAmplifyDecrease,
  onFixCapitalization,
  autosuggestionEnabled,
  setAutosuggestionEnabled,
  onFixTranscript,
  onJoinParagraphs,
  onRemoveActiveListeningCues,
  onRemoveFillers,
  onSave,
  onShowVersionHistory,
}) => {
  const fileInputRef = useRef(null);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [speedInput, setSpeedInput] = useState(`${speed}%`);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAmplifyOpen, setIsAmplifyOpen] = useState(false);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);
  const [showRemoveFillers, setShowRemoveFillers] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const dropdownRef = useRef(null);
  const moreButtonRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [dropdownOpen]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    setShowPerfModal(true);
  };

  const handleTimestamp = () => {
    const timestamp = onGetTimestamp();
    onInsertTimestamp(timestamp);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    togglePlayPause();
  };

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const handleInputChange = (e) => {
    let value = e.target.value.replace("%", "");
    setSpeedInput(value + "%");
  };

  const handleSpeedUpdate = () => {
    let numValue = parseInt(speedInput.replace("%", ""), 10);
    if (isNaN(numValue)) numValue = 100;
    numValue = Math.max(50, Math.min(numValue, 200));
    setSpeedInput(`${numValue}%`);
    onSpeedChange(numValue / 100);
  };

  // Sleek icon button component
  const IconBtn = ({ onClick, disabled, title, children, active, size = "md" }) => {
    const sizeClasses = size === "lg" 
      ? "w-12 h-12" 
      : size === "sm" 
        ? "w-8 h-8" 
        : "w-10 h-10";
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`
          ${sizeClasses} flex items-center justify-center rounded-full transition-all duration-200
          ${active 
            ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-white shadow-lg shadow-teal-500/30' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left: Time Display */}
      <div className="flex items-center gap-2 min-w-[80px]">
        <span className="text-lg font-light text-gray-900 tabular-nums tracking-tight">
          {formatTime(currentTime)}
        </span>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-1">
        <IconBtn onClick={goToStart} title="Go to start" size="sm">
          <TbPlayerSkipBack size={16} />
        </IconBtn>
        <IconBtn onClick={skipBack} title="Rewind 5s">
          <TbRewindBackward5 size={20} />
        </IconBtn>
        <IconBtn onClick={handlePlayPause} title="Play/Pause" size="lg" active={isPlaying}>
          {isPlaying ? <HiOutlinePause size={24} /> : <HiOutlinePlay size={24} className="ml-0.5" />}
        </IconBtn>
        <IconBtn onClick={skipForward} title="Forward 5s">
          <TbRewindForward5 size={20} />
        </IconBtn>
        <IconBtn onClick={goToEnd} title="Go to end" size="sm">
          <TbPlayerSkipForward size={16} />
        </IconBtn>
      </div>

      {/* Right: Tools & Controls */}
      <div className="flex items-center gap-1">
        {/* Volume */}
        <div className="flex items-center gap-0.5 px-2">
          <IconBtn onClick={decreaseVolume} disabled={volume === 0} title="Volume down" size="sm">
            <RiVolumeMuteLine size={16} />
          </IconBtn>
          <div className="relative w-20 h-6 flex items-center mx-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                // Call increaseVolume/decreaseVolume logic or directly set if available
                if (typeof onVolumeChange === 'function') {
                  onVolumeChange(newVolume);
                }
              }}
              className="volume-slider w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #14b8a6 0%, #10b981 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
          <IconBtn onClick={increaseVolume} disabled={volume === 1} title="Volume up" size="sm">
            <RiVolumeUpLine size={16} />
          </IconBtn>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-2" />

        {/* Speed Control */}
        <div className="flex items-center gap-1.5 px-2">
          <span className="text-xs text-gray-400 font-medium">Speed</span>
          <input
            type="text"
            value={speedInput}
            onChange={handleInputChange}
            onBlur={handleSpeedUpdate}
            onKeyDown={(e) => e.key === "Enter" && handleSpeedUpdate()}
            className="w-14 text-center text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>

        <div className="w-px h-6 bg-gray-200 mx-2" />

        {/* Quick Actions */}
        <IconBtn onClick={handleTimestamp} title="Add timestamp (Ctrl + Shift)" size="sm">
          <MdMoreTime size={18} />
        </IconBtn>
        <IconBtn onClick={toggleFindReplace} title="Find & Replace" size="sm">
          <FiSearch size={16} />
        </IconBtn>
        <IconBtn onClick={increaseFontSize} title="Increase font" size="sm">
          <FiZoomIn size={16} />
        </IconBtn>
        <IconBtn onClick={decreaseFontSize} title="Decrease font" size="sm">
          <FiZoomOut size={16} />
        </IconBtn>
        <IconBtn onClick={onSave} title="Save" size="sm">
          <FiSave size={16} />
        </IconBtn>
        <IconBtn onClick={onShowVersionHistory} title="Version History" size="sm">
          <FiRotateCcw size={16} />
        </IconBtn>
        <IconBtn onClick={downloadTranscript} title="Download" size="sm">
          <FiDownload size={16} />
        </IconBtn>
        <IconBtn onClick={handleUploadClick} title="Upload file" size="sm">
          <FiUpload size={16} />
        </IconBtn>

        {/* Settings Menu */}
        <div className="relative ml-1">
          <button 
            ref={moreButtonRef} 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            title="More options"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <FiSettings size={16} />
          </button>

          {dropdownOpen && (
            <div 
              ref={dropdownRef} 
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
            >
              {/* Right-Ctrl Option */}
              <div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <label htmlFor="right-ctrl-toggle" className="text-sm text-gray-700 cursor-pointer">
                  Right-Ctrl inserts timestamp
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={rightCtrlSpeaker || 1}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || '1', 10) || 1;
                      if (typeof setRightCtrlSpeaker === 'function') setRightCtrlSpeaker(v);
                    }}
                    className="w-14 text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    title="Speaker number"
                  />
                  <input
                    type="checkbox"
                    checked={!!rightCtrlInsertProper}
                    onChange={(e) => {
                      if (typeof setRightCtrlInsertProper === 'function') setRightCtrlInsertProper(e.target.checked);
                    }}
                    className="w-4 h-4 accent-teal-500"
                    id="right-ctrl-toggle"
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1" />

              <MenuItem 
                onClick={() => { setShowSwapModal(true); setDropdownOpen(false); }}
                icon="⇄"
                label="Swap Speaker Labels"
              />
              <MenuItem 
                onClick={() => { setIsAmplifyOpen(true); setDropdownOpen(false); }}
                icon="🔊"
                label="Amplify Audio"
              />
              <MenuItem 
                onClick={() => { setShowKeyboardShortcutsModal(true); setDropdownOpen(false); }}
                icon="⌨"
                label="Keyboard Shortcuts"
              />

              <div className="h-px bg-gray-100 my-1" />

              {/* Autosuggestion Toggle */}
              <div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <label htmlFor="autosuggestion-toggle" className="text-sm text-gray-700 cursor-pointer">
                  Enable Autosuggestion
                </label>
                <input
                  type="checkbox"
                  checked={autosuggestionEnabled}
                  onChange={e => setAutosuggestionEnabled(e.target.checked)}
                  className="w-4 h-4 accent-teal-500"
                  id="autosuggestion-toggle"
                />
              </div>

              <div className="h-px bg-gray-100 my-1" />

              <MenuItem 
                onClick={() => { onFixCapitalization(); setDropdownOpen(false); }}
                icon="Aa"
                label="Fix Capitalization"
              />
              <MenuItem 
                onClick={() => { onFixTranscript(); setDropdownOpen(false); }}
                icon="✎"
                label="Fix Transcript"
              />
              <MenuItem 
                onClick={() => { onJoinParagraphs(); setDropdownOpen(false); }}
                icon="¶"
                label="Join Paragraphs"
              />
              <MenuItem 
                onClick={() => { onRemoveActiveListeningCues(); setDropdownOpen(false); }}
                icon="🗣"
                label="Remove Listening Cues"
              />
              <MenuItem 
                onClick={() => { setShowRemoveFillers(true); setDropdownOpen(false); }}
                icon="🗑"
                label="Remove Filler Words"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="audio/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Performance Mode Modal */}
      {showPerfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPerfModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[380px] border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Mode</h3>
            <p className="text-sm text-gray-500 mb-5">Choose based on your file duration</p>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all group"
                onClick={() => {
                  setPerformanceMode(false);
                  setShowPerfModal(false);
                  fileInputRef.current?.click();
                }}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                  <FiUpload className="text-gray-500 group-hover:text-teal-600" size={18} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Standard Upload</p>
                  <p className="text-xs text-gray-500">Up to 3 hours · Full waveform</p>
                </div>
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
                onClick={() => {
                  setPerformanceMode(true);
                  setShowPerfModal(false);
                  fileInputRef.current?.click();
                }}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <FiClock className="text-gray-500 group-hover:text-emerald-600" size={18} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Performance Mode</p>
                  <p className="text-xs text-gray-500">Over 3 hours · Optimized playback</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showRemoveFillers && (
        <RemoveFillerWordsModal
          isOpen={showRemoveFillers}
          onClose={() => setShowRemoveFillers(false)}
          onRemoveFillers={onRemoveFillers}
        />
      )}

      {isAmplifyOpen && (
        <AmplifyVolumeModal
          isOpen={isAmplifyOpen}
          onClose={() => setIsAmplifyOpen(false)}
          onIncrease={handleAmplifyIncrease}
          onDecrease={handleAmplifyDecrease}
          amplification={amplification}
        />
      )}

      {showKeyboardShortcutsModal && (
        <KeyboardShortcutsModal
          isOpen={showKeyboardShortcutsModal}
          onClose={() => setShowKeyboardShortcutsModal(false)}
        />
      )}
    </div>
  );
};

// Menu item component
const MenuItem = ({ onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
  >
    <span className="w-5 text-center text-base">{icon}</span>
    <span>{label}</span>
  </button>
);

export default Toolbar;
