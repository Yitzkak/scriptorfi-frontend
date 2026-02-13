import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Fuse from 'fuse.js';
import AdjustTimestampModal from './AdjustTimestampModal';

const predefinedWords = [
  'Objection, form.', 
  'Object to form', 
  '[overlapping conversation]', '[laughter]', '[pause]', '[chuckle]', 
  '[automated voice]', '[video playback]',
  '[background conversation]', '[foreign language]', '[vocalization]',
  // Add more common phrases for contextual suggestions
  'Let the record reflect',
  'Off the record',
  'Back on the record',
  'I don\'t recall',
  'I don\'t understand the question',
  'Can you repeat the question?',
  'Move to strike',
  'No further questions',
  'Redirect examination',
  'Cross-examination',
];

// Meta tag shortcuts - typing "[" + two letters auto-expands to full tag
const metaTagShortcuts = {
  'ov': '[overlapping conversation]',
  'la': '[laughter]',
  'pa': '[pause]',
  'ch': '[chuckle]',
  'au': '[automated voice]',
  'vi': '[video playback]',
  'ba': '[background conversation]',
  'fo': '[foreign language]',
  'vo': '[vocalization]',
};

const Textarea = forwardRef(({ fontSize, transcript, onTranscriptChange, onRequestSwapModal, autosuggestionEnabled, onRequestPlayRange, onRequestStop }, ref) => {
  const editorRef = useRef(null);
  const quillInstanceRef = useRef(null); // Store Quill instance here
  const [highlightedText, setHighlightedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Notes panel state
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem('transcript_notes') || '';
    } catch (e) {
      return '';
    }
  });
  const [notesWidth, setNotesWidth] = useState(() => {
    try {
      const saved = parseInt(localStorage.getItem('transcript_notes_width'), 10);
      return Number.isFinite(saved) && saved > 0 ? saved : 320; // default 320px
    } catch (e) {
      return 320;
    }
  });
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(320);

  const suggestionsRef = useRef(suggestions);
  const suggestionTriggerRef = useRef(false);
  const virtualCursorsRef = useRef([]);
  const cursorOverlayRef = useRef(null);
  const formattedRangesRef = useRef([]);
  const [timestampIndex, setTimestampIndex] = useState([]);
  const [onTimestampClick, setOnTimestampClick] = useState(null);
  const timestampHighlightsRef = useRef([]);
  const [invalidTimestampCount, setInvalidTimestampCount] = useState(0);
  const [currentInvalidIndex, setCurrentInvalidIndex] = useState(0);
  const timestampInvalidsRef = useRef([]);
  const [showInvalidList, setShowInvalidList] = useState(false);
  const [invalidPanelMaxHeight, setInvalidPanelMaxHeight] = useState(400);
  const [invalidPanelWidth, setInvalidPanelWidth] = useState(() => {
    try {
      const saved = parseInt(localStorage.getItem('invalid_panel_width'), 10);
      return Number.isFinite(saved) && saved > 120 ? saved : 320;
    } catch (e) {
      return 320;
    }
  });
  const isResizingInvalidRef = useRef(false);
  const startXInvalidRef = useRef(0);
  const startWidthInvalidRef = useRef(320);
  const validateTimerRef = useRef(null);
  const [validateTimestampsEnabled, setValidateTimestampsEnabled] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    timestamp: null,
    clickIndex: 0,
    selectedText: '',
    showGoogle: false,
    showPlay: false,
    showSwapSpeaker: false,
    showSpeakerSnippets: false,
  });

  const contextMenuRef = useRef(null);

  const lastMenuOpenTimeRef = useRef(0);

  const suggestionContextRef = useRef({ prefix: '', cursorIndex: 0 });

  // Add a ref for the suggestions popup
  const suggestionsBoxRef = useRef(null);

  // Speaker snippets state
  // Speaker names mapping: { S1: "Name", S2: "Name2", ... }
  const [speakerNames, setSpeakerNames] = useState(() => {
    try {
      const saved = localStorage.getItem('speaker_names');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [showSpeakerSnippets, setShowSpeakerSnippets] = useState(false);
  const [speakerSnippets, setSpeakerSnippets] = useState({}); // { S1: [{start,end,index}], ... }
  const [speakerOrder, setSpeakerOrder] = useState([]); // ["S1","S2",...]
  const [snippetCount, setSnippetCount] = useState(() => {
    try {
      const val = parseInt(localStorage.getItem('snippet_count'), 10);
      return Number.isFinite(val) && val > 0 ? val : 3;
    } catch (e) {
      return 3;
    }
  });
  // eslint-disable-next-line no-unused-vars
  const [snippetDuration, setSnippetDuration] = useState(() => {
    try {
      const val = parseFloat(localStorage.getItem('snippet_duration'), 10);
      return Number.isFinite(val) && val > 0 ? val : 3;
    } catch (e) {
      return 3;
    }
  });
  const [detectedSpeakerCount, setDetectedSpeakerCount] = useState(0);
  const [snippetsWidth, setSnippetsWidth] = useState(() => {
    try {
      const saved = parseInt(localStorage.getItem('transcript_snippets_width'), 10);
      return Number.isFinite(saved) && saved > 0 ? saved : 320; // default 320px
    } catch (e) {
      return 320;
    }
  });
  const isResizingSnippetsRef = useRef(false);
  const startXSnippetsRef = useRef(0);
  const startWidthSnippetsRef = useRef(320);

  // Add this state for speaker characteristics
  const [speakerCharacteristics, setSpeakerCharacteristics] = useState({}); // { S1: ["deep voice", ...], ... }

  // Adjust Timestamp state
  const [showAdjustTimestamp, setShowAdjustTimestamp] = useState(false);
  const adjustTimestampRangeRef = useRef(null);

  // Find & Replace state
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceTextValue, setReplaceTextValue] = useState('');
  const [findResultCount, setFindResultCount] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(true);
  const [showHighlightRepeated, setShowHighlightRepeated] = useState(false);
  const repeatedPositionsRef = useRef([]); // stores { index, length }
  const [currentRepeatedIndex, setCurrentRepeatedIndex] = useState(0);
  const [replaceMode, setReplaceMode] = useState(null); // { selectedText, range } or null
  const replaceInputRef = useRef('');

  // Function to capitalize all letters
  const formatUppercase = () => {
    if (!quillInstanceRef.current) return;
  
    const range = quillInstanceRef.current.getSelection();
    if (range && range.length > 0) {
      const selectedText = quillInstanceRef.current.getText(range.index, range.length);
      const transformedText = selectedText.toUpperCase();
  
      quillInstanceRef.current.deleteText(range.index, range.length); 
      quillInstanceRef.current.insertText(range.index, transformedText);
    }
  };
  
  // Function to capitalize the first letter of each word
  const formatTitleCase = () => {
    if (!quillInstanceRef.current) return;

    // Save the current selection (cursor position) and scroll position
    const currentSelection = quillInstanceRef.current.getSelection();
    const editorEl = editorRef.current?.querySelector('.ql-editor');
    const prevScrollTop = editorEl ? editorEl.scrollTop : null;

    // Get the entire transcript text
    const content = quillInstanceRef.current.getText();
    // Split into lines to handle multi-line transcript
    const lines = content.split(/(\r?\n)/);
    const transformedLines = lines.map(line => {
      if (/^\r?\n$/.test(line)) return line;
      let processed = line;
      // Capitalize after timestamp+speaker label (accept non-digit speaker IDs like S?:)
      processed = processed.replace(/((\d{1,2}:){2}\d{1,2}(?:\.\d+)?\s+S[^:\s]+:\s*)([a-zA-Z])/, (m, p1, _p2, p3) => {
        return p1 + p3.toUpperCase();
      });
      // Capitalize after . ? ! (sentence boundaries)
      processed = processed.replace(/([.!?]\s+)([a-zA-Z])/g, (m, p1, p2) => {
        return p1 + p2.toUpperCase();
      });
      // Capitalize first non-space character of the line
      processed = processed.replace(/(^\s*[a-zA-Z])/, m => {
        return m.toUpperCase();
      });
      return processed;
    });
    const transformedText = transformedLines.join("");
    quillInstanceRef.current.setText(transformedText, 'silent');

    // Restore the previous selection (cursor position)
    if (currentSelection) {
      // Clamp the index to the new text length
      const newLength = quillInstanceRef.current.getLength();
      const index = Math.min(currentSelection.index, newLength - 1);
      quillInstanceRef.current.setSelection(index, currentSelection.length || 0, 'silent');
    }
    if (editorEl && prevScrollTop !== null) {
      editorEl.scrollTop = prevScrollTop;
    }
  };

  // Function to capitalize first letter of each word in current selection
  const formatSelectionTitleCase = () => {
    if (!quillInstanceRef.current) return;
    const range = quillInstanceRef.current.getSelection();
    if (!range || range.length === 0) return;
    const selectedText = quillInstanceRef.current.getText(range.index, range.length);
    const transformedText = selectedText.replace(/\b([a-zA-Z])/g, (m, p1) => p1.toUpperCase());
    quillInstanceRef.current.deleteText(range.index, range.length);
    quillInstanceRef.current.insertText(range.index, transformedText);
    quillInstanceRef.current.setSelection(range.index, transformedText.length);
  };

  // Function to format spellings
  const formatSpelling = () => {
    if (!quillInstanceRef.current) return;
  
    const range = quillInstanceRef.current.getSelection();
    if (range && range.length > 0) {
      const selectedText = quillInstanceRef.current.getText(range.index, range.length).trim();
  
      // Check if text is already in spelled-out format (e.g., "S H, A, N, N, O, N" or "S H A N N O N")
      // Remove all separators (commas, spaces, hyphens) and special characters, keeping only letters and numbers
      const cleanedText = selectedText.replace(/[^a-zA-Z0-9]/g, '');
  
      // Format text with hyphens between each character
      const formattedText = cleanedText.toUpperCase().split('').join('-');
  
      // Replace the selected text with formatted text
      quillInstanceRef.current.deleteText(range.index, range.length);
      quillInstanceRef.current.insertText(range.index, formattedText);
    }
  };

  const getWordsFromTranscript = () => {
    if (!quillInstanceRef.current) return { suggestions: [], displayToOriginal: {} };
    const content = quillInstanceRef.current.getText();
    // Extract all words (case-insensitive)
    const wordMatches = content.match(/\b\w+\b/g) || [];
    const freqMap = {};
    const originalCaseMap = {};
    wordMatches.forEach(word => {
      const lower = word.toLowerCase();
      freqMap[lower] = (freqMap[lower] || 0) + 1;
      // Store the first occurrence with original casing
      if (!originalCaseMap[lower]) originalCaseMap[lower] = word;
    });
    // Sort words by frequency, then alphabetically
    const sortedWords = Object.keys(freqMap)
      .sort((a, b) => freqMap[b] - freqMap[a] || a.localeCompare(b));
    // Use original case for display and insertion
    const displayToOriginal = {};
    const displayWords = sortedWords.map(w => {
      displayToOriginal[originalCaseMap[w]] = originalCaseMap[w];
      return originalCaseMap[w];
    });
    // Add predefinedWords (phrases) as-is
    predefinedWords.forEach(phrase => {
      displayToOriginal[phrase] = phrase;
    });
    const allSuggestions = [...predefinedWords, ...displayWords.filter(w => !predefinedWords.includes(w))];
    return { suggestions: allSuggestions, displayToOriginal };
  };

  const handleTextChange = () => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    const range = quill.getSelection();
    if (!range) return;
    // Only show suggestions if the user recently typed or pasted — avoid showing on mouse clicks
    if (!suggestionTriggerRef.current) {
      setSuggestions([]);
      return;
    }
    const textBeforeCursor = quill.getText(0, range.index);
    
    // Check for meta tag shortcut expansion (e.g., "[ov" -> "[overlapping conversation]")
    const metaTagMatch = textBeforeCursor.match(/\[([a-z]{2})$/i);
    if (metaTagMatch) {
      const shortcut = metaTagMatch[1].toLowerCase();
      const expandedTag = metaTagShortcuts[shortcut];
      if (expandedTag) {
        // Auto-expand the shortcut
        const startIndex = range.index - 3; // Position of "["
        quill.deleteText(startIndex, 3); // Delete "[" + two letters
        quill.insertText(startIndex, expandedTag + ' ');
        quill.setSelection(startIndex + expandedTag.length + 1);
        setSuggestions([]);
        return;
      }
    }
    
    // Use word boundary detection to find the current word being typed
    const match = textBeforeCursor.match(/\b\w*$/);
    const prefix = match ? match[0] : '';
    suggestionContextRef.current = { prefix, cursorIndex: range.index };
    let allSuggestions = [];
    let displayToOriginal = {};
    if (autosuggestionEnabled) {
      // Use both predefinedWords and transcript words
      const result = getWordsFromTranscript();
      allSuggestions = result.suggestions;
      displayToOriginal = result.displayToOriginal;
    } else {
      // Only use predefinedWords
      allSuggestions = predefinedWords;
      predefinedWords.forEach(phrase => {
        displayToOriginal[phrase] = phrase;
      });
    }
    if (prefix.length >= 3) {
      const fuse = new Fuse(allSuggestions, {
        includeScore: true,
        threshold: 0.4,
        minMatchCharLength: 2,
      });
      let results = fuse.search(prefix);
      let possibleSuggestions = Array.from(new Set(results.map(r => r.item)));
      // Filter out the current prefix from suggestions (case-insensitive)
      possibleSuggestions = possibleSuggestions.filter(s => s.toLowerCase() !== prefix.toLowerCase());
      setSuggestions(possibleSuggestions);
      handleTextChange.displayToOriginal = displayToOriginal;
      if (possibleSuggestions.length > 0) {
        const cursorBounds = quill.getBounds(range.index);
        setSuggestionPosition({ top: cursorBounds.top + 30, left: cursorBounds.left });
      }
    } else {
      setSuggestions([]);
    }
  };

  const insertSuggestionAtContext = (word) => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    quill.focus();
    const { prefix, cursorIndex } = suggestionContextRef.current;
    const displayToOriginal = handleTextChange.displayToOriginal || {};
    const originalWord = displayToOriginal[word] || word;
    let startIndex = cursorIndex - prefix.length;
    let deleteLength = prefix.length;
    // If the suggestion starts with [ and the prefix also starts with [, avoid double bracket
    if (originalWord.startsWith('[') && prefix.startsWith('[')) {
      startIndex += 1;
      deleteLength -= 1;
    }
    if (deleteLength > 0) {
      quill.deleteText(startIndex, deleteLength);
    }
    quill.insertText(startIndex, originalWord + ' ');
    quill.setSelection(startIndex + originalWord.length + 1);
    setSuggestions([]);
    return false;
  };

  // Function to insert a timestamp
  // Insert a timestamp. If `speakerNumber` is provided, use it for the S# label when inserting at paragraph start.
  const insertTimestamp = (timestamp, speakerNumber = null) => {
    if (!quillInstanceRef.current) return;

    // Get the current selection
    const range = quillInstanceRef.current.getSelection();
    if (range) {
        // Check if it's the start of a paragraph
        const isStartOfParagraph = range.index === 0 || quillInstanceRef.current.getText(range.index - 1, 1) === "\n";
        const speakerLabel = speakerNumber ? `S${speakerNumber}` : 'S1';
        const formattedTimestamp = isStartOfParagraph ? `${timestamp} ${speakerLabel}: ` : `[${timestamp}] ____ `;

        // Insert the timestamp at the selection index
        quillInstanceRef.current.insertText(range.index, formattedTimestamp, 'user');

        if (isStartOfParagraph) {
          // Highlight the speaker number (right after "S") for paragraph start timestamps
          const highlightStart = range.index + timestamp.length + 2; // Position of the number after "S"
          quillInstanceRef.current.setSelection(highlightStart, 1); // Select just the digit
        } else {
          // Position cursor after the underscores for blank timestamps
          const cursorPos = range.index + formattedTimestamp.length;
          quillInstanceRef.current.setSelection(cursorPos);
        }
        // Validation removed - user must click button to validate
    }
  };

  // Force insertion of a proper timestamp regardless of cursor location (always use `${timestamp} S#:`)
  const insertTimestampForced = (timestamp, speakerNumber = 1) => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    const range = quill.getSelection() || { index: quill.getLength() };
    const speakerLabel = `S${speakerNumber}`;
    const formattedTimestamp = `${timestamp} ${speakerLabel}: `;
    quill.insertText(range.index, formattedTimestamp, 'user');
    quill.setSelection(range.index + formattedTimestamp.length);
    // Validation removed - user must click button to validate
  };

  // Split paragraph at cursor, insert timestamp, and move text after cursor to a new paragraph.
  // Always uses the configured speaker number (no increment). Highlights the speaker number for editing.
  const splitParagraphWithTimestamp = (timestamp, speakerNumber = 1) => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    const range = quill.getSelection();
    if (!range) return;

    // Get the full content to find paragraph boundaries
    const fullText = quill.getText();
    let cursorIndex = range.index;

    // Find the end of the current paragraph (look forwards for '\n' or end of text)
    let paragraphEnd = fullText.length;
    for (let i = cursorIndex; i < fullText.length; i++) {
      if (fullText[i] === '\n') {
        paragraphEnd = i;
        break;
      }
    }

    // Get the text from cursor to end of paragraph
    const textAfterCursor = fullText.substring(cursorIndex, paragraphEnd);

    // Insert a newline at cursor, then insert the new timestamp + speaker (no increment) + text after
    const newTimestamp = `${timestamp} S${speakerNumber}: `;
    
    // Delete text after cursor up to the end of paragraph
    quill.deleteText(cursorIndex, textAfterCursor.length, 'user');

    // Insert two newlines (creates an empty line) and then the new paragraph
    quill.insertText(cursorIndex, '\n\n', 'user');
    quill.insertText(cursorIndex + 2, newTimestamp + textAfterCursor, 'user');

    // Highlight the speaker number (the digit after 'S') for editing
    // Position of 'S' is at: cursorIndex + 2 (for the two newlines) + timestamp.length + 1 (for space)
    const speakerNumberPos = cursorIndex + 2 + timestamp.length + 2; // +2 for " S"
    quill.setSelection(speakerNumberPos, 1); // Select just the digit
    // Validation removed - user must click button to validate
  };

  // Parse timestamp strings like H:MM:SS(.ms) or M:SS(.ms) into seconds
  const parseTimestampToSeconds = (ts) => {
    if (!ts || typeof ts !== 'string') return NaN;
    const parts = ts.split(':').map(p => p.trim());
    if (parts.length === 3) {
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      const s = parseFloat(parts[2]) || 0;
      return h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const m = parseFloat(parts[0]) || 0;
      const s = parseFloat(parts[1]) || 0;
      return m * 60 + s;
    } else if (parts.length === 1) {
      return parseFloat(parts[0]) || 0;
    }
    return NaN;
  };

  // Find all timestamp occurrences in content. Returns array sorted by index.
  // Only matches timestamps in these formats:
  // 1. Start of line with speaker label: "0:00:00.0 S1:" or "00:00:00.0 S1:"
  // 2. Blank timestamps: "[0:00:00.0] ____"
  const findAllTimestamps = (content) => {
    const matches = [];
    // Combined pattern: match either format in a single pass for better performance
    // (?:^|\n)(\d{1,2}:\d{2}:\d{2}(?:\.\d+)?)\s+S[^:\s]+: OR \[(\d{1,2}:\d{2}:\d{2}(?:\.\d+)?)\]\s+____
    const combinedRegex = /(?:(?:^|\n)(\d{1,2}:\d{2}:\d{2}(?:\.\d+)?)\s+S[^:\s]+:|\[(\d{1,2}:\d{2}:\d{2}(?:\.\d+)?)\]\s+____)/gm;
    let m;
    while ((m = combinedRegex.exec(content)) !== null) {
      if (m[1]) {
        // Speaker timestamp format
        const timestamp = m[1];
        const timestampIndex = m.index + (m[0].startsWith('\n') ? 1 : 0);
        matches.push({ 
          index: timestampIndex, 
          length: timestamp.length, 
          text: timestamp, 
          seconds: parseTimestampToSeconds(timestamp) 
        });
      } else if (m[2]) {
        // Blank timestamp format
        const timestamp = m[2];
        const timestampIndex = m.index + 1; // +1 to skip the opening bracket
        matches.push({ 
          index: timestampIndex, 
          length: timestamp.length, 
          text: timestamp, 
          seconds: parseTimestampToSeconds(timestamp) 
        });
      }
    }
    return matches.sort((a, b) => a.index - b.index);
  };

  const clearTimestampHighlights = () => {
    if (!quillInstanceRef.current) return;
    try {
      (timestampHighlightsRef.current || []).forEach(({ index, length }) => {
        quillInstanceRef.current.formatText(index, length, { background: false });
      });
    } catch (e) {
      // ignore
    }
    timestampHighlightsRef.current = [];
    timestampInvalidsRef.current = [];
    setInvalidTimestampCount(0);
    setCurrentInvalidIndex(0);
  };

  // Validate all timestamps and highlight any that break ascending order
  const validateAllTimestamps = () => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    const content = quill.getText();

    // Clear previous timestamp-only highlights
    clearTimestampHighlights();

    const timestamps = findAllTimestamps(content);
    if (timestamps.length === 0) return;

    // Process ALL timestamps in the entire document, not just visible ones
    const invalids = [];
    for (let i = 0; i < timestamps.length; i++) {
      const cur = timestamps[i];
      const prev = timestamps[i - 1];
      const next = timestamps[i + 1];
      const curSec = cur.seconds;
      let isInvalid = false;
      if (prev && !(curSec > prev.seconds)) {
        // not later than previous
        isInvalid = true;
      }
      if (next && !(curSec < next.seconds)) {
        // not before next
        isInvalid = true;
      }
      if (isInvalid) invalids.push(cur);
    }

    // Apply highlight to all invalid timestamps
    invalids.forEach(({ index, length }) => {
      try {
        quill.formatText(index, length, { background: '#FFD54D' });
        timestampHighlightsRef.current.push({ index, length });
      } catch (e) {}
    });

    // Save invalid timestamp objects for listing/navigation
    timestampInvalidsRef.current = invalids;

    // Update UI state for navigation
    setInvalidTimestampCount(invalids.length);
    setCurrentInvalidIndex(invalids.length > 0 ? 0 : 0);
  };

  // Debounce validation to avoid excessive passes on large documents
  // eslint-disable-next-line no-unused-vars
  const scheduleValidateAllTimestamps = (delay = 200) => {
    if (validateTimerRef.current) {
      clearTimeout(validateTimerRef.current);
    }
    validateTimerRef.current = setTimeout(() => {
      validateTimerRef.current = null;
      validateAllTimestamps();
    }, delay);
  };

  // Validate only timestamps in the viewport (for continuous validation when toggle is on)
  const validateViewportTimestamps = useCallback(() => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    const content = quill.getText();

    // Clear previous timestamp-only highlights
    clearTimestampHighlights();

    const timestamps = findAllTimestamps(content);
    if (timestamps.length === 0) return;

    // Get viewport range using character indices (much faster than getBounds)
    let viewportStartIndex = 0;
    let viewportEndIndex = content.length;
    
    try {
      const editorContainer = editorRef.current?.querySelector('.ql-editor');
      if (editorContainer) {
        const selection = quill.getSelection();
        if (selection) {
          // Estimate viewport based on current cursor and scroll position
          const scrollTop = editorContainer.scrollTop;
          const scrollHeight = editorContainer.scrollHeight;
          const clientHeight = editorContainer.clientHeight;
          
          // Rough estimate: if scrolled 50% down, show timestamps in middle 50% of document
          const scrollRatio = scrollTop / Math.max(1, scrollHeight - clientHeight);
          const bufferRatio = 0.3; // Show 30% before and after for smooth scrolling
          
          viewportStartIndex = Math.floor(content.length * Math.max(0, scrollRatio - bufferRatio));
          viewportEndIndex = Math.ceil(content.length * Math.min(1, scrollRatio + bufferRatio + (clientHeight / scrollHeight)));
        }
      }
    } catch (e) {
      // fallback to all timestamps
    }

    // Filter timestamps to viewport using character index (no getBounds needed!)
    const visibleTimestamps = timestamps.filter(t => 
      t.index >= viewportStartIndex && t.index <= viewportEndIndex
    );

    // Validate each visible timestamp against ALL timestamps (not just visible ones)
    const invalids = [];
    for (let i = 0; i < visibleTimestamps.length; i++) {
      const cur = visibleTimestamps[i];
      const curFullIndex = timestamps.indexOf(cur);
      const prev = timestamps[curFullIndex - 1];
      const next = timestamps[curFullIndex + 1];
      const curSec = cur.seconds;
      let isInvalid = false;
      if (prev && !(curSec > prev.seconds)) {
        isInvalid = true;
      }
      if (next && !(curSec < next.seconds)) {
        isInvalid = true;
      }
      if (isInvalid) invalids.push(cur);
    }

    // Apply highlight to viewport invalid timestamps only
    invalids.forEach(({ index, length }) => {
      try {
        quill.formatText(index, length, { background: '#FFD54D' });
        timestampHighlightsRef.current.push({ index, length });
      } catch (e) {}
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleValidateViewportTimestamps = useCallback((delay = 200) => {
    if (validateTimerRef.current) {
      clearTimeout(validateTimerRef.current);
    }
    validateTimerRef.current = setTimeout(() => {
      validateTimerRef.current = null;
      validateViewportTimestamps();
    }, delay);
  }, [validateViewportTimestamps]);

  // Compute available height for invalid timestamps panel based on editor area
  const computeInvalidPanelHeight = () => {
    try {
      const editorContainer = editorRef.current?.querySelector('.ql-editor');
      if (editorContainer) {
        // Reserve some space for headers/toolbars in the right column
        const available = editorContainer.clientHeight - 80; // leave room for header
        setInvalidPanelMaxHeight(Math.max(120, available));
        return;
      }
    } catch (e) {
      // ignore
    }
    setInvalidPanelMaxHeight(Math.max(120, window.innerHeight - 220));
  };

  useEffect(() => {
    computeInvalidPanelHeight();
    const onResize = () => computeInvalidPanelHeight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Recompute when the invalid list panel is opened
  useEffect(() => {
    if (showInvalidList) computeInvalidPanelHeight();
  }, [showInvalidList]);

  // Return true if the current selection is at the start of a paragraph/line
  const isCursorAtStartOfParagraph = () => {
    if (!quillInstanceRef.current) return false;
    const quill = quillInstanceRef.current;
    const range = quill.getSelection();
    if (!range) return false;
    const idx = range.index;
    if (idx === 0) return true;
    // If previous character is a newline, we're at the start of a paragraph
    const prev = quill.getText(idx - 1, 1);
    return prev === '\n';
  };

  const findAndHighlight = (text, caseSensitive = false, wholeWord = false) => {
    if (!quillInstanceRef.current) return;
    const content = quillInstanceRef.current.getText();
    const flags = caseSensitive ? '' : 'i';
    let pattern = text;
    
    if (wholeWord) {
      // Escape special regex characters
      const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Check if text starts/ends with word characters
      const startsWithWord = /^\w/.test(text);
      const endsWithWord = /\w$/.test(text);
      // Only add word boundaries where the search text has word characters at edges
      const prefix = startsWithWord ? '(?<=^|\\W)' : '';
      const suffix = endsWithWord ? '(?=\\W|$)' : '';
      pattern = `${prefix}${escapedText}${suffix}`;
    } else {
      pattern = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    const regex = new RegExp(pattern, flags);
    const match = content.match(regex);
    if (match) {
      const index = match.index;
      quillInstanceRef.current.setSelection(index, match[0].length);
      quillInstanceRef.current.formatText(index, match[0].length, { background: 'yellow' });
    } else {
      alert('Text not found.');
    }
  };

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const replaceText = (findText, replaceText, caseSensitive = false, wholeWord = false) => {
    if (!quillInstanceRef.current) return;
    const escapedFindText = escapeRegExp(findText);
    const flags = caseSensitive ? '' : 'i';
    let pattern = escapedFindText;
    
    if (wholeWord) {
      // Check if text starts/ends with word characters
      const startsWithWord = /^\w/.test(findText);
      const endsWithWord = /\w$/.test(findText);
      // Only add word boundaries where the search text has word characters at edges
      const prefix = startsWithWord ? '(?<=^|\\W)' : '';
      const suffix = endsWithWord ? '(?=\\W|$)' : '';
      pattern = `${prefix}${escapedFindText}${suffix}`;
    }
    
    const regex = new RegExp(pattern, flags);
    const content = quillInstanceRef.current.getText();
    const match = content.match(regex);
    if (match) {
      const index = match.index;
      quillInstanceRef.current.deleteText(index, match[0].length);
      quillInstanceRef.current.insertText(index, replaceText);
    } else {
      alert('Text not found.');
    }
  };

  const getText = () => {
    if (!quillInstanceRef.current) return;
    return quillInstanceRef.current.getText();
  };

  const replaceAll = (findText, replaceText, caseSensitive = false, wholeWord = false) => {
    if (!quillInstanceRef.current) return;
    const escapedFindText = escapeRegExp(findText);
    const flags = 'g' + (caseSensitive ? '' : 'i');
    let pattern = escapedFindText;
    
    if (wholeWord) {
      // Check if text starts/ends with word characters
      const startsWithWord = /^\w/.test(findText);
      const endsWithWord = /\w$/.test(findText);
      // Only add word boundaries where the search text has word characters at edges
      const prefix = startsWithWord ? '(?<=^|\\W)' : '';
      const suffix = endsWithWord ? '(?=\\W|$)' : '';
      pattern = `${prefix}${escapedFindText}${suffix}`;
    }
    
    const regex = new RegExp(pattern, flags);
    const content = quillInstanceRef.current.getText();
    const newContent = content.replace(regex, replaceText);
    quillInstanceRef.current.setText(newContent);
  };

  const replaceSpeakerLabel = (fromLabel, toLabel) => {
    if (!quillInstanceRef.current || !highlightedText.includes(fromLabel)) return;
  
    const updatedText = highlightedText.replace(new RegExp(`\\b${fromLabel}\\b`, 'g'), toLabel);
  
    // Replace only within the selected range
    quillInstanceRef.current.deleteText(selectionRange.index, selectionRange.length);
    quillInstanceRef.current.insertText(selectionRange.index, updatedText);

    // Apply the blue highlight after swapping
    //quillInstanceRef.current.formatText(selectionRange.index, updatedText.length, { background: '#3399FF' });
  
    setHighlightedText(updatedText); // Update state
    
  };
  
  const swapSpeakerLabels = (label1, label2) => {
    if (!quillInstanceRef.current || (!highlightedText.includes(label1) && !highlightedText.includes(label2))) return;
  
    const updatedText = highlightedText.replace(new RegExp(`\\b(${label1}|${label2})\\b`, 'g'), (match) =>
      match === label1 ? label2 : label1
    );
  
    // Replace only within the selected range
    quillInstanceRef.current.deleteText(selectionRange.index, selectionRange.length);
    quillInstanceRef.current.insertText(selectionRange.index, updatedText);

    //Re-apply highlight after swapping labels
    //quillInstanceRef.current.formatText(selectionRange.index, updatedText.length, { background: '#3399FF' });
  
    setHighlightedText(updatedText); // Update state
  };

  // Create timestamp index for faster lookup
  const createTimestampIndex = (content) => {
    const timestamps = [];
    const lines = content.split('\n');
    
    let charIndex = 0;
    lines.forEach((line, index) => {
      const match = line.match(/^(\d+):(\d+):(\d+\.?\d*)\s+S\d+:/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        const time = hours * 3600 + minutes * 60 + seconds;
        
        timestamps.push({ 
          time, 
          lineIndex: index, 
          charIndex: charIndex,
          text: line 
        });
      }
      charIndex += line.length + 1; // +1 for newline
    });
    
    return timestamps.sort((a, b) => a.time - b.time);
  };

  // Binary search for faster timestamp lookup
  const findClosestTimestamp = (targetTime, timestamps) => {
    if (timestamps.length === 0) return null;
    
    let left = 0;
    let right = timestamps.length - 1;
    let closest = timestamps[0];
    let closestDiff = Math.abs(timestamps[0].time - targetTime);
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const current = timestamps[mid];
      const diff = Math.abs(current.time - targetTime);
      
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = current;
      }
      
      if (current.time < targetTime) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return closest;
  };

  const navigateToTime = (targetTime) => {
    if (!quillInstanceRef.current || timestampIndex.length === 0) {
      return;
    }
    
    const closest = findClosestTimestamp(targetTime, timestampIndex);
    if (closest) {
      // Set selection to that position
      quillInstanceRef.current.setSelection(closest.charIndex, 0);
      
      // Small delay to ensure selection is applied before calculating bounds
      setTimeout(() => {
        // Get the editor container
        const editorContainer = editorRef.current.querySelector('.ql-editor');

        if (editorContainer) {
          // Get the bounds of the target position
          const bounds = quillInstanceRef.current.getBounds(closest.charIndex);
          
          // Calculate the scroll position
          const containerHeight = editorContainer.clientHeight;
          const scrollTop = bounds.top - 50; // Position near the top with 50px offset
          
          // Ensure scroll position is within bounds
          const maxScroll = editorContainer.scrollHeight - containerHeight;
          const finalScrollTop = Math.max(0, Math.min(scrollTop, maxScroll));
          
          // Apply the scroll
          editorContainer.scrollTop = finalScrollTop;
          // Alternative: Find the actual text element and scroll it into view
          try {
            // Get the text content around the timestamp
            const textAround = quillInstanceRef.current.getText(Math.max(0, closest.charIndex - 10), 50);
            console.log('textAround', textAround);
            
            // Find the timestamp in the text
            const timestampMatch = textAround.match(/(\d+:\d+:\d+\.?\d*)\s+S\d+:/);
            if (timestampMatch) {
              // Find the DOM element containing this text
              const textNodes = editorContainer.querySelectorAll('*');
              for (let node of textNodes) {
                if (node.textContent && node.textContent.includes(timestampMatch[0])) {
                  console.log('Found element with timestamp:', node);
                  node.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                  });
                  break;
                }
              }
            }
          } catch (error) {
            console.log('scrollIntoView failed, using manual scroll', error);
          }
        }
      }, 50); // 50ms delay
    }
  };

  // Make timestamps clickable
  const makeTimestampsClickable = (callback) => {
    setOnTimestampClick(() => callback);
    
    if (quillInstanceRef.current) {
      // Add a right-click handler to the entire editor
      const editorContainer = editorRef.current.querySelector('.ql-editor');
      if (editorContainer) {
        // Remove existing handlers
        editorContainer.removeEventListener('contextmenu', handleEditorRightClick);
        
        // Add new right-click handler
        editorContainer.addEventListener('contextmenu', handleEditorRightClick);
      }
    }
  };

  // Handle right-clicks on timestamps within the editor
  const handleEditorRightClick = (e) => {
    if (!onTimestampClick || !quillInstanceRef.current) return;
    // Get the clicked position
    const range = quillInstanceRef.current.getSelection();
    if (!range) return;
    // Get text around the clicked position
    const textBefore = quillInstanceRef.current.getText(Math.max(0, range.index - 30), 30);
    const textAfter = quillInstanceRef.current.getText(range.index, 30);
    const surroundingText = textBefore + textAfter;
    const timestampMatch = surroundingText.match(/(\d+):(\d+):(\d+\.?\d*)\s+S\d+:/);
    // Check for highlighted text
    let selectedText = '';
    let showGoogle = false;
    let showSwapSpeaker = false;
    if (range.length > 0) {
      selectedText = quillInstanceRef.current.getText(range.index, range.length).trim();
      showGoogle = selectedText.length > 0;
      // Check for speaker labels in selected text
      const speakerLabels = selectedText.match(/S\d+/g);
      showSwapSpeaker = speakerLabels && speakerLabels.length > 0;
    }
    // Only show menu if timestamp or selection
    // Always show speaker snippets option in context menu if there are any speakers
    const showSpeakerSnips = detectedSpeakerCount > 0;
    if (timestampMatch || showGoogle || showSwapSpeaker || showSpeakerSnips) {
      e.preventDefault();
      lastMenuOpenTimeRef.current = Date.now();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        timestamp: timestampMatch ? (parseInt(timestampMatch[1]) * 3600 + parseInt(timestampMatch[2]) * 60 + parseFloat(timestampMatch[3])) : null,
        clickIndex: range.index,
        selectedText,
        showGoogle,
        showPlay: !!timestampMatch,
        showSwapSpeaker,
        showSpeakerSnippets: showSpeakerSnips,
      });
    }
  };

  // Handle context menu item click
  const handleContextMenuClick = (action) => {
    if (action === 'play' && contextMenu.timestamp && onTimestampClick) {
      highlightClickedTimestamp(contextMenu.clickIndex);
      onTimestampClick(contextMenu.timestamp);
    } else if (action === 'google' && contextMenu.selectedText) {
      const query = encodeURIComponent(contextMenu.selectedText);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    } else if (action === 'swapSpeaker' && contextMenu.selectedText && onRequestSwapModal) {
      onRequestSwapModal(contextMenu.selectedText);
    } else if (action === 'speakerSnippets') {
      const { snippets, order } = buildSpeakerSnippets();
      setSpeakerSnippets(snippets);
      setSpeakerOrder(order);
      setShowSpeakerSnippets(true);
    } else if (action === 'joinParagraphs') {
      joinParagraphs();
    } else if (action === 'removeActiveListeningCues') {
      removeActiveListeningCues();
    }
    setSuggestions([]);
    setContextMenu({ visible: false, x: 0, y: 0, timestamp: null, clickIndex: 0, selectedText: '', showGoogle: false, showPlay: false, showSwapSpeaker: false });
  };

  // Handle clicks outside to close suggestions and context menu
  // eslint-disable-next-line no-unused-vars
  const handleClickOutside = (event) => {
    // Ignore the first event after opening the menu
    if (Date.now() - lastMenuOpenTimeRef.current < 150) return;
    const menuContains = contextMenuRef.current && contextMenuRef.current.contains(event.target);
    if (!menuContains) {
      setSuggestions([]);
      setContextMenu({ visible: false, x: 0, y: 0, timestamp: null, clickIndex: 0, selectedText: '', showGoogle: false, showPlay: false, showSwapSpeaker: false });
    }
  };

  // Add visual feedback when timestamp is clicked
  const highlightClickedTimestamp = (clickIndex) => {
    if (!quillInstanceRef.current) return;
    
    // Find the timestamp around the click
    const textBefore = quillInstanceRef.current.getText(Math.max(0, clickIndex - 30), 30);
    const textAfter = quillInstanceRef.current.getText(clickIndex, 30);
    const surroundingText = textBefore + textAfter;
    
    const timestampMatch = surroundingText.match(/(\d+):(\d+):(\d+\.?\d*)\s+S\d+:/);
    if (timestampMatch) {
      const timestampText = timestampMatch[0];
      const timestampStart = surroundingText.indexOf(timestampText);
      const actualStart = Math.max(0, clickIndex - 30) + timestampStart;
      
      // Highlight the timestamp briefly
      quillInstanceRef.current.formatText(actualStart, timestampText.length, { 
        background: '#3b82f6',
        color: 'white'
      });
      
      // Remove highlight after 500ms
      setTimeout(() => {
        quillInstanceRef.current.formatText(actualStart, timestampText.length, { 
          background: false,
          color: false
        });
      }, 500);
    }
  };

  // Update timestamp index when content changes
  useEffect(() => {
    if (quillInstanceRef.current) {
      const content = quillInstanceRef.current.getText();
      const index = createTimestampIndex(content);
      setTimestampIndex(index);
      // Update speaker count snapshot
      const speakerMatches = content.match(/\bS\d+:/g) || [];
      const speakerSet = new Set(speakerMatches.map(s => s.replace(/:$/, '')));
      const count = speakerSet.size;
      console.log('Speaker detection:', { 
        matches: speakerMatches, 
        unique: Array.from(speakerSet), 
        count,
        contentLength: content.length 
      });
      setDetectedSpeakerCount(count);
    }
  }, [transcript]); // Only depend on transcript changes

  // If highlights are enabled, re-run highlight pass when transcript changes
  useEffect(() => {
    if (showHighlightRepeated) {
      // Re-apply highlights based on the latest transcript
      highlightRepeatedSpeakers(true);
    }
  }, [transcript, showHighlightRepeated]);

  // Continuous viewport validation when toggle is enabled
  useEffect(() => {
    if (validateTimestampsEnabled) {
      scheduleValidateViewportTimestamps(200);
    } else {
      clearTimestampHighlights();
    }
  }, [transcript, validateTimestampsEnabled]);

  // Add scroll listener for viewport validation
  useEffect(() => {
    if (!validateTimestampsEnabled) return;
    
    const editorContainer = editorRef.current?.querySelector('.ql-editor');
    if (!editorContainer) return;

    const handleScroll = () => {
      scheduleValidateViewportTimestamps(150);
    };

    editorContainer.addEventListener('scroll', handleScroll);
    return () => {
      editorContainer.removeEventListener('scroll', handleScroll);
    };
  }, [validateTimestampsEnabled, scheduleValidateViewportTimestamps]);

  // Apply click handlers when onTimestampClick changes
  useEffect(() => {
    if (onTimestampClick && quillInstanceRef.current) {
      makeTimestampsClickable(onTimestampClick);
    }
  }, [onTimestampClick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset selected suggestion index when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [suggestions]);

  // Update suggestionContextRef when selectedSuggestionIndex changes
  useEffect(() => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    const range = quill.getSelection();
    if (!range) return;
    const textBeforeCursor = quill.getText(0, range.index);
    const match = textBeforeCursor.match(/\b\w*$/);
    const prefix = match ? match[0] : '';
    suggestionContextRef.current = { prefix, cursorIndex: range.index };
  }, [selectedSuggestionIndex]);

  // Function to toggle highlight repeated consecutive speakers
  const highlightRepeatedSpeakers = (shouldHighlight = true) => {
    if (!quillInstanceRef.current) return;
    
    // Get all text from the editor
    const content = quillInstanceRef.current.getText();
    
    // If we're removing highlight, clear only the previous repeated-speaker highlights
    if (!shouldHighlight) {
      try {
        (repeatedPositionsRef.current || []).forEach(({ index, length }) => {
          quillInstanceRef.current.formatText(index, length, { background: false });
        });
      } catch (e) {
        // ignore
      }
      repeatedPositionsRef.current = [];
      setCurrentRepeatedIndex(0);
      console.log('[Textarea] Cleared repeated speaker highlights');
      // Validation removed - user must click button to validate
      return;
    }
    
    // Pattern to match speaker labels: S#: where # is a number or ? (e.g., S1: or S?:)
    const speakerPattern = /\bS(\d+|\?)\s*:/g;
    
    let match;
    let previousSpeaker = null;
    const positions = []; // Array to store positions of repeated speakers
    
    // First pass: find all speaker labels and identify repeats
    while ((match = speakerPattern.exec(content)) !== null) {
      const currentSpeaker = match[1]; // Get the speaker ID (e.g., "1" from "S1:" or "?" from "S?:")
      if (previousSpeaker === currentSpeaker) {
        // Found a repeat - highlight this occurrence
        positions.push({
          index: match.index,
          length: match[0].length,
          speaker: currentSpeaker
        });
      }
      previousSpeaker = currentSpeaker;
    }
    
    // If no repeats found, just return without alert
    if (positions.length === 0) {
      console.log('[Textarea] No repeated consecutive speakers found');
      return;
    }
    
    // Clear any previous repeated-speaker highlights (preserve other highlights)
    try {
      (repeatedPositionsRef.current || []).forEach(({ index, length }) => {
        quillInstanceRef.current.formatText(index, length, { background: false });
      });
    } catch (e) {
      // ignore
    }
    
    // Apply red highlight to repeated speakers
    positions.forEach(({ index, length }) => {
      quillInstanceRef.current.formatText(index, length, { background: '#FF6B6B' }); // Red highlight
    });

    // Save positions for navigation
    repeatedPositionsRef.current = positions;
    setCurrentRepeatedIndex(0);

    console.log(`[Textarea] Highlighted ${positions.length} repeated speaker(s)`);
  };

  // Navigate to a repeated speaker occurrence by ordinal index
  const goToRepeatedAt = (ordinal) => {
    const positions = repeatedPositionsRef.current || [];
    if (!quillInstanceRef.current || positions.length === 0) return;
    const idx = Math.max(0, Math.min(positions.length - 1, ordinal));
    const { index, length } = positions[idx];
    const quill = quillInstanceRef.current;

    // Set selection at the speaker label
    try {
      quill.setSelection(index, length);
    } catch (e) {
      // ignore selection errors
    }

    // Scroll editor so the selected range is visible (center it)
    const editorEl = editorRef.current; // container where Quill was mounted
    const qEditor = editorEl?.querySelector('.ql-editor');
    if (qEditor) {
      const bounds = quill.getBounds(index, length);
      const top = bounds.top + qEditor.scrollTop;
      const center = Math.max(0, top - (qEditor.clientHeight / 2));

      // Smooth scroll with a safe fallback for environments without behavior support
      try {
        if (typeof qEditor.scrollTo === 'function') {
          qEditor.scrollTo({ top: center, behavior: 'smooth' });
        } else if (typeof qEditor.scroll === 'function') {
          qEditor.scroll({ top: center, behavior: 'smooth' });
        } else {
          // Fallback: animate via requestAnimationFrame
          const start = qEditor.scrollTop;
          const change = center - start;
          const duration = 350;
          let startTime = null;
          const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / duration);
            qEditor.scrollTop = start + change * easeInOut(progress);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      } catch (e) {
        // In case of any errors, fallback to instant scroll
        qEditor.scrollTop = center;
      }
    }

    setCurrentRepeatedIndex(idx);
  };

  const goToNextRepeated = () => {
    const positions = repeatedPositionsRef.current || [];
    if (positions.length === 0) return;
    const next = (currentRepeatedIndex + 1) % positions.length;
    goToRepeatedAt(next);
  };

  const goToPrevRepeated = () => {
    const positions = repeatedPositionsRef.current || [];
    if (positions.length === 0) return;
    const prev = (currentRepeatedIndex - 1 + positions.length) % positions.length;
    goToRepeatedAt(prev);
  };

  // Navigate to invalid timestamp occurrence by ordinal
  const goToInvalidAt = (ordinal) => {
    const positions = timestampHighlightsRef.current || [];
    if (!quillInstanceRef.current || positions.length === 0) return;
    const idx = Math.max(0, Math.min(positions.length - 1, ordinal));
    const { index, length } = positions[idx];
    const quill = quillInstanceRef.current;

    try {
      quill.setSelection(index, length);
    } catch (e) {}

    // Scroll into view using same smooth fallback
    const editorEl = editorRef.current;
    const qEditor = editorEl?.querySelector('.ql-editor');
    if (qEditor) {
      const bounds = quill.getBounds(index, length);
      const top = bounds.top + qEditor.scrollTop;
      const center = Math.max(0, top - (qEditor.clientHeight / 2));
      try {
        if (typeof qEditor.scrollTo === 'function') {
          qEditor.scrollTo({ top: center, behavior: 'smooth' });
        } else if (typeof qEditor.scroll === 'function') {
          qEditor.scroll({ top: center, behavior: 'smooth' });
        } else {
          const start = qEditor.scrollTop;
          const change = center - start;
          const duration = 350;
          let startTime = null;
          const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / duration);
            qEditor.scrollTop = start + change * easeInOut(progress);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      } catch (e) {
        qEditor.scrollTop = center;
      }
    }

    setCurrentInvalidIndex(idx);
  };

  const goToNextInvalid = () => {
    const positions = timestampHighlightsRef.current || [];
    if (positions.length === 0) return;
    const next = (currentInvalidIndex + 1) % positions.length;
    goToInvalidAt(next);
  };

  const goToPrevInvalid = () => {
    const positions = timestampHighlightsRef.current || [];
    if (positions.length === 0) return;
    const prev = (currentInvalidIndex - 1 + positions.length) % positions.length;
    goToInvalidAt(prev);
  };

  // Expose the `insertTimestamp` method to the parent component
  useImperativeHandle(ref, () => ({
    insertTimestamp,
    insertTimestampForced,
    splitParagraphWithTimestamp,
    isCursorAtStartOfParagraph,
    findAndHighlight,
    replaceText,
    replaceAll,
    getText,
    replaceSpeakerLabel,
    swapSpeakerLabels,
    navigateToTime,
    makeTimestampsClickable,
    highlightRepeatedSpeakers,
    setText: (text) => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current.setText(text);
      }
    },
    formatTitleCase, // Expose the function
    fixTranscript,
    joinParagraphs,
    joinSameSpeakerParagraphs,
    removeActiveListeningCues,
    removeFillerWords,
    adjustTimestamps,
    // Expose trigger functions and state
    toggleSpeakerSnippets: () => {
      const { snippets, order } = buildSpeakerSnippets();
      setSpeakerSnippets(snippets);
      setSpeakerOrder(order);
      setShowSpeakerSnippets(v => !v);
    },
    toggleNotes: () => setShowNotes(v => !v),
    showSpeakerSnippets,
    showNotes,
    detectedSpeakerCount,
  }));

  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem('transcript_notes', notes);
    } catch (e) {
      // ignore storage errors
    }
  }, [notes]);

  // Persist notes width when it changes
  useEffect(() => {
    try {
      localStorage.setItem('transcript_notes_width', String(notesWidth));
    } catch (e) {
      // ignore
    }
  }, [notesWidth]);

  // Persist snippets width when it changes
  // Persist speaker names when they change
  useEffect(() => {
    try {
      localStorage.setItem('speaker_names', JSON.stringify(speakerNames));
    } catch (e) {
      // ignore
    }
  }, [speakerNames]);
  useEffect(() => {
    try {
      localStorage.setItem('transcript_snippets_width', String(snippetsWidth));
    } catch (e) {
      // ignore
    }
  }, [snippetsWidth]);

  // Handle drag to resize notes panel
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      const delta = startXRef.current - e.clientX;
      const next = Math.max(220, Math.min(700, startWidthRef.current + delta));
      setNotesWidth(next);
    };
    const handleMouseUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Handle drag to resize snippets panel
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingSnippetsRef.current) return;
      const delta = startXSnippetsRef.current - e.clientX;
      const next = Math.max(220, Math.min(700, startWidthSnippetsRef.current + delta));
      setSnippetsWidth(next);
    };
    const handleMouseUp = () => {
      if (!isResizingSnippetsRef.current) return;
      isResizingSnippetsRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Handle drag to resize invalid timestamps panel
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingInvalidRef.current) return;
      const delta = startXInvalidRef.current - e.clientX;
      const next = Math.max(160, Math.min(900, startWidthInvalidRef.current + delta));
      setInvalidPanelWidth(next);
    };
    const handleMouseUp = () => {
      if (!isResizingInvalidRef.current) return;
      isResizingInvalidRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Persist invalid panel width
  useEffect(() => {
    try {
      localStorage.setItem('invalid_panel_width', String(invalidPanelWidth));
    } catch (e) {}
  }, [invalidPanelWidth]);

  useEffect(() => {
    if (!editorRef.current) return; // Exit if editorRef is not ready

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: 'bubble',
      modules: {
        toolbar: false, // Disable the toolbar
        history: { delay: 1000, maxStack: 200, userOnly: true },
      },
      keyboard: {},
      placeholder: 'Start typing your transcription here...',
    });

    // Remove the Quill keyboard binding for Enter (key: 13)
    // quill.keyboard.addBinding(
    //   { key: 13 }, // Enter key
    //   function () {
    //     console.log('key binding done');
    //     if (suggestionsRef.current?.length > 0) {
    //       insertSuggestionAtContext(suggestionsRef.current[0]);
    //       return false; // Prevents default Enter behavior
    //     }
    //     return true; // Allows Enter if no suggestions
    //   }
    // );

    // Assign the Quill instance to the ref
    quillInstanceRef.current = quill;
    // Ensure undo/redo keyboard shortcuts work even if keyboard config is minimal
    try {
      // Ctrl/Cmd+Z => undo
      quill.keyboard.addBinding({ key: 'z', shortKey: true }, function(range, context) {
        try { 
          quill.history.undo();
          // Restore cursor position after undo
          setTimeout(() => {
            const selection = quill.getSelection();
            if (selection) {
              quill.setSelection(selection.index, selection.length);
            }
          }, 0);
        } catch (e) {}
        return false;
      });
      // Ctrl/Cmd+Shift+Z or Ctrl+Y => redo
      quill.keyboard.addBinding({ key: 'z', shortKey: true, shiftKey: true }, function() {
        try { 
          quill.history.redo();
          // Restore cursor position after redo
          setTimeout(() => {
            const selection = quill.getSelection();
            if (selection) {
              quill.setSelection(selection.index, selection.length);
            }
          }, 0);
        } catch (e) {}
        return false;
      });
      quill.keyboard.addBinding({ key: 'y', shortKey: true }, function() {
        try { 
          quill.history.redo();
          // Restore cursor position after redo
          setTimeout(() => {
            const selection = quill.getSelection();
            if (selection) {
              quill.setSelection(selection.index, selection.length);
            }
          }, 0);
        } catch (e) {}
        return false;
      });
    } catch (e) {
      // ignore if keyboard module isn't available
    }
    quill.focus(); // Ensure the editor is focused for typing
    let lastHighlightedRange = null; // Store last highlighted range

    // Remove highlight when clicking inside the editor
    const handleEditorClick = () => {
      console.log('Clicked inside the editor');
      if (lastHighlightedRange) {
        lastHighlightedRange = null; // Reset the stored range
      }
      // If user clicks while in multi-edit mode (check ref), exit multi-edit mode
      if (virtualCursorsRef.current && virtualCursorsRef.current.length > 0) {
        virtualCursorsRef.current = [];
        setReplaceMode(null);
        try { clearCursorOverlay(); } catch (e) {}
        try { clearHighlightedRanges(); } catch (e) {}
        console.log('[Textarea] Exited multi-edit mode due to click');
      }
    };

    const handleKeyDown = (event) => {
      // Mark suggestion trigger on printable key presses so clicks don't open suggestions
      try {
        if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key && event.key.length === 1) {
          suggestionTriggerRef.current = true;
        }
      } catch (e) {}
      if (suggestionsRef.current?.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedSuggestionIndex((prev) => (prev + 1) % suggestionsRef.current.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedSuggestionIndex((prev) => (prev - 1 + suggestionsRef.current.length) % suggestionsRef.current.length);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          const suggestion = suggestionsRef.current[selectedSuggestionIndex] || suggestionsRef.current[0];
          insertSuggestionAtContext(suggestion);
        }
      }
      // If we're in multi-edit mode, handle typing/paste/backspace/delete here
      else if (virtualCursorsRef.current && virtualCursorsRef.current.length > 0) {
        // ESC to exit
        if (event.key === 'Escape') {
          event.preventDefault();
          // Clear multi-edit state and visual cues
          virtualCursorsRef.current = [];
          setReplaceMode(null);
          try { clearCursorOverlay(); } catch (e) {}
          try { clearHighlightedRanges(); } catch (e) {}
          console.log('[Textarea] Multi-edit mode exited via Escape');
          return;
        }

        // Handle printable characters
        if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
          event.preventDefault();
          const insertText = event.key;
          performMultiEdit({ op: 'insert', text: insertText });
          return;
        }

        // Handle Backspace/Delete
        if (event.key === 'Backspace') {
          event.preventDefault();
          performMultiEdit({ op: 'backspace' });
          return;
        }
        if (event.key === 'Delete') {
          event.preventDefault();
          performMultiEdit({ op: 'delete' });
          return;
        }
      }
      else if (event.ctrlKey && event.key === 'k') {
        // Ctrl+K: Start multi-edit mode with highlighted text
        event.preventDefault();
        const sel = quill.getSelection();
        if (sel && sel.length > 0) {
          const selectedText = quill.getText(sel.index, sel.length);
          const content = quill.getText();
          const escapedText = selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedText}\\b`, 'g');
          const matches = [...content.matchAll(regex)];
          if (matches.length === 0) {
            alert('No matches found for the selected term.');
            return;
          }

          // Build virtual cursors from matches (scan once)
          // Each cursor tracks its insertion offset and whether it has been replaced yet
          const cursors = matches.map(m => ({ start: m.index, length: m[0].length, offset: 0, replaced: false }));
          virtualCursorsRef.current = cursors;
          setReplaceMode({ selectedText });
          replaceInputRef.current = '';
          console.log(`[Textarea] Multi-edit mode started for "${selectedText}", ${cursors.length} cursors created`);

          // Optionally select first occurrence to show user position
          const first = cursors[0];
          quill.setSelection(first.start, first.length);
          // Render visual cues (carets + highlights)
          try { highlightCursorsRanges(); } catch (e) {}
          try { renderCursorOverlay(); } catch (e) {}
        }
      }
      else if (event.altKey && event.key === 's') {
        event.preventDefault(); // Prevent default behavior
        formatSpelling();
      }

      else if (event.ctrlKey && event.key === 'u') {
        event.preventDefault(); // Prevent default Ctrl + U behavior (which is usually underline)
        formatUppercase(); // Function to capitalize all letters
      }
      else if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        // Only title-case when there is a non-empty selection
        const sel = quill.getSelection();
        if (sel && sel.length > 0) {
          formatSelectionTitleCase();
        }
      }
    };

    // Paste handler for multi-edit mode
    // eslint-disable-next-line no-unused-vars
    const handlePaste = (evt) => {
      if (!virtualCursorsRef.current || virtualCursorsRef.current.length === 0) return;
      evt.preventDefault();
      const pasted = (evt.clipboardData || window.clipboardData).getData('text');
      if (pasted && pasted.length > 0) {
        performMultiEdit({ op: 'insert', text: pasted });
      }
    };

    // Perform multi-edit replacement across virtual cursors
    const performMultiEdit = (cmd) => {
      const quill = quillInstanceRef.current;
      const cursors = virtualCursorsRef.current || [];
      if (!quill || !cursors.length) return;

      // Normalize command
      let op = 'insert';
      let text = '';
      if (typeof cmd === 'string') {
        op = 'insert';
        text = cmd;
      } else if (cmd && typeof cmd === 'object') {
        op = cmd.op || 'insert';
        text = cmd.text || '';
      }

      // Apply edits from last to first to avoid index shift issues
      for (let i = cursors.length - 1; i >= 0; i--) {
        const c = cursors[i];

        if (op === 'insert') {
          if (!c.replaced && c.length > 0) {
            // First insertion: replace the original matched text
            quill.deleteText(c.start, c.length);
            if (text.length > 0) quill.insertText(c.start, text);
            c.offset = text.length;
            c.length = text.length;
            c.replaced = true;
          } else {
            // Subsequent insertions: insert at current offset
            const insertPos = c.start + c.offset;
            if (text.length > 0) quill.insertText(insertPos, text);
            c.offset += text.length;
            c.length += text.length;
          }
        } else if (op === 'backspace') {
          if (!c.replaced && c.length > 0) {
            // If not replaced yet, remove the original selection entirely
            quill.deleteText(c.start, c.length);
            c.offset = 0;
            c.length = 0;
            c.replaced = true;
          } else if (c.replaced && c.offset > 0) {
            // Delete char before current insertion point
            const delPos = c.start + c.offset - 1;
            quill.deleteText(delPos, 1);
            c.offset -= 1;
            c.length -= 1;
          }
        } else if (op === 'delete') {
          if (!c.replaced && c.length > 0) {
            // If not replaced yet, remove the original selection entirely
            quill.deleteText(c.start, c.length);
            c.offset = 0;
            c.length = 0;
            c.replaced = true;
          } else if (c.replaced) {
            // Delete char at current insertion point
            const delPos = c.start + c.offset;
            quill.deleteText(delPos, 1);
            // length reduced but offset remains
            c.length = Math.max(0, c.length - 1);
          }
        }
      }

      // After edits, keep multi-edit mode active and update cursors in place
      virtualCursorsRef.current = cursors;
      // Set caret to first edited occurrence for user feedback
      const first = cursors[0];
      const caretPos = first.start + first.offset;
      quill.setSelection(caretPos, 0);
      try { renderCursorOverlay(); } catch (e) {}
    };

    // Render visual caret markers for each virtual cursor into the overlay
    const renderCursorOverlay = () => {
      const overlay = cursorOverlayRef.current;
      if (!overlay || !quill) return;
      overlay.innerHTML = '';
      const cursors = virtualCursorsRef.current || [];
      cursors.forEach((c, idx) => {
        try {
          const pos = c.start + (c.offset || 0);
          const bounds = quill.getBounds(pos);
          const caret = document.createElement('div');
          caret.className = 'multi-caret-marker';
          // style the caret: thin blue line with small top offset
          caret.style.position = 'absolute';
          caret.style.width = '2px';
          caret.style.background = '#2563EB';
          caret.style.left = `${bounds.left}px`;
          caret.style.top = `${bounds.top}px`;
          caret.style.height = `${Math.max(16, bounds.height)}px`;
          caret.style.pointerEvents = 'none';
          caret.style.zIndex = 50;
          // Optionally add a small label with index for debugging
          caret.setAttribute('data-cursor-index', String(idx + 1));
          overlay.appendChild(caret);
        } catch (e) {
          // ignore bounds errors
        }
      });
    };

    const clearCursorOverlay = () => {
      const overlay = cursorOverlayRef.current;
      if (overlay) overlay.innerHTML = '';
    };

    const highlightCursorsRanges = () => {
      if (!quill) return;
      const cursors = virtualCursorsRef.current || [];
      formattedRangesRef.current = [];
      cursors.forEach(c => {
        try {
          // apply a light background to each matched range (or inserted text)
          const len = Math.max(1, c.length || 0);
          quill.formatText(c.start, len, { background: '#FFF59D' });
          formattedRangesRef.current.push({ start: c.start, length: len });
        } catch (e) {}
      });
    };

    const clearHighlightedRanges = () => {
      if (!quill) return;
      // Attempt to clear backgrounds for ranges we recorded
      const ranges = formattedRangesRef.current || [];
      ranges.forEach(r => {
        try { quill.formatText(r.start, Math.max(1, r.length), { background: false }); } catch (e) {}
      });
      formattedRangesRef.current = [];
    };

    // quill.on('selection-change', handleSelectionChange);
    quill.root.addEventListener('click', handleEditorClick);
    quill.root.addEventListener('keydown', handleKeyDown);
    // Listen for paste events to trigger suggestions
    quill.root.addEventListener('paste', (e) => {
      suggestionTriggerRef.current = true;
    });
    quill.root.addEventListener('contextmenu', handleEditorRightClick);

    quill.on('text-change', () => {
      handleTextChange();
      const range = quill.getSelection();
      if (range) {
        // If in multi-edit mode, refresh overlay positions
        if (virtualCursorsRef.current && virtualCursorsRef.current.length > 0) {
          try { renderCursorOverlay(); } catch (e) {}
        }
      }
      // Reset suggestion trigger after processing input
      suggestionTriggerRef.current = false;
    });

    // Set fixed height and custom font
    const editorContainer = editorRef.current.querySelector('.ql-editor'); // Access the Quill editor content
    if (editorContainer) {
      editorContainer.style.font = `${fontSize}px Fira Code, sans-serif`; // Set font size and family
      editorContainer.style.padding = '20px'; // Set padding to 20px
      editorContainer.style.setProperty('line-height', '38px', 'important'); // Adjust line height for better readability
      editorContainer.style.overflowY = 'auto'; // Enable vertical scrolling
      editorContainer.style.whiteSpace = 'pre-wrap'; // Preserve newlines and wrap text
      editorContainer.style.wordBreak = 'break-word'; // Break long words into the next line
      editorContainer.style.wordSpacing = '5px'; 

      // Hide suggestions on scroll (use suggestionsRef for latest value)
      const handleScroll = () => {
        if (suggestionsRef.current.length > 0) {
          setSuggestions([]);
        }
      };
      editorContainer.addEventListener('scroll', handleScroll);
      quill.__scrollCleanup = () => {
        editorContainer.removeEventListener('scroll', handleScroll);
      };
    }

    // Load the saved transcript from localStorage if available
    const savedTranscript = localStorage.getItem('transcript');
    if (savedTranscript) {
      quill.root.innerHTML = savedTranscript; // Load the saved transcript into Quill
      // Validation removed - user must click button to validate
    }

    // Handle non-breaking spaces and replace with regular spaces
    quill.on('text-change', () => {
      const htmlContent = quill.root.innerHTML; // Get the content of the editor
      const updatedContent = htmlContent.replace(/&nbsp;/g, ' '); // Replace &nbsp; with spaces

      if (htmlContent !== updatedContent) {
        // Use Quill API to set the updated content without resetting the cursor
        const currentSelection = quill.getSelection(); // Save the current cursor position
        const editorEl = editorRef.current?.querySelector('.ql-editor');
        const prevScrollTop = editorEl ? editorEl.scrollTop : null;
        quill.root.innerHTML = updatedContent; // Update the content
        if (currentSelection) {
          quill.setSelection(currentSelection); // Restore the cursor position
        }
        if (editorEl && prevScrollTop !== null) {
          editorEl.scrollTop = prevScrollTop; // Preserve scroll position
        }
      }

      // Save the content to localStorage
      try {
        localStorage.setItem('transcript', updatedContent); // Save the content to localStorage
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded. Attempting to free up space...');
          // Try to clear version history to free up space
          try {
            localStorage.removeItem('transcript_versions');
            // Retry saving the transcript
            localStorage.setItem('transcript', updatedContent);
            console.log('Successfully saved transcript after clearing version history');
          } catch (retryError) {
            console.error('Failed to save transcript even after clearing space:', retryError);
            // Alert user only once
            if (!window.__transcriptQuotaWarningShown) {
              window.__transcriptQuotaWarningShown = true;
              alert('Storage space is full. Your changes may not be saved automatically. Consider downloading your transcript.');
            }
          }
        } else {
          console.error('Error saving transcript:', e);
        }
      }
      // Validation removed - user must click button to validate
    });

    // Handle text selection
    quill.on('selection-change', (range) => {
      if (range && range.length > 0) {
        setHighlightedText(quill.getText(range.index, range.length));
        setSelectionRange(range); 
      }
    });

    return () => {
      quill.off('text-change'); // Clean up on component unmount
      quill.root.removeEventListener('click', handleEditorClick);
      quill.root.removeEventListener('keydown', handleKeyDown);
      quill.root.removeEventListener('contextmenu', handleEditorRightClick);
      // Clean up scroll event
      if (quill.__scrollCleanup) quill.__scrollCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSize, autosuggestionEnabled]);

  // Add this useEffect to auto-run capitalization every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (quillInstanceRef.current) {
        formatTitleCase();
      }
    }, 60000); // 60,000 ms = 1 minute
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Ctrl+K replace mode: replace all occurrences as user types
  useEffect(() => {
    if (!replaceMode || !quillInstanceRef.current) return;

    // Handle text input during replace mode
    // Removed previous replace-on-type behavior; multi-edit is handled inline in keydown/paste handlers
    return;
  }, [replaceMode]);

  // Attach right-click handler only once on mount
  useEffect(() => {
    const editorContainer = editorRef.current && editorRef.current.querySelector('.ql-editor');
    if (!editorContainer) return;
    editorContainer.addEventListener('contextmenu', handleEditorRightClick);
    return () => {
      editorContainer.removeEventListener('contextmenu', handleEditorRightClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Only add the global click/contextmenu handler when the suggestions popup or context menu is visible
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!contextMenu.visible && suggestions.length === 0) return;
    function handleGlobalClick(event) {
      console.log('[Suggestions Popup] Global click handler fired');
      const menuContains = contextMenuRef.current && contextMenuRef.current.contains(event.target);
      const suggestionsContains = suggestionsBoxRef.current && suggestionsBoxRef.current.contains(event.target);
      if (!menuContains && !suggestionsContains) {
        setSuggestions([]);
        setContextMenu({ visible: false, x: 0, y: 0, timestamp: null, clickIndex: 0, selectedText: '', showGoogle: false, showPlay: false, showSwapSpeaker: false });
      }
    }
    document.addEventListener("mousedown", handleGlobalClick);
    document.addEventListener("touchstart", handleGlobalClick);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      document.removeEventListener("touchstart", handleGlobalClick);
    };
  }, [contextMenu.visible, suggestions.length]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const editorContainer = editorRef.current && editorRef.current.querySelector('.ql-editor');
    if (!editorContainer) return;
    editorContainer.addEventListener('contextmenu', handleEditorRightClick);
    return () => {
      editorContainer.removeEventListener('contextmenu', handleEditorRightClick);
    };
  }, [editorRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debug: log contextMenu before return
  console.log('contextMenu state:', contextMenu);

  // Helper: checks if a string ends with sentence-ending punctuation
  function endsWithPunctuation(str) {
    const trimmed = str.trim();
    // Check for three dots first, then single punctuation marks
    return /\.{3}$/.test(trimmed) || /[.!?…]$/.test(trimmed);
  }

  // Helper: finds the first sentence-ending punctuation in a string
  function findFirstSentenceEnd(str) {
    // Find the first occurrence of ., ?, !, ..., or ellipsis character
    // Prioritize three dots (...) over single dots
    const ellipsisMatch = str.match(/(\.{3})([^.!?…]*)/);
    if (ellipsisMatch) {
      return ellipsisMatch.index + ellipsisMatch[1].length;
    }
    
    // Then look for single punctuation marks
    const match = str.match(/([.!?…])([^.!?…]*)/);
    if (!match) return -1;
    return match.index + match[0].indexOf(match[1]) + 1;
  }

  // Helper: extract timestamp+speaker label
  function extractLabel(line) {
    // e.g., 0:42:14.0 S1:
    const match = line.match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?\s+S[^:\s]+:\s*)/);
    if (match) {
      return { label: match[0], rest: line.slice(match[0].length) };
    }
    return { label: '', rest: line };
  }

  // Helper: checks if a string starts with a timestamp+speaker label
  function isSpeakerLine(line) {
    return /^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?\s+S[^:\s]+:\s*)/.test(line);
  }

  // Fix transcript logic
  const fixTranscript = () => {
    if (!quillInstanceRef.current) return;
    const content = quillInstanceRef.current.getText();
    const lines = content.split(/\r?\n/);
    const fixedLines = [];
    let i = 0;
    while (i < lines.length) {
      let line = lines[i];
      if (!line.trim()) {
        i++;
        continue;
      }
      // If this line is a speaker line
      if (isSpeakerLine(line)) {
        // If previous line exists and does not end with punctuation, try to merge
      if (
        fixedLines.length > 0 &&
        !endsWithPunctuation(fixedLines[fixedLines.length - 1]) &&
        isSpeakerLine(fixedLines[fixedLines.length - 1])
      ) {
          const { label, rest } = extractLabel(line);
          const endIdx = findFirstSentenceEnd(rest);
          if (endIdx !== -1) {
            let moved = rest.slice(0, endIdx).trim();
            if (moved.length > 0 && /[A-Z]/.test(moved[0])) {
              moved = moved[0].toLowerCase() + moved.slice(1);
            }
            // Append to previous line (no new line)
            fixedLines[fixedLines.length - 1] = fixedLines[fixedLines.length - 1].replace(/\s+$/, '') + ' ' + moved.replace(/^\s+/, '');
            // The rest of the next line (after the punctuation)
            const restAfter = rest.slice(endIdx).trim();
            if (restAfter) {
              fixedLines.push((label + restAfter).trim());
            }
            i++;
            continue;
          } else {
            // No punctuation, merge the entire rest into previous line and skip this line
            let moved = rest.trim();
            if (moved.length > 0 && /[A-Z]/.test(moved[0])) {
              moved = moved[0].toLowerCase() + moved.slice(1);
            }
            fixedLines[fixedLines.length - 1] = fixedLines[fixedLines.length - 1].replace(/\s+$/, '') + ' ' + moved.replace(/^\s+/, '');
            i++;
            continue;
          }
        }
        fixedLines.push(line.trim());
        i++;
        continue;
      }
      if (endsWithPunctuation(line)) {
        fixedLines.push(line.trim());
        i++;
        continue;
      }
      // Otherwise, look ahead to the next line(s)
      let merged = line;
      let j = i + 1;
      let brokeOnSpeaker = false;
      while (j < lines.length) {
        let nextLine = lines[j];
        if (!nextLine.trim()) {
          merged += ' ';
          j++;
          continue;
        }
        if (isSpeakerLine(nextLine)) {
          brokeOnSpeaker = true;
          break;
        }
        const { label, rest } = extractLabel(nextLine);
        const endIdx = findFirstSentenceEnd(rest);
        if (endIdx !== -1) {
          let moved = rest.slice(0, endIdx).trim();
          if (moved.length > 0 && /[A-Z]/.test(moved[0])) {
            moved = moved[0].toLowerCase() + moved.slice(1);
          }
          merged = merged.replace(/\s+$/, '') + ' ' + moved.replace(/^\s+/, '');
          fixedLines.push(merged.trim());
          // The rest of the next line (after the punctuation)
          const restAfter = rest.slice(endIdx).trim();
          if (label && (restAfter || restAfter === '')) {
            fixedLines.push((label + (restAfter ? restAfter : '')).trim());
          } else if (restAfter) {
            fixedLines.push(restAfter);
          }
          break;
        } else {
          merged += ' ' + rest.trim();
        }
        j++;
      }
      if (brokeOnSpeaker) {
        if (merged.trim()) {
          fixedLines.push(merged.trim());
        }
        i = j;
        continue;
      }
      if (j >= lines.length) {
        if (merged.trim()) {
          fixedLines.push(merged.trim());
        }
        i = j;
        continue;
      }
      i = j + 1;
    }
    // Remove trailing blank lines
    while (fixedLines.length > 0 && fixedLines[fixedLines.length - 1].trim() === '') {
      fixedLines.pop();
    }
    // Join paragraphs with double newline for blank line between paragraphs
    const fixedText = fixedLines.join('\n\n');
    quillInstanceRef.current.setText(fixedText);
  };

  // Join only the highlighted text paragraphs, keeping the first timestamp+speaker label
  const joinParagraphs = () => {
    if (!quillInstanceRef.current) return;
    const range = quillInstanceRef.current.getSelection();
    if (!range || range.length === 0) return;
    const selectedText = quillInstanceRef.current.getText(range.index, range.length);
    // Split by double newlines (paragraphs)
    const paragraphs = selectedText.split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) return;
    // Extract the first timestamp+speaker label
    const firstMatch = paragraphs[0].match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?\s+S\d+:\s*)/);
    let prefix = '';
    let firstContent = paragraphs[0];
    if (firstMatch) {
      prefix = firstMatch[0];
      firstContent = paragraphs[0].slice(prefix.length).trim();
    }
    // Remove all subsequent timestamps and speaker labels
    const cleaned = [firstContent, ...paragraphs.slice(1).map(p => p.replace(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?\s+S[^:\s]+:\s*)/, '').trim())];
    // Join all cleaned paragraphs with a space
    const joined = prefix + cleaned.join(' ');
    // Replace the selected text with the joined result
    quillInstanceRef.current.deleteText(range.index, range.length);
    quillInstanceRef.current.insertText(range.index, joined);
    quillInstanceRef.current.setSelection(range.index + joined.length, 0);
  };

  // Join consecutive paragraphs with the same speaker number within highlighted text
  const joinSameSpeakerParagraphs = () => {
    if (!quillInstanceRef.current) return;
    const range = quillInstanceRef.current.getSelection();
    if (!range || range.length === 0) {
      alert('Please select text first.');
      return;
    }
    const selectedText = quillInstanceRef.current.getText(range.index, range.length);
    // Split by double newlines (paragraphs)
    const paragraphs = selectedText.split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) return;
    
    const result = [];
    let currentGroup = null;
    
    for (const para of paragraphs) {
      // Extract timestamp and speaker label (e.g., "0:12:34 S1: ")
      const match = para.match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?\s+(S[^:\s]+):\s*)/);
      
      if (match) {
        const timestamp = match[1];
        const speaker = match[3]; // e.g., "S1"
        const content = para.slice(match[0].length).trim();
        
        if (currentGroup && currentGroup.speaker === speaker) {
          // Same speaker - append content to current group
          currentGroup.content += ' ' + content;
        } else {
          // Different speaker or first paragraph - start new group
          if (currentGroup) {
            result.push(currentGroup);
          }
          currentGroup = {
            timestamp: timestamp,
            speaker: speaker,
            content: content
          };
        }
      } else {
        // Paragraph without timestamp/speaker - append to current group or skip
        if (currentGroup) {
          currentGroup.content += ' ' + para;
        } else {
          // No current group, keep as is
          result.push({ timestamp: '', speaker: '', content: para });
        }
      }
    }
    
    // Add the last group
    if (currentGroup) {
      result.push(currentGroup);
    }
    
    // Reconstruct the text
    const joined = result.map(group => {
      if (group.timestamp) {
        return group.timestamp + group.content;
      }
      return group.content;
    }).join('\n\n');
    
    // Replace the selected text with the joined result
    quillInstanceRef.current.deleteText(range.index, range.length);
    quillInstanceRef.current.insertText(range.index, joined);
    quillInstanceRef.current.setSelection(range.index + joined.length, 0);
  };

  // Remove one-word active listening cues after questions in highlighted text
  const removeActiveListeningCues = () => {
    if (!quillInstanceRef.current) return;
    const range = quillInstanceRef.current.getSelection();
    if (!range || range.length === 0) return;
    const selectedText = quillInstanceRef.current.getText(range.index, range.length);
    // List of one-word feedback cues (case-insensitive, with punctuation)
    const cues = [
      'yeah.', 'okay.', 'ok.', 'right.', 'yes.', 'no.', 'uh-huh.', 'yep.', 'mm-hmm.',
    ];
    // Split by double newlines (paragraphs)
    const paragraphs = selectedText.split(/\r?\n\r?\n/);
    const cleaned = [];
    for (let i = 0; i < paragraphs.length; ++i) {
      const prev = i > 0 ? paragraphs[i-1].trim() : '';
      const curr = paragraphs[i].trim();
      // Remove timestamp+speaker label for cue check
      const cueContent = curr.replace(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?\s+S\d+:\s*)/, '').trim();
      // If previous paragraph does NOT end with ? and this is a one-word cue, skip it
      if (i > 0 && !/\?$/.test(prev) && cues.includes(cueContent.toLowerCase())) {
        continue;
      }
      cleaned.push(paragraphs[i]);
    }
    // Rejoin with double newlines
    const result = cleaned.join('\n\n');
    quillInstanceRef.current.deleteText(range.index, range.length);
    quillInstanceRef.current.insertText(range.index, result);
    quillInstanceRef.current.setSelection(range.index + result.length, 0);
  };

  // Remove filler words from the entire transcript
  const removeFillerWords = (fillers) => {
    if (!quillInstanceRef.current || !fillers || fillers.length === 0) return;
    const quill = quillInstanceRef.current;
    const content = quill.getText();
    
    // Build regex patterns for each filler word
    // Match filler words as standalone words (with word boundaries)
    let cleanedContent = content;
    
    fillers.forEach(filler => {
      // Escape special regex characters and create pattern
      const escapedFiller = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match the word with optional punctuation and surrounding spaces
      // This handles cases like "uh,", "um.", "like, ", etc.
      const pattern = new RegExp(`\\b${escapedFiller}\\b[,.]?\\s*`, 'gi');
      cleanedContent = cleanedContent.replace(pattern, '');
    });
    
    // Clean up multiple spaces and preserve paragraph structure
    cleanedContent = cleanedContent.replace(/  +/g, ' '); // Remove multiple spaces
    cleanedContent = cleanedContent.replace(/ \n/g, '\n'); // Remove space before newline
    cleanedContent = cleanedContent.replace(/\n /g, '\n'); // Remove space after newline
    
    // Update the editor content
    quill.setText(cleanedContent);
  };

  // Adjust timestamps by adding or subtracting seconds from selected/highlighted timestamps
  const adjustTimestamps = (secondsToAdjust) => {
    if (!quillInstanceRef.current) return;
    const quill = quillInstanceRef.current;
    
    // Use stored range from when modal was opened
    const range = adjustTimestampRangeRef.current;
    
    // If no selection was stored, return
    if (!range || range.length === 0) {
      alert('Please select text containing timestamps to adjust.');
      return;
    }

    const selectedText = quill.getText(range.index, range.length);
    
    // Format seconds as H:MM:SS.d or HH:MM:SS.d
    const formatTimestamp = (totalSeconds) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = (totalSeconds % 60).toFixed(1);
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(4, '0')}`;
    };

    // Parse and adjust timestamps
    let adjustedText = selectedText.replace(
      /(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)/g,
      (match, h, m, s) => {
        const currentSeconds = parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
        const newSeconds = Math.max(0, currentSeconds + secondsToAdjust);
        return formatTimestamp(newSeconds);
      }
    );

    // Replace the selected text with adjusted timestamps
    quill.deleteText(range.index, range.length);
    quill.insertText(range.index, adjustedText);
    quill.setSelection(range.index, adjustedText.length);
  };

  // Build speaker snippets from paragraphs
  const buildSpeakerSnippets = () => {
    if (!quillInstanceRef.current) return { snippets: {}, order: [] };
    const content = quillInstanceRef.current.getText();
    const paragraphs = content.split(/\r?\n\r?\n/);
    const items = []; // {speaker, start, end, index}
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const match = p.match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?)[\s]+(S[^:\s]+):\s*/);
      if (!match) continue;
      const startStr = match[1];
      const speakerId = match[3];
      const toSeconds = (ts) => {
        const [hh, mm, ss] = ts.split(':');
        return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseFloat(ss);
      };
      const start = toSeconds(startStr);
      // Find end time from next paragraph with timestamp
      let end = null;
      for (let j = i + 1; j < paragraphs.length; j++) {
        const n = paragraphs[j];
        const m2 = n.match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?)[\s]+S[^:\s]+:\s*/);
        if (m2) {
          end = toSeconds(m2[1]);
          break;
        }
      }
      items.push({ speaker: speakerId, start, end, index: i });
    }
    // Group by speaker
    const bySpeaker = {};
    items.forEach(it => {
      if (!bySpeaker[it.speaker]) bySpeaker[it.speaker] = [];
      bySpeaker[it.speaker].push(it);
    });
    // Sort each speaker's items by start time
    Object.keys(bySpeaker).forEach(k => bySpeaker[k].sort((a,b) => a.start - b.start));
    // Pick only the first occurrence of each speaker
    const snippets = {};
    // Sort speakers numerically (S1, S2, S3, ...) instead of lexicographically (S1, S10, S2)
    const order = Object.keys(bySpeaker).sort((a, b) => {
      // Try numeric sort when possible; otherwise fall back to locale string compare
      const strip = (s) => s.replace(/^S/, '');
      const numA = parseInt(strip(a), 10);
      const numB = parseInt(strip(b), 10);
      const aIsNum = !Number.isNaN(numA);
      const bIsNum = !Number.isNaN(numB);
      if (aIsNum && bIsNum) return numA - numB;
      if (aIsNum) return -1; // numbers before non-numeric
      if (bIsNum) return 1;
      return a.localeCompare(b);
    });
    order.forEach(sp => {
      snippets[sp] = [bySpeaker[sp][0]];
    });
    return { snippets, order };
  };

  const formatTime = (seconds) => {
    if (seconds == null) return '';
    const sign = seconds < 0 ? '-' : '';
    const s = Math.max(0, Math.abs(seconds));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = (s % 60).toFixed(1);
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    return `${sign}${hh}:${pad(mm)}:${ss.padStart(4,'0')}`;
  };

  const stackedPanelWidth = Math.max(
    showFindReplace ? 320 : 0,
    showNotes ? notesWidth : 0
  );

  return (
    <div className="w-full flex-1 h-full shadow-lg border min-h-0">
      <div className="flex h-full min-h-0">
        <div className="flex h-full flex-1 relative min-w-0 min-h-0">
          {/* Quill editor container */}
          <div
            ref={editorRef}
            className="flex-1 min-w-0 font-monox bg-white rounded-md h-full break-words word-space-2 whitespace-pre-wrap overflow-auto"
            title="Right-click on timestamps (like '0:00:36.4 S2:') to play audio from that point"
          ></div>
          {/* Overlay for rendering multi-cursor carets */}
          <div
            ref={cursorOverlayRef}
            className="pointer-events-none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Speaker snippets panel (conditionally shown) */}
          {showSpeakerSnippets && (
            <React.Fragment>
              {/* Resize handle for snippets */}
              <div
                onMouseDown={(e) => {
                  isResizingSnippetsRef.current = true;
                  startXSnippetsRef.current = e.clientX;
                  startWidthSnippetsRef.current = snippetsWidth;
                  document.body.style.cursor = 'col-resize';
                  document.body.style.userSelect = 'none';
                }}
                className="w-1 cursor-col-resize bg-transparent hover:bg-teal-300 transition-colors"
                title="Drag to resize snippets"
              />
              <div className="h-full border-l border-gray-100 bg-white" style={{ width: snippetsWidth }}>
                <div className="h-full flex flex-col">
                  {/* Panel Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Speaker Snippets</h3>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                        value={snippetCount}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setSnippetCount(v);
                          localStorage.setItem('snippet_count', String(v));
                          const { snippets, order } = buildSpeakerSnippets();
                          setSpeakerSnippets(snippets);
                          setSpeakerOrder(order);
                        }}
                      >
                        <option value={1}>1 per speaker</option>
                        <option value={3}>3 per speaker</option>
                        <option value={5}>5 per speaker</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Panel Content */}
                  <div className="flex-1 overflow-auto p-3 space-y-2">
                    {speakerOrder.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0"/>
                        </svg>
                        <p className="text-xs">No speakers detected</p>
                      </div>
                    )}
                    {speakerOrder.map(sp => (
                      <div key={sp} className="bg-gray-50 rounded-xl overflow-hidden">
                        {/* Speaker Header */}
                        <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-400 text-white text-xs font-bold">
                            {sp.replace('S', '')}
                          </span>
                          <input
                            type="text"
                            className="flex-1 bg-white/50 border border-transparent rounded-lg px-2 py-1 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-teal-500/20 transition-all"
                            value={speakerNames[sp] || ''}
                            onChange={e => setSpeakerNames(prev => ({ ...prev, [sp]: e.target.value }))}
                            placeholder="Speaker name..."
                          />
                        </div>
                        
                        {/* Characteristics */}
                        <div className="px-3 py-2 flex flex-wrap gap-1 border-b border-gray-100">
                          {(speakerCharacteristics[sp] || []).map((char, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
                              {char}
                              <button
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => setSpeakerCharacteristics(prev => ({
                                  ...prev,
                                  [sp]: prev[sp].filter((_, i) => i !== idx)
                                }))}
                              >×</button>
                            </span>
                          ))}
                          <input
                            id={`char-input-${sp}`}
                            type="text"
                            className="flex-1 min-w-[80px] bg-white/50 border border-transparent rounded-md px-2 py-0.5 text-[10px] text-gray-500 placeholder-gray-300 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-teal-500/20 transition-all"
                            placeholder="+ Add trait..."
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                setSpeakerCharacteristics(prev => ({
                                  ...prev,
                                  [sp]: [...(prev[sp] || []), e.target.value.trim()]
                                }));
                                e.target.value = '';
                              }
                            }}
                          />
                        </div>
                        
                        {/* Timestamps */}
                        <div className="p-2 flex flex-wrap gap-1">
                          {(speakerSnippets[sp] || []).map((snip, idx) => (
                            <div key={idx} className="group relative">
                              <button
                                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-all"
                                title={`Play ${formatTime(snip.start)}`}
                                onClick={() => {
                                  if (onRequestPlayRange) {
                                    const dur = (snip.end != null && snip.end > snip.start) ? (snip.end - snip.start) : undefined;
                                    onRequestPlayRange(snip.start, dur);
                                  } else if (onTimestampClick) {
                                    onTimestampClick(snip.start);
                                  }
                                }}
                              >
                                {formatTime(snip.start)}
                              </button>
                              <button
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                onClick={() => setSpeakerSnippets(prev => ({
                                  ...prev,
                                  [sp]: prev[sp].filter((_, i) => i !== idx)
                                }))}
                              >×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Panel Footer */}
                  <div className="p-3 border-t border-gray-100 flex gap-2">
                    <button
                      className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                      onClick={() => {
                        const { snippets, order } = buildSpeakerSnippets();
                        setSpeakerSnippets(snippets);
                        setSpeakerOrder(order);
                      }}
                    >
                      Rebuild
                    </button>
                    {onRequestStop && (
                      <button
                        className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                        onClick={() => onRequestStop()}
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
        )}
        {suggestions.length > 0 && (
        <div
          ref={suggestionsBoxRef}
          className="absolute z-40 bg-white border border-gray-300 shadow-xl rounded-lg p-1 text-xs min-w-[160px] max-w-[260px] transition-all duration-200 ease-out animate-fade-in"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            position: 'absolute',
            maxHeight: suggestions.length > 4 ? '168px' : 'auto', // 4 * 42px (item height + margin)
            overflowY: suggestions.length > 4 ? 'auto' : 'visible',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
          }}
        >
          {suggestions.map((word, index) => (
            <div
              key={index}
              onClick={() => insertSuggestionAtContext(word)}
              className={`cursor-pointer px-3 py-2 rounded-md mb-1 last:mb-0 transition-colors duration-150 flex items-center gap-2 select-none whitespace-nowrap ${index === selectedSuggestionIndex ? 'bg-blue-100 font-bold text-blue-700 shadow-sm scale-[1.03]' : 'hover:bg-blue-50'}`}
              style={index === selectedSuggestionIndex ? { boxShadow: '0 2px 8px rgba(37,99,235,0.10)' } : {}}
            >
              <svg className="w-3 h-3 text-blue-400 opacity-70" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
              <span>{word}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-300 shadow-xl rounded-lg py-1 z-50"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            minWidth: '180px'
          }}
        >
          {contextMenu.showPlay && (
            <div
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center"
              onClick={() => handleContextMenuClick('play')}
            >
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play from here
            </div>
          )}
          {contextMenu.showGoogle && (
            <div
              className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center"
              onClick={() => handleContextMenuClick('google')}
            >
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              Search with Google
            </div>
          )}
          {contextMenu.showSwapSpeaker && (
            <div
              className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center"
              onClick={() => handleContextMenuClick('swapSpeaker')}
            >
              <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              Swap Speaker Labels
            </div>
          )}
          {contextMenu.selectedText && (
            <div
              className="px-4 py-2 hover:bg-yellow-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center"
              onClick={() => handleContextMenuClick('joinParagraphs')}
            >
              <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 12h16M12 4v16" />
              </svg>
              Join Paragraphs
            </div>
          )}
          {contextMenu.showSpeakerSnippets && (
            <div
              className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center"
              onClick={() => handleContextMenuClick('speakerSnippets')}
            >
              <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 19V6l12-2v13" />
                <rect x="3" y="10" width="4" height="10" rx="1" />
              </svg>
              Speaker Snippets
            </div>
          )}
          {contextMenu.selectedText && contextMenu.selectedText.match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?)[\s]+S\d+:/) && (
            <div
              className="px-4 py-2 hover:bg-indigo-100 cursor-pointer text-sm font-medium text-indigo-700 flex items-center"
              onClick={() => {
                // Add to Speaker Snippets logic
                const match = contextMenu.selectedText.match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?)[\s]+(S\d+):/);
                if (match) {
                  const startStr = match[1];
                  const speakerId = match[3];
                  const toSeconds = (ts) => {
                    const [hh, mm, ss] = ts.split(':');
                    return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseFloat(ss);
                  };
                  const start = toSeconds(startStr);

                  // Find end time from next timestamp in transcript
                  const content = quillInstanceRef.current.getText();
                  const paragraphs = content.split(/\r?\n\r?\n/);
                  let end = null;
                  let foundIdx = -1;
                  for (let i = 0; i < paragraphs.length; i++) {
                    if (paragraphs[i].includes(contextMenu.selectedText.trim())) {
                      foundIdx = i;
                      break;
                    }
                  }
                  if (foundIdx !== -1) {
                    for (let j = foundIdx + 1; j < paragraphs.length; j++) {
                      const m2 = paragraphs[j].match(/^((\d{1,2}:){2}\d{1,2}(?:\.\d+)?)[\s]+S\d+:\s*/);
                      if (m2) {
                        end = toSeconds(m2[1]);
                        break;
                      }
                    }
                  }

                  // Add to speakerSnippets state
                  setSpeakerSnippets(prev => {
                    const arr = prev[speakerId] ? [...prev[speakerId]] : [];
                    arr.push({ speaker: speakerId, start, end, index: foundIdx });
                    return { ...prev, [speakerId]: arr };
                  });
                  if (!speakerOrder.includes(speakerId)) setSpeakerOrder(order => [...order, speakerId]);
                }
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Add to Speaker Snippets
            </div>
          )}
          {contextMenu.selectedText && (
            <div
              className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center"
              onClick={() => handleContextMenuClick('removeActiveListeningCues')}
            >
              <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
              Remove Active Listening Cues
            </div>
          )}
        </div>
      )}
      </div>
      {(showFindReplace || showNotes || showInvalidList) && (
        <div
          className="flex h-full flex-col border-l border-gray-100 bg-white"
          style={{ width: stackedPanelWidth || 320 }}
        >
          {/* Find & Replace Panel */}
          {showFindReplace && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Find & Replace</h3>
                <button 
                  onClick={() => setShowFindReplace(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex-1 p-4 space-y-3">
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                  value={findText}
                  onChange={e => setFindText(e.target.value)}
                  placeholder="Find..."
                />
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                  value={replaceTextValue}
                  onChange={e => setReplaceTextValue(e.target.value)}
                  placeholder="Replace with..."
                />
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-2.5 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-2 focus:ring-teal-500/20 accent-teal-500"
                      checked={wholeWord}
                      onChange={(e) => setWholeWord(e.target.checked)}
                    />
                    Whole word
                  </label>
                  <label className="flex items-center gap-2.5 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-2 focus:ring-teal-500/20 accent-teal-500"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                    />
                    Case sensitive
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-400 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                    onClick={() => {
                      if (!findText) return;
                      const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
                      const flags = caseSensitive ? 'g' : 'gi';
                      const regex = new RegExp(pattern, flags);
                      const content = quillInstanceRef.current?.getText() || '';
                      const matches = content.match(regex);
                      setFindResultCount(matches ? matches.length : 0);
                      if (matches && matches.length > 0) {
                        const idx = content.toLowerCase().indexOf(findText.toLowerCase());
                        if (idx !== -1) {
                          quillInstanceRef.current.setSelection(idx, findText.length);
                          quillInstanceRef.current.formatText(idx, findText.length, { background: '#fde68a' });
                        }
                      }
                    }}
                  >
                    Find
                  </button>
                  <button
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (!findText) return;
                      const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
                      const flags = caseSensitive ? 'g' : 'gi';
                      const regex = new RegExp(pattern, flags);
                      const content = quillInstanceRef.current?.getText() || '';
                      const newContent = content.replace(regex, replaceTextValue);
                      quillInstanceRef.current?.setText(newContent);
                      setFindResultCount(0);
                    }}
                  >
                    Replace All
                  </button>
                </div>
                {findResultCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                    <span className="text-xs text-amber-700">{findResultCount} match{findResultCount > 1 ? 'es' : ''} found</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invalid Timestamps Panel */}
          {showInvalidList && !showFindReplace && !showNotes && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Invalid Timestamps</h3>
                <div className="flex items-center gap-1">
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                    title="Refresh"
                    onClick={() => validateAllTimestamps()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </button>
                  <button onClick={() => setShowInvalidList(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              {/* Navigation */}
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <button onClick={goToPrevInvalid} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4L6 10l6 6"/></svg>
                  </button>
                  <span className="text-xs font-medium text-gray-600 tabular-nums">{currentInvalidIndex + 1} / {invalidTimestampCount}</span>
                  <button onClick={goToNextInvalid} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4l6 6-6 6"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {timestampInvalidsRef.current && timestampInvalidsRef.current.length > 0 ? (
                  timestampInvalidsRef.current.map((it, i) => (
                    <button
                      key={i}
                      onClick={() => goToInvalidAt(i)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors mb-1 ${
                        i === currentInvalidIndex ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs font-mono text-gray-700 truncate">{it.text}</span>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <svg className="w-10 h-10 mb-2 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p className="text-xs">All timestamps valid</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Panel */}
          {showNotes && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                <button onClick={() => setShowNotes(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your notes here..."
                className="flex-1 w-full p-4 bg-gray-50/50 m-3 mr-3 mb-3 rounded-xl border border-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-teal-500/20 transition-all"
                style={{ width: 'calc(100% - 1.5rem)', height: 'calc(100% - 4.5rem)' }}
              />
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col h-full border-l border-gray-100">
        {/* Modern Tool Strip */}
        <div className="flex flex-col gap-1.5 p-2 bg-gray-50/50">
          {/* Speaker Tools Group */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium px-1 mb-0.5">Speakers</span>
            <ToolButton
              active={showSpeakerSnippets}
              onClick={() => setShowSpeakerSnippets(v => !v)}
              title="Speaker Snippets"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0"/></svg>}
            />
            <ToolButton
              active={showHighlightRepeated}
              onClick={() => {
                const newState = !showHighlightRepeated;
                setShowHighlightRepeated(newState);
                highlightRepeatedSpeakers(newState);
              }}
              title="Highlight Repeated"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 10h4v11H3zM9 3h4v18H9zM15 7h4v14h-4z" /></svg>}
            />
            {showHighlightRepeated && (repeatedPositionsRef.current?.length || 0) > 0 && (
              <div className="flex gap-0.5 px-0.5">
                <button onClick={goToPrevRepeated} className="flex-1 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4L6 10l6 6"/></svg>
                </button>
                <button onClick={goToNextRepeated} className="flex-1 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4l6 6-6 6"/></svg>
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-200 my-1" />

          {/* Timestamp Tools Group */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium px-1 mb-0.5">Timestamps</span>
            <ToolButton
              active={showInvalidList}
              onClick={() => {
                setShowInvalidList(v => {
                  const next = !v;
                  if (next) setTimeout(() => validateAllTimestamps(), 0);
                  return next;
                });
              }}
              title="Invalid Timestamps"
              badge={invalidTimestampCount > 0 ? invalidTimestampCount : null}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>}
            />
            <ToolButton
              active={validateTimestampsEnabled}
              onClick={() => {
                setValidateTimestampsEnabled((prev) => {
                  const next = !prev;
                  if (next) scheduleValidateViewportTimestamps(0);
                  else clearTimestampHighlights();
                  return next;
                });
              }}
              title="Auto-validate"
              activeColor="emerald"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>}
            />
            <ToolButton
              active={showAdjustTimestamp}
              onClick={() => {
                if (quillInstanceRef.current) {
                  const range = quillInstanceRef.current.getSelection();
                  if (range && range.length > 0) {
                    adjustTimestampRangeRef.current = { index: range.index, length: range.length };
                    setShowAdjustTimestamp(true);
                  } else {
                    alert('Please select text containing timestamps first.');
                  }
                }
              }}
              title="Adjust Timestamps"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
          </div>

          <div className="h-px bg-gray-200 my-1" />

          {/* Edit Tools Group */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium px-1 mb-0.5">Edit</span>
            <ToolButton
              onClick={joinSameSpeakerParagraphs}
              title="Join Paragraphs"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12M19.5 15l-3 3m0 0l-3-3m3 3V9"/></svg>}
            />
            <ToolButton
              active={showFindReplace}
              onClick={() => setShowFindReplace(v => !v)}
              title="Find & Replace"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>}
            />
            <ToolButton
              active={showNotes}
              onClick={() => setShowNotes(v => !v)}
              title="Notes"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>}
            />
          </div>
        </div>
      </div>

      {/* Adjust Timestamp Modal */}
      <AdjustTimestampModal
        isOpen={showAdjustTimestamp}
        onClose={() => {
          setShowAdjustTimestamp(false);
          adjustTimestampRangeRef.current = null;
        }}
        onAdjust={adjustTimestamps}
      />
    </div>
  </div>
  );
});

// Sleek Tool Button component
const ToolButton = ({ active, onClick, title, icon, badge, activeColor = 'teal' }) => {
  const colorClasses = {
    teal: active ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-white shadow-md shadow-teal-500/20' : 'text-gray-500 hover:text-gray-700 hover:bg-white',
    emerald: active ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white shadow-md shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-700 hover:bg-white',
  };
  
  return (
    <button
      onClick={onClick}
      title={title}
      className={`relative w-full h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${colorClasses[activeColor]}`}
    >
      {icon}
      {badge && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-amber-500 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};

export default Textarea;
