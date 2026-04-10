
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authContext";
import api from "../api/api";
import { FaCloudUploadAlt } from "react-icons/fa";
import { 
  FiMusic, 
  FiUpload, 
  FiCheck as FiCheckIcon,
  FiClock,
  FiFile,
  FiX,
  FiZap,
  FiUser
} from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import getSymbolFromCurrency from 'currency-symbol-map';

const FilesUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [files, setFiles] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [verbatim, setVerbatim] = useState(false);
  const [rushOrder, setRushOrder] = useState(false);
  const [timestamp, setTimestamp] = useState(true);
  const [instructions, setInstructions] = useState("");
  const [accent, setAccent] = useState("US");
  const [loading, setLoading] = useState(false);
  const [freeTrialActive, setFreeTrialActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const cancelUploadRef = useRef(false); // set to true to abort an in-progress upload

  const PRICE_PER_MINUTE = 0.5;         // Manual transcription: $0.50/min
  const AUTO_PRICE_PER_MINUTE = 0.07;   // Auto transcription: $0.07/min
  const FREE_TRIAL_SECONDS = 5 * 60;
  const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB — kept small to avoid Railway HTTP/2 proxy limits
  const [transcriptionType, setTranscriptionType] = useState('manual'); // 'manual' | 'auto'
  // Currency preference comes from the user's profile; fall back to USD until it's available
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD']);
  const [currencyLoading, setCurrencyLoading] = useState(true);

  // Load user profile to get currency preference
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setCurrencyLoading(true);
        const response = await api.get('/api/user-profile/');
        if (response.data.currency) {
          console.log('User currency from profile:', response.data.currency);
          setCurrency(response.data.currency);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setCurrencyLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  useEffect(() => {
    const isFreeTrial = location.state?.freeTrial || sessionStorage.getItem('freeTrialActive') === 'true';
    setFreeTrialActive(!!isFreeTrial);
  }, [location.state]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        console.log('Fetching exchange rate for currency:', currency);
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        if (data.rates) {
          // Add USD to the list since it's the base currency
          const currencies = ['USD', ...Object.keys(data.rates)].sort();
          setAvailableCurrencies(currencies);
          console.log('Available currencies:', currencies);
          
          if (currency && currency !== 'USD') {
            const rate = data.rates[currency];
            if (rate) {
              setExchangeRate(rate);
              console.log(`✓ Exchange rate for ${currency}: ${rate}`);
            } else {
              console.warn(`✗ Exchange rate not found for ${currency}, using 1`);
              setExchangeRate(1);
            }
          } else {
            setExchangeRate(1);
            console.log('Currency is USD, exchange rate set to 1');
          }
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setAvailableCurrencies(['USD']);
        setExchangeRate(1);
      }
    };
    
    if (currency) {
      fetchExchangeRate();
    }
  }, [currency]);

  const calculateTotalCost = (totalSeconds, type) => {
    const billableSeconds = freeTrialActive
      ? Math.max(0, totalSeconds - FREE_TRIAL_SECONDS)
      : totalSeconds;
    const pricePerMinute = (type || transcriptionType) === 'auto'
      ? AUTO_PRICE_PER_MINUTE
      : PRICE_PER_MINUTE;
    return (billableSeconds / 60) * pricePerMinute;
  };
  
  const calculateTotalCostInCurrency = (totalSeconds) => {
    const usdCost = calculateTotalCost(totalSeconds);
    return usdCost * exchangeRate;
  };

  // Get audio/video duration
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const media = file.type.startsWith('video/') ? document.createElement('video') : new Audio();
      const cleanup = () => URL.revokeObjectURL(url);
      media.onloadedmetadata = () => {
        cleanup();
        resolve(isFinite(media.duration) && media.duration > 0 ? media.duration : 0);
      };
      media.onerror = () => {
        cleanup();
        resolve(0);
      };
      // Fallback timeout in case metadata never fires
      const timer = setTimeout(() => {
        cleanup();
        resolve(0);
      }, 10000);
      media.onloadedmetadata = () => {
        clearTimeout(timer);
        cleanup();
        resolve(isFinite(media.duration) && media.duration > 0 ? media.duration : 0);
      };
      media.src = url;
    });
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length === 0) return;

    const file = uploadedFiles[0];
    const duration = await getAudioDuration(file);
    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Reset all previous state
    cancelUploadRef.current = false;
    setUploadedFileId(null);
    setUploadProgress(0);
    setUploadStatus({ [fileId]: { status: 'uploading', progress: 0 } });
    setUploading(true);
    const fileItem = { file, name: file.name, duration, id: fileId, status: 'uploading', progress: 0 };
    setFiles([fileItem]);
    setTotalDuration(duration);
    setTotalCost(calculateTotalCost(duration));

    // Start chunked upload immediately
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0;
    let uploadResponse = null;

    try {
      for (let i = 0; i < totalChunks; i++) {
        if (cancelUploadRef.current) {
          // User cancelled — stop silently
          return;
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, (i + 1) * CHUNK_SIZE);
        const chunk = file.slice(start, end);
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunk_index', i);
        formData.append('total_chunks', totalChunks);
        formData.append('upload_id', fileId);

        if (i === 0) {
          formData.append('metadata', JSON.stringify({
            name: file.name,
            duration,
            verbatim: verbatim ? "Yes" : "No",
            rush_order: rushOrder ? "Yes" : "No",
            timestamp: timestamp ? "Yes" : "No",
            spelling: accent,
            instruction: instructions,
            total_cost: calculateTotalCost(duration, transcriptionType).toFixed(2),
            transcription_type: transcriptionType,
          }));
        }

        let response = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          if (cancelUploadRef.current) return;
          try {
            response = await api.post('/api/files/upload/chunked/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            break;
          } catch (chunkErr) {
            if (attempt === 3) throw chunkErr;
            await new Promise(res => setTimeout(res, attempt * 500));
          }
        }

        if (response?.data?.id) uploadResponse = response.data;

        uploadedChunks++;
        const progress = Math.round((uploadedChunks / totalChunks) * 100);
        setUploadProgress(progress);
        setUploadStatus({ [fileId]: { status: 'uploading', progress } });
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
      }

      if (!uploadResponse?.id) throw new Error('Upload completed but no file ID received');

      setUploadedFileId(uploadResponse.id);
      localStorage.setItem('pendingUploadId', uploadResponse.id.toString());
      setUploadStatus({ [fileId]: { status: 'completed', progress: 100 } });
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'completed', progress: 100, uploadedId: uploadResponse.id } : f));
    } catch (error) {
      if (cancelUploadRef.current) return; // cancelled, ignore error
      console.error('Upload error:', error);
      const msg = error.response?.data?.error || 'Failed to upload file. Please try again.';
      setUploadStatus({ [fileId]: { status: 'error', progress: 0 } });
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
      alert(msg);
    } finally {
      if (!cancelUploadRef.current) setUploading(false);
    }
  };

  // Cancel an in-progress upload and reset
  const cancelUpload = () => {
    cancelUploadRef.current = true;
    setUploading(false);
    setUploadedFileId(null);
    setUploadProgress(0);
    setUploadStatus({});
    setFiles([]);
    setTotalDuration(0);
    setTotalCost(0);
  };

  // Remove a completed/errored file
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const total = newFiles.reduce((acc, f) => acc + f.duration, 0);
    setTotalDuration(total);
    setTotalCost(calculateTotalCost(total));
    setUploadedFileId(null);
  };

  useEffect(() => {
    const total = files.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(total);
    setTotalCost(calculateTotalCost(total, transcriptionType));
  }, [freeTrialActive, files, exchangeRate, transcriptionType]);

  // Handle checkout — file is already uploaded; just claim + navigate to payment
  const handleCheckout = async () => {
    if (files.length === 0) {
      alert("Please select a file before proceeding.");
      return;
    }
    if (!uploadedFileId) {
      alert("Please wait for the file to finish uploading.");
      return;
    }
    setLoading(true);
    try {
      if (freeTrialActive) sessionStorage.removeItem('freeTrialActive');

      if (!user) {
        navigate('/register', { state: { from: '/upload', message: 'Create an account to complete your upload' } });
        return;
      }

      // Claim the file first (assigns it to the logged-in user)
      await api.post("/api/files/claim/", { upload_id: uploadedFileId });

      // Now sync the transcription type AFTER claiming
      // (the endpoint requires the file to be owned by the user)
      await api.patch(`/api/files/${uploadedFileId}/transcription-type/`, {
        transcription_type: transcriptionType,
      });

      if (transcriptionType === 'auto') {
        sessionStorage.setItem('auto_transcription_file_ids', JSON.stringify([uploadedFileId]));
      } else {
        sessionStorage.removeItem('auto_transcription_file_ids');
      }

      localStorage.removeItem('pendingUploadId');
      localStorage.removeItem('checkoutFileList');
      localStorage.removeItem('uploadExistingFiles');
      localStorage.removeItem('removedFileIds');

      const fileResponse = await api.get('/api/files/');
      const claimedFile = fileResponse.data.find(f => f.id === uploadedFileId);
      const fileItem = files[0];
      const computedCost = calculateTotalCost(fileItem.duration, transcriptionType).toFixed(2);
      const fileData = claimedFile
        ? {
            ...claimedFile,
            total_cost: computedCost,
            transcription_type: transcriptionType,
          }
        : {
            id: uploadedFileId,
            total_cost: computedCost,
            size: fileItem.duration,
            transcription_type: transcriptionType,
          };
      navigate("/dashboard/payment", { state: { fileData, fileIds: [uploadedFileId] } });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.error || error.message || "Failed to proceed to payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Your Audio Files</h1>
          <p className="text-lg text-gray-600">
            Professional transcription service • Fast turnaround • Accurate results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Upload & Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Options */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUpload className="text-mint-green" />
                Upload Your File
              </h2>

              <label className="flex items-center justify-center gap-3 bg-gradient-to-r from-mint-green to-teal-500 p-5 rounded-xl cursor-pointer hover:shadow-lg transition-shadow group mb-4">
                <FaCloudUploadAlt className="text-3xl text-white group-hover:scale-110 transition-transform" />
                <span className="text-white font-semibold text-lg">
                  {files.length > 0 ? 'Change File' : 'Select Audio / Video File'}
                </span>
                <input type="file" accept="audio/*,video/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Selected File</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => {
                      const fileStatus = uploadStatus[file.id] || { status: file.status || 'ready', progress: file.progress || 0 };
                      const isUploading = fileStatus.status === 'uploading';
                      const isCompleted = fileStatus.status === 'completed';
                      const isError = fileStatus.status === 'error';
                      
                      return (
                        <div key={file.id || index} className="flex flex-col p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-mint-green transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`flex-shrink-0 ${isUploading ? 'animate-spin' : ''}`}>
                                {isUploading ? (
                                  <FiUpload className="text-mint-green w-5 h-5" />
                                ) : isCompleted ? (
                                  <FiCheckIcon className="text-green-500 w-5 h-5" />
                                ) : isError ? (
                                  <FiX className="text-red-500 w-5 h-5" />
                                ) : (
                                  <FiMusic className="text-mint-green w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-sm text-gray-500">
                                  {Math.ceil(file.duration / 60)} min • {getSymbolFromCurrency(currency) || currency + ' '}{(((file.duration / 60) * (transcriptionType === 'auto' ? AUTO_PRICE_PER_MINUTE : PRICE_PER_MINUTE)) * exchangeRate).toFixed(2)} {currency}
                                </p>
                              </div>
                            </div>
                            {/* X button — cancels upload while in progress, removes file when done */}
                            <button
                              onClick={isUploading ? cancelUpload : () => removeFile(index)}
                              title={isUploading ? 'Cancel upload' : 'Remove file'}
                              className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                          {isUploading && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Uploading...</span>
                                <span className="text-xs font-medium text-mint-green">{fileStatus.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-mint-green to-teal-500 h-2 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${fileStatus.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {isCompleted && (
                            <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                              <FiCheckIcon className="w-4 h-4" />
                              Upload complete
                            </div>
                          )}
                          {isError && (
                            <div className="mt-2 text-xs text-red-600 font-medium">
                              Upload failed. Please try again.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {files.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
                  <FiFile className="mx-auto text-gray-400 w-12 h-12 mb-3" />
                  <p className="text-gray-500 font-medium">No file selected yet</p>
                  <p className="text-sm text-gray-400 mt-1">Supported: MP3, MP4, WAV, M4A and more</p>
                </div>
              )}
            </div>

            {/* Transcription Type */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiZap className="text-mint-green" />
                Choose Transcription Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Manual */}
                <button
                  type="button"
                  onClick={() => setTranscriptionType('manual')}
                  className={`flex flex-col items-start gap-2 p-5 rounded-xl border-2 transition-all text-left ${
                    transcriptionType === 'manual'
                      ? 'border-mint-green bg-mint-green bg-opacity-5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      transcriptionType === 'manual' ? 'bg-mint-green text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FiUser className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-gray-900">Human Transcription</span>
                    {transcriptionType === 'manual' && (
                      <span className="ml-auto px-2 py-0.5 bg-mint-green text-white text-xs rounded-full">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 pl-1">Reviewed by a professional transcriptionist. Highest accuracy.</p>
                  <p className="text-sm font-semibold text-mint-green pl-1">
                    {getSymbolFromCurrency(currency) || currency + ' '}{(PRICE_PER_MINUTE * exchangeRate).toFixed(2)} {currency}/min
                  </p>
                </button>

                {/* Auto */}
                <button
                  type="button"
                  onClick={() => setTranscriptionType('auto')}
                  className={`flex flex-col items-start gap-2 p-5 rounded-xl border-2 transition-all text-left ${
                    transcriptionType === 'auto'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      transcriptionType === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FiZap className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-gray-900">Auto Transcription</span>
                    {transcriptionType === 'auto' && (
                      <span className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 pl-1">Powered by Google Chirp AI (Speech-to-Text v2). Fast turnaround, great for clear audio.</p>
                  <p className="text-sm font-semibold text-blue-600 pl-1">
                    {getSymbolFromCurrency(currency) || currency + ' '}{(AUTO_PRICE_PER_MINUTE * exchangeRate).toFixed(2)} {currency}/min
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">86% cheaper</span>
                  </p>
                </button>
              </div>
              {transcriptionType === 'auto' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                  <FiZap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Google Chirp AI Transcription:</strong> Your audio will be automatically transcribed after payment using Google's latest Chirp model (Speech-to-Text v2). Transcripts are usually ready within minutes and will appear in your dashboard.
                  </span>
                </div>
              )}
            </div>

            {/* Transcription Options */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transcription Options</h2>
              
              {/* Accent Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Accent:</label>
                <select 
                  value={accent} 
                  onChange={(e) => setAccent(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                >
                  <option value="US">US English</option>
                  <option value="British">British English</option>
                  <option value="Australia">Australian English</option>
                  <option value="Canada">Canadian English</option>
                </select>
              </div>

              {/* Additional Features */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-mint-green transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={verbatim} 
                    onChange={() => setVerbatim(!verbatim)}
                    className="mt-1 w-5 h-5 text-mint-green border-gray-300 rounded focus:ring-mint-green"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Verbatim</p>
                    <p className="text-sm text-gray-500">Include all utterances, filler words, and false starts</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-mint-green transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={timestamp} 
                    onChange={() => setTimestamp(!timestamp)}
                    className="mt-1 w-5 h-5 text-mint-green border-gray-300 rounded focus:ring-mint-green"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Timestamp & Speaker IDs</p>
                    <p className="text-sm text-gray-500">Speakers tagged with timestamps at each turn</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-orange-200 bg-orange-50 hover:border-orange-400 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rushOrder} 
                    onChange={() => setRushOrder(!rushOrder)}
                    className="mt-1 w-5 h-5 text-orange-500 border-orange-300 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">Rush Order</p>
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-medium rounded">Premium</span>
                    </div>
                    <p className="text-sm text-gray-600">Guaranteed delivery within 24 hours</p>
                  </div>
                </label>
              </div>

              {/* Instructions */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions:</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Provide any additional details or special requirements..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-mint-green to-teal-500 rounded-xl shadow-lg p-6 text-white sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div className="flex items-center gap-2">
                    {transcriptionType === 'auto' ? <FiZap className="w-5 h-5" /> : <FiUser className="w-5 h-5" />}
                    <span>Method</span>
                  </div>
                  <span className="font-semibold text-sm">{transcriptionType === 'auto' ? 'Auto (Google AI)' : 'Human'}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div className="flex items-center gap-2">
                    <FiFile className="w-5 h-5" />
                    <span>Number of Files</span>
                  </div>
                  <span className="font-semibold text-lg">{files.length}</span>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5" />
                    <span>Total Duration</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {Math.ceil(totalDuration / 60)} min
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <FaCoins className="w-6 h-6" />
                    <span className="text-lg font-medium">Total Cost</span>
                  </div>
                  <span className="text-3xl font-bold">
                    {getSymbolFromCurrency(currency) || currency + ' '}{(totalCost * exchangeRate).toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              {/* Currency selector - always visible */}
              <div className="mb-4 pt-4 border-t border-white border-opacity-20">
                <label className="block text-sm font-medium mb-2">Currency:</label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => {
                      const newCurrency = e.target.value;
                      setCurrency(newCurrency);
                      // Save currency preference to backend
                      api.put('/api/update-profile/', { currency: newCurrency })
                        .then(() => console.log(`Currency saved: ${newCurrency}`))
                        .catch(error => console.error('Error saving currency preference:', error));
                    }}
                    className="flex-1 bg-white bg-opacity-20 border border-white border-opacity-30 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    {availableCurrencies.map(cur => (
                      <option key={cur} value={cur} className="text-gray-900">{cur}</option>
                    ))}
                  </select>
                </div>
                {exchangeRate !== 1 && currency !== 'USD' && (
                  <p className="text-xs text-white text-opacity-70 mt-1">
                    Rate: 1 USD = {exchangeRate.toFixed(4)} {currency}
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={files.length === 0 || uploading || loading}
                className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white transition-opacity duration-300 ${
                  files.length === 0 || uploading || loading
                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                    : 'bg-mint-green hover:bg-teal-600'
                }`}
              >
                {uploading ? `Uploading... ${uploadProgress}%` : loading ? 'Processing...' : 'Proceed to Payment'}
              </button>

              <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                {transcriptionType === 'auto' ? (
                  <>
                    <p className="text-sm text-white text-opacity-80 mb-2">&#9889; Google AI auto-transcription</p>
                    <p className="text-sm text-white text-opacity-80 mb-2">&#9889; Ready within minutes</p>
                    <p className="text-sm text-white text-opacity-80 mb-2">&#9889; Best for clear audio recordings</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white text-opacity-80 mb-2">&#10003; Professional transcription</p>
                    <p className="text-sm text-white text-opacity-80 mb-2">&#10003; 1&#8211;3 business days delivery</p>
                    <p className="text-sm text-white text-opacity-80 mb-2">&#10003; 99% accuracy guarantee</p>
                  </>
                )}
                <p className="text-xs text-center mt-4 text-white text-opacity-70">
                  Rate: {getSymbolFromCurrency(currency) || currency + ' '}{((transcriptionType === 'auto' ? AUTO_PRICE_PER_MINUTE : PRICE_PER_MINUTE) * exchangeRate).toFixed(2)}/{currency}/minute
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesUpload;
