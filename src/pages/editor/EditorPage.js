// EditorPage.js - Integrated Editor Component
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import Textarea from './components/Textarea';
import MediaPlayer from './components/MediaPlayer';
import FindReplaceModal from './components/FindReplaceModal';
import SwapSpeakerModal from './components/SwapSpeakerModal';
import VersionHistoryModal from './components/VersionHistoryModal';
import { useNavigate, useLocation } from 'react-router-dom';
import './Editor.css';

function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mediaFile, setMediaFile] = useState(null);
  const [volume, setVolume] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [transcript, setTranscript] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [amplification, setAmplification] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [autosuggestionEnabled, setAutosuggestionEnabled] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [rightCtrlInsertProper, setRightCtrlInsertProper] = useState(() => {
    try {
      const v = localStorage.getItem('rightCtrlInsertProper');
      return v === 'true';
    } catch (e) {
      return false;
    }
  });
  const [rightCtrlSpeaker, setRightCtrlSpeaker] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem('rightCtrlSpeaker'), 10);
      return Number.isFinite(v) && v > 0 ? v : 1;
    } catch (e) {
      return 1;
    }
  });

  const [showSpeakerSnippets, setShowSpeakerSnippets] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [detectedSpeakerCount, setDetectedSpeakerCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [audioContext, setAudioContext] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [gainNode, setGainNode] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [gainValue, setGainValue] = useState(1);

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [fromLabel, setFromLabel] = useState('S1');
  const [toLabel, setToLabel] = useState('S2');

  const [versions, setVersions] = useState(() => {
    const saved = localStorage.getItem('transcript_versions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const editorRef = useRef(null);
  const mediaPlayerRef = useRef(null);
  const playRangeTimerRef = useRef(null);

  // Load transcript from location state or localStorage
  useEffect(() => {
    try {
      // Check location state first (passed from dashboard)
      if (location.state?.text) {
        setTranscript(location.state.text);
        if (location.state.fileName) {
          document.title = `Editor · ${location.state.fileName}`;
        }
        return;
      }
      
      // Fallback to localStorage
      const payloadRaw = localStorage.getItem('scriptorfi_editor_payload');
      if (!payloadRaw) return;
      const payload = JSON.parse(payloadRaw);
      if (payload?.text) {
        setTranscript(payload.text);
      }
      if (payload?.fileName) {
        document.title = `Editor · ${payload.fileName}`;
      }
      localStorage.removeItem('scriptorfi_editor_payload');
    } catch (e) {
      // Ignore parse errors
    }
  }, [location.state]);

  const handleIncrease = () => {
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.volume = Math.min(1, mediaPlayerRef.current.volume + 0.1);
    }
  };

  const handleDecrease = () => {
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.volume = Math.max(0, mediaPlayerRef.current.volume - 0.1);
    }
  };

  const handleAmplificationChange = (e) => {
    const value = parseFloat(e.target.value);
    setAmplification(value);
    mediaPlayerRef.current.updateAmplification(value);
  };

  const handleFileUpload = (file) => {
    console.log('[EditorPage] handleFileUpload: file selected', file?.name, file?.type, file?.size);
    setAudioLoading(true);
    setMediaFile(file);
  };

  const togglePlayPause = useCallback(() => mediaPlayerRef.current?.togglePlayPause(), []);
  const skipBack = useCallback(() => {
    mediaPlayerRef.current?.skipBack(5);
    mediaPlayerRef.current?.playAudio();
    return true;
  }, []); 
  const skipForward = useCallback(() => {
    mediaPlayerRef.current?.skipForward(5);
    mediaPlayerRef.current?.playAudio();
    return true;
  }, []);
  
  const goToStart = () => mediaPlayerRef.current?.seekTo(0);
  const goToEnd = () => mediaPlayerRef.current?.goToEnd(); 

  const increaseVolume = () => {
    setVolume((prev) => {
      const newVolume = Math.min(prev + 0.1, 1);
      return Math.round(newVolume * 10) / 10;
    });
  };

  function decreaseVolume() {
    setVolume((prevVolume) => {
      const newVolume = Math.max(prevVolume - 0.1, 0);
      return Math.round(newVolume * 10) / 10;
    });
  }

  const increaseFontSize = () => setFontSize(fontSize + 1);
  const decreaseFontSize = () => setFontSize(Math.max(fontSize - 1, 10));

  const handleTranscriptChange = (newTranscript) => {
    setTranscript(newTranscript);
  };

  const getTimestamp = useCallback(() => mediaPlayerRef.current?.getTimestamp(), []);
  const insertTimestamp = useCallback((timestamp, speakerNumber) => editorRef.current?.insertTimestamp(timestamp, speakerNumber), []);
  const insertTimestampForced = useCallback((timestamp, speakerNumber) => editorRef.current?.insertTimestampForced?.(timestamp, speakerNumber), []);
  const splitParagraphWithTimestamp = useCallback((timestamp, speakerNumber) => editorRef.current?.splitParagraphWithTimestamp?.(timestamp, speakerNumber), []);

  const downloadTranscript = () => {
    const getTextContent = () => editorRef.current?.getText();
    const textContent = getTextContent();
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'transcript.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const saveVersion = useCallback(() => {
    const getTextContent = () => editorRef.current?.getText();
    const textContent = getTextContent();
    if (!textContent || !textContent.trim()) return;

    const newVersion = {
      id: Date.now(),
      timestamp: Date.now(),
      content: textContent
    };

    setVersions(prevVersions => {
      const updatedVersions = [...prevVersions, newVersion];
      try {
        localStorage.setItem('transcript_versions', JSON.stringify(updatedVersions));
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('Cannot save version history: storage quota exceeded');
          const limitedVersions = updatedVersions.slice(-5);
          try {
            localStorage.setItem('transcript_versions', JSON.stringify(limitedVersions));
            return limitedVersions;
          } catch (retryError) {
            console.error('Failed to save even limited version history:', retryError);
          }
        } else {
          console.error('Error saving version history:', e);
        }
      }
      return updatedVersions;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      saveVersion();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [saveVersion]);

  const restoreVersion = (versionId) => {
    const version = versions.find(v => v.id === versionId);
    if (!version || !editorRef.current) return;

    saveVersion();
    editorRef.current.setText(version.content);
  };

  const deleteVersion = (versionId) => {
    setVersions(prevVersions => {
      const updatedVersions = prevVersions.filter(v => v.id !== versionId);
      try {
        localStorage.setItem('transcript_versions', JSON.stringify(updatedVersions));
      } catch (e) {
        console.error('Error saving version history after deletion:', e);
      }
      return updatedVersions;
    });
  };

  const formatParagraphBreaks = () => {
    const getTextContent = () => editorRef.current?.getText();
    const textContent = getTextContent();
    if (!textContent) return;

    saveVersion();

    const timestampPattern = /(\d+:\d+:\d+\.\d+\s+S\d+:)/g;
    const parts = textContent.split(timestampPattern);
    
    let formattedText = '';
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        if (i > 1) {
          formattedText += '\n\n';
        }
        formattedText += parts[i] + ' ';
      } else if (parts[i]) {
        formattedText += parts[i].trim();
      }
    }
    
    if (editorRef.current) {
      editorRef.current.setText(formattedText.trim());
    }
  };

  useEffect(() => {
    console.log('[EditorPage] performanceMode changed:', performanceMode);
  }, [performanceMode]);

  useEffect(() => {
    console.log('[EditorPage] audioLoading changed:', audioLoading);
  }, [audioLoading]);

  useEffect(() => {
    console.log('[EditorPage] mediaFile changed:', mediaFile?.name, mediaFile?.type, mediaFile?.size);
  }, [mediaFile]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mediaPlayerRef.current) {
        const time = mediaPlayerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);
  
  const toggleFindReplace = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleFind = () => {
    if (editorRef.current && findText) {
      editorRef.current.findAndHighlight(findText, caseSensitive, wholeWord);
    }
  };
  
  const handleReplace = () => {
    if (editorRef.current && findText && replaceText) {
      editorRef.current.replaceText(findText, replaceText, caseSensitive, wholeWord);
    }
  };
  
  const handleReplaceAll = () => {
    if (editorRef.current && findText && replaceText) {
      editorRef.current.replaceAll(findText, replaceText, caseSensitive, wholeWord);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('rightCtrlInsertProper', rightCtrlInsertProper ? 'true' : 'false');
    } catch (e) {}
  }, [rightCtrlInsertProper]);

  useEffect(() => {
    try {
      localStorage.setItem('rightCtrlSpeaker', String(rightCtrlSpeaker));
    } catch (e) {}
  }, [rightCtrlSpeaker]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.code === "Tab") {
        e.preventDefault();
        togglePlayPause();
      }
  
      if (e.code === 'ControlRight' && rightCtrlInsertProper && !e.shiftKey) {
        e.preventDefault();
        const timestamp = getTimestamp();
        if (timestamp) {
          try {
            const atStart = !!editorRef.current?.isCursorAtStartOfParagraph?.();
            if (atStart) {
              insertTimestamp(timestamp, rightCtrlSpeaker);
            } else {
              splitParagraphWithTimestamp(timestamp, rightCtrlSpeaker);
            }
          } catch (err) {
            splitParagraphWithTimestamp(timestamp, rightCtrlSpeaker);
          }
        }
        return;
      }

      if ((e.code === 'ControlRight' && !rightCtrlInsertProper && !e.shiftKey) || (e.ctrlKey && e.shiftKey && (e.code === "ControlLeft" || e.code === "ControlRight"))) {
        e.preventDefault();
        const timestamp = getTimestamp();
        if (timestamp) {
          insertTimestamp(timestamp, rightCtrlSpeaker);
        }
      }
  
      if (e.shiftKey && e.code === "ArrowLeft") {
        e.preventDefault();
        skipBack();
      }
  
      if (e.shiftKey && e.code === "ArrowRight") {
        e.preventDefault();
        skipForward();
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlayPause, getTimestamp, insertTimestamp, insertTimestampForced, splitParagraphWithTimestamp, skipBack, skipForward, rightCtrlInsertProper, rightCtrlSpeaker]);

  const handleReplaceSpeakerLabel = (fromLabel, toLabel) => {
    if (editorRef.current) {
      editorRef.current.replaceSpeakerLabel(fromLabel, toLabel);
    }
  };

  const handleSwapSpeakerLabels = (label1, label2) => {
    if (editorRef.current) {
      editorRef.current.swapSpeakerLabels(label1, label2);
    }
  };

  const handleSwapClick = () => {
    if (fromLabel && toLabel) {
      editorRef.current.swapSpeakerLabels(fromLabel, toLabel);
    }
  };

  const handleReplaceClick = () => {
    if (fromLabel && toLabel) {
      editorRef.current.replaceSpeakerLabel(fromLabel, toLabel);
    }
  };

  const handleRequestSwapModal = (selectedText) => {
    setShowSwapModal(true);
  };

  const handleWaveformClick = (time) => {
    console.log('EditorPage handleWaveformClick called with time:', time);
    if (editorRef.current) {
      editorRef.current.navigateToTime(time);
    }
  };

  const handleTimestampClick = (time) => {
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.seekTo(time);
      mediaPlayerRef.current.playAudio();
    }
  };

  const handleRequestPlayRange = (startSeconds, durationSeconds) => {
    if (!mediaPlayerRef.current) return;
    if (playRangeTimerRef.current) {
      clearTimeout(playRangeTimerRef.current);
      playRangeTimerRef.current = null;
    }
    mediaPlayerRef.current.seekTo(startSeconds || 0);
    mediaPlayerRef.current.playAudio();
    if (typeof durationSeconds === 'number' && durationSeconds > 0) {
      playRangeTimerRef.current = setTimeout(() => {
        mediaPlayerRef.current?.pauseAudio();
        playRangeTimerRef.current = null;
      }, Math.round(durationSeconds * 1000));
    }
  };

  const handleRequestStop = () => {
    if (playRangeTimerRef.current) {
      clearTimeout(playRangeTimerRef.current);
      playRangeTimerRef.current = null;
    }
    mediaPlayerRef.current?.pauseAudio();
  };

  useEffect(() => {
    if (editorRef.current && mediaFile) {
      editorRef.current.makeTimestampsClickable(handleTimestampClick);
    }
  }, [mediaFile]);

  const handleAmplifyIncrease = () => {
    setAmplification((prev) => Math.min(prev + 0.5, 5));
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.updateAmplification(Math.min(amplification + 0.5, 5));
    }
  };
  const handleAmplifyDecrease = () => {
    setAmplification((prev) => Math.max(prev - 0.5, 1));
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.updateAmplification(Math.max(amplification - 0.5, 1));
    }
  };

  const handleFixCapitalization = () => {
    if (!editorRef.current) return;
    if (editorRef.current.formatTitleCase) {
      editorRef.current.formatTitleCase();
    }
  };

  const handleFixTranscript = () => {
    if (editorRef.current && editorRef.current.fixTranscript) {
      editorRef.current.fixTranscript();
    }
  };

  const handleJoinParagraphs = () => {
    if (editorRef.current && editorRef.current.joinParagraphs) {
      editorRef.current.joinParagraphs();
    }
  };

  const handleRemoveActiveListeningCues = () => {
    if (editorRef.current && editorRef.current.removeActiveListeningCues) {
      editorRef.current.removeActiveListeningCues();
    }
  };

  const handleRemoveFillers = (fillers) => {
    if (editorRef.current && editorRef.current.removeFillerWords) {
      editorRef.current.removeFillerWords(fillers);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleHighlightRepeatedSpeakers = () => {
    if (editorRef.current && editorRef.current.highlightRepeatedSpeakers) {
      editorRef.current.highlightRepeatedSpeakers();
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleToggleSpeakerSnippets = () => {
    if (editorRef.current) {
      editorRef.current.toggleSpeakerSnippets();
      setShowSpeakerSnippets(!showSpeakerSnippets);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleToggleNotes = () => {
    if (editorRef.current) {
      editorRef.current.toggleNotes();
      setShowNotes(!showNotes);
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-[#fafbfc] flex flex-col">
      {/* Minimal Top Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img 
            src="/images/logo-icon-black.png" 
            alt="Scriptorfi" 
            className="w-8 h-8 object-contain"
          />
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-teal-500 font-semibold">Scriptorfi</p>
            <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">{mediaFile?.name || "No file loaded"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadTranscript}
            className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-full hover:border-gray-300 transition-all"
          >
            Export
          </button>
          <button
            onClick={goToDashboard}
            className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Loading Overlay */}
      {audioLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium text-gray-600">Loading audio...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden px-4 pt-2 pb-2 gap-2">
        {/* Player Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2">
          <MediaPlayer 
            ref={mediaPlayerRef} 
            mediaFile={mediaFile} 
            volume={volume || 1} 
            speed={playbackSpeed}
            performanceMode={performanceMode}
            setAudioLoading={setAudioLoading}
            onWaveformClick={handleWaveformClick}
          />
          <div className="mt-2">
            <Toolbar 
              onFileUpload={handleFileUpload}
              setPerformanceMode={setPerformanceMode}
              togglePlayPause={togglePlayPause}
              increaseVolume={increaseVolume}
              decreaseVolume={decreaseVolume}
              volume={volume}
              onVolumeChange={setVolume}
              skipBack={skipBack}
              skipForward={skipForward}
              goToStart={goToStart}
              goToEnd={goToEnd}
              increaseFontSize={increaseFontSize}
              decreaseFontSize={decreaseFontSize}
              transcript={transcript}
              currentTime={currentTime}
              onGetTimestamp={getTimestamp}
              onInsertTimestamp={insertTimestamp}
              rightCtrlInsertProper={rightCtrlInsertProper}
              setRightCtrlInsertProper={setRightCtrlInsertProper}
              rightCtrlSpeaker={rightCtrlSpeaker}
              setRightCtrlSpeaker={setRightCtrlSpeaker}
              toggleFindReplace={toggleFindReplace}
              handleAmplificationChange={handleAmplificationChange}
              amplification={amplification}
              downloadTranscript={downloadTranscript}
              onSave={formatParagraphBreaks}
              onShowVersionHistory={() => setShowVersionHistory(true)}
              speed={playbackSpeed * 100} 
              onSpeedChange={setPlaybackSpeed}
              onReplaceSpeakerLabel={handleReplaceSpeakerLabel} 
              onSwapSpeakerLabels={handleSwapSpeakerLabels} 
              onIncrease={handleIncrease} 
              onDecrease={handleDecrease}
              showSwapModal={showSwapModal}
              setShowSwapModal={setShowSwapModal}
              fromLabel={fromLabel}
              toLabel={toLabel}
              setFromLabel={setFromLabel}
              setToLabel={setToLabel}
              handleSwapClick={handleSwapClick}
              handleReplaceClick={handleReplaceClick}
              handleAmplifyIncrease={handleAmplifyIncrease}
              handleAmplifyDecrease={handleAmplifyDecrease}
              onFixCapitalization={handleFixCapitalization}
              onFixTranscript={handleFixTranscript}
              onJoinParagraphs={handleJoinParagraphs}
              onRemoveActiveListeningCues={handleRemoveActiveListeningCues}
              onRemoveFillers={handleRemoveFillers}
              autosuggestionEnabled={autosuggestionEnabled}
              setAutosuggestionEnabled={setAutosuggestionEnabled}
            />
          </div>
        </div>

        {/* Text Editor Section */}
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Textarea 
            ref={editorRef} 
            fontSize={fontSize} 
            transcript={transcript} 
            onTranscriptChange={handleTranscriptChange}
            onRequestSwapModal={handleRequestSwapModal}
            autosuggestionEnabled={autosuggestionEnabled}
            onRequestPlayRange={handleRequestPlayRange}
            onRequestStop={handleRequestStop}
          />
        </div>
      </main>

      <FindReplaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        findText={findText}
        replaceText={replaceText}
        setFindText={setFindText}
        setReplaceText={setReplaceText}
        handleReplace={handleReplace}
        handleFind={handleFind}
        handleReplaceAll={handleReplaceAll}
        caseSensitive={caseSensitive}
        setCaseSensitive={setCaseSensitive}
        wholeWord={wholeWord}
        setWholeWord={setWholeWord}
      />

      {showSwapModal && (
        <SwapSpeakerModal
          onClose={() => setShowSwapModal(false)}
          handleReplaceClick={handleReplaceClick}
          handleSwapClick={handleSwapClick}
          fromLabel={fromLabel}
          toLabel={toLabel}
          setFromLabel={setFromLabel}
          setToLabel={setToLabel}
        />
      )}

      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={versions}
        onRestore={restoreVersion}
        onDelete={deleteVersion}
      />
    </div>
  );
}

export default EditorPage;
