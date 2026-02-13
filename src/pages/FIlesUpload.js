import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authContext";
import api from "../api/api";
import { 
  FaCloudUploadAlt, 
  FaLink
} from "react-icons/fa";
import { 
  FiMusic, 
  FiUpload, 
  FiCheck as FiCheckIcon,
  FiClock,
  FiDollarSign,
  FiFile,
  FiX
} from "react-icons/fi";

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
  const [urlFile, setUrlFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeTrialActive, setFreeTrialActive] = useState(false);

  const PRICE_PER_MINUTE = 0.5;
  const FREE_TRIAL_SECONDS = 5 * 60;

  useEffect(() => {
    const isFreeTrial = location.state?.freeTrial || sessionStorage.getItem('freeTrialActive') === 'true';
    setFreeTrialActive(!!isFreeTrial);
  }, [location.state]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard/upload', { state: freeTrialActive ? { freeTrial: true } : undefined });
    }
  }, [freeTrialActive, user, navigate]);

  const calculateTotalCost = (totalSeconds) => {
    const billableSeconds = freeTrialActive
      ? Math.max(0, totalSeconds - FREE_TRIAL_SECONDS)
      : totalSeconds;
    return (billableSeconds / 60) * PRICE_PER_MINUTE;
  };

  // Get audio duration
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
    });
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    const audioFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        const duration = await getAudioDuration(file);
        return {
          file,
          name: file.name,
          preview: URL.createObjectURL(file),
          duration,
        };
      })
    );

    setFiles([...files, ...audioFiles]);

    // Recalculate total duration and cost
    const allFiles = [...files, ...audioFiles];
    const total = allFiles.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(total);
    setTotalCost(calculateTotalCost(total));
  };

  // Remove file
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    const total = newFiles.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(total);
    setTotalCost(calculateTotalCost(total));
  };

  // Handle URL upload
  const handleUrlUpload = async () => {
    if (!urlFile) {
      alert("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch(urlFile);
      const blob = await response.blob();
      const file = new File([blob], "audio_from_url.mp3", { type: blob.type });
      const duration = await getAudioDuration(file);
      
      const newFile = {
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
        duration
      };

      setFiles([...files, newFile]);

      const total = [...files, newFile].reduce((acc, f) => acc + f.duration, 0);
      setTotalDuration(total);
      setTotalCost(calculateTotalCost(total));
      setUrlFile("");
      alert("File added from URL successfully.");
    } catch (error) {
      console.error("Error uploading file from URL:", error);
      alert("Failed to add file from URL.");
    }
  };

  const calculateTotal = () => {
    return totalCost.toFixed(2);
  };

  useEffect(() => {
    const total = files.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(total);
    setTotalCost(calculateTotalCost(total));
  }, [freeTrialActive, files, calculateTotalCost]);

  // Handle checkout - Upload anonymously and proceed
  const handleCheckout = async () => {
    if (files.length === 0) {
      alert("Please upload at least one file before proceeding.");
      return;
    }

    setLoading(true);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("name", file.name);
      formData.append("size", totalDuration.toString());
      formData.append("total_cost", Math.round(totalCost));
      formData.append("verbatim", verbatim ? "Yes" : "No");
      formData.append("rush_order", rushOrder ? "Yes" : "No");
      formData.append("timestamp", timestamp ? "Yes" : "No");
      formData.append("spelling", accent);
      formData.append("instruction", instructions);

      // Upload anonymously (no authentication required)
      const response = await api.post("/api/files/upload/anonymous/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      
      // Store the upload ID in localStorage
      localStorage.setItem('pendingUploadId', data.id.toString());

      if (freeTrialActive) {
        sessionStorage.removeItem('freeTrialActive');
      }

      // Check if user is authenticated
      if (!user) {
        // Not authenticated - redirect to register
        navigate('/register', { state: { from: '/upload', message: 'Create an account to complete your upload' } });
      } else {
        // User is authenticated - claim the upload and go to payment
        await api.post("/api/files/claim/", { upload_id: data.id });
        localStorage.removeItem('pendingUploadId'); // Clear after claiming
        navigate("/dashboard/payment", { state: { fileData: data } });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
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
                Upload Your Files
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <label className="flex items-center gap-3 bg-gradient-to-r from-mint-green to-teal-500 p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow group">
                  <FaCloudUploadAlt className="text-2xl text-white group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium">Upload from Computer</span>
                  <input type="file" multiple accept="audio/*" onChange={handleFileUpload} className="hidden" />
                </label>
                
                <button 
                  onClick={() => document.getElementById('url-input').focus()}
                  className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  <FaLink className="text-2xl text-mint-green" /> 
                  <span className="text-gray-700 font-medium">Upload from URL</span>
                </button>
              </div>

              {/* URL Input */}
              <div className="flex gap-2 mb-4">
                <input
                  id="url-input"
                  type="text"
                  placeholder="Enter audio file URL (e.g., https://...)"
                  value={urlFile}
                  onChange={(e) => setUrlFile(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                />
                <button
                  onClick={handleUrlUpload}
                  disabled={!urlFile}
                  className="px-6 py-3 bg-mint-green text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Selected Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiMusic className="text-mint-green w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {Math.ceil(file.duration / 60)} min • ${((file.duration / 60) * PRICE_PER_MINUTE).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {files.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FiFile className="mx-auto text-gray-400 w-12 h-12 mb-3" />
                  <p className="text-gray-500">No files uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Upload files to get started</p>
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
                    <FiDollarSign className="w-6 h-6" />
                    <span className="text-lg font-medium">Total Cost</span>
                  </div>
                  <span className="text-3xl font-bold">
                    ${calculateTotal()}
                  </span>
                </div>
              </div>

              {freeTrialActive && (
                <div className="mb-4 rounded-lg bg-white/15 border border-white/30 px-4 py-3 text-sm text-white">
                  <p className="font-semibold">Free Trial Applied</p>
                  <p className="text-white/90">
                    The first 5 minutes of audio are free. Any time beyond 5 minutes is billed at ${PRICE_PER_MINUTE}/min.
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={files.length === 0 || loading}
                className="w-full bg-white text-mint-green py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-mint-green"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {user ? 'Proceed to Payment' : 'Next'}
                    <FiCheckIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                <p className="text-sm text-white text-opacity-80 mb-2">
                  ✓ Professional transcription
                </p>
                <p className="text-sm text-white text-opacity-80 mb-2">
                  ✓ 1-3 business days delivery
                </p>
                <p className="text-sm text-white text-opacity-80 mb-2">
                  ✓ 99% accuracy guarantee
                </p>
                <p className="text-xs text-center mt-4 text-white text-opacity-70">
                  Rate: ${PRICE_PER_MINUTE}/minute
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
