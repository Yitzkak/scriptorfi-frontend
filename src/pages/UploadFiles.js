import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import api from "../api/api.js";
import Alert from "../components/ui/Alert.js";
import { 
  FiUpload, 
  FiFile, 
  FiClock, 
  FiDollarSign, 
  FiX,
  FiCheck,
  FiMusic,
  FiLink,
  FiAlertCircle,
  FiInfo
} from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";

const UploadFiles = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0); // Duration in seconds
  const [totalCost, setTotalCost] = useState(0); // Cost in USD
  const [urlFile, setUrlFile] = useState(""); // URL input for file upload
  const [options, setOptions] = useState({
    spellingType: "US",
    instructions: "",
  });

  const [checkboxValues, setCheckboxValues] = useState({
    verbatim: false,
    rushOrder: false,
    timestamp: true,
  });
  const [existingFiles, setExistingFiles] = useState([]);
  const UPLOAD_LIST_STORAGE_KEY = "uploadExistingFiles";
  const CHECKOUT_LIST_STORAGE_KEY = "checkoutFileList";
  const REMOVED_LIST_STORAGE_KEY = "removedFileIds";
  const [claiming, setClaiming] = useState(false);
  const [freeTrialActive, setFreeTrialActive] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const PRICE_PER_MINUTE = 0.5; // Price per minute of transcription
  const FREE_TRIAL_SECONDS = 5 * 60;
  const [showPendingUploadAlert, setShowPendingUploadAlert] = useState(false);

  // Check for pending upload data or existing files from payment page/storage
  useEffect(() => {
    const isFreeTrial = location.state?.freeTrial || sessionStorage.getItem('freeTrialActive') === 'true';
    setFreeTrialActive(!!isFreeTrial);

    const removedRaw = localStorage.getItem(REMOVED_LIST_STORAGE_KEY);
    const removed = removedRaw ? JSON.parse(removedRaw) : [];
    const removedIds = Array.isArray(removed) ? removed : [];

    if (location.state?.existingFiles) {
      const filtered = location.state.existingFiles.filter((f) => !removedIds.includes(f.id));
      setExistingFiles(filtered);
      localStorage.setItem(UPLOAD_LIST_STORAGE_KEY, JSON.stringify(filtered));
    } else {
      const stored = localStorage.getItem(UPLOAD_LIST_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((f) => !removedIds.includes(f.id));
            setExistingFiles(filtered);
            localStorage.setItem(UPLOAD_LIST_STORAGE_KEY, JSON.stringify(filtered));
          } else {
            setExistingFiles([]);
          }
        } catch (error) {
          console.error("Error parsing stored upload files:", error);
          setExistingFiles([]);
        }
      } else {
        setExistingFiles([]);
      }
    }
    const pendingUpload = localStorage.getItem('pendingUpload');
    
    if (pendingUpload && location.state?.hasPendingUpload) {
      try {
        const uploadData = JSON.parse(pendingUpload);
        
        // Restore options
        setOptions({
          spellingType: uploadData.accent || "US",
          instructions: uploadData.instructions || "",
        });
        
        setCheckboxValues({
          verbatim: uploadData.verbatim || false,
          rushOrder: uploadData.rushOrder || false,
          timestamp: uploadData.timestamp !== undefined ? uploadData.timestamp : true,
        });
        
        // Show alert to re-upload file
        setShowPendingUploadAlert(true);
        setMessage(`Welcome! Please re-upload your file (${uploadData.fileName}) to continue to checkout.`);
        setMessageType("info");
        
      } catch (error) {
        console.error('Error parsing pending upload:', error);
      }
    }
  }, [location]);

  useEffect(() => {
    if (existingFiles.length === 0) return;
    let isMounted = true;

    const claimFiles = async () => {
      setClaiming(true);
      try {
        await api.post("/api/files/claim/", {
          upload_ids: existingFiles.map((f) => f.id),
        });
      } catch (error) {
        console.error("Error claiming files:", error);
      } finally {
        if (isMounted) {
          setClaiming(false);
        }
      }
    };

    claimFiles();

    return () => {
      isMounted = false;
    };
  }, [existingFiles]);

  const calculateTotalCost = (totalSeconds) => {
    if (freeTrialActive) return 0;
    return (totalSeconds / 60) * PRICE_PER_MINUTE;
  };

  const calculatePerFileCosts = (fileItems) => {
    let remainingFree = freeTrialActive ? FREE_TRIAL_SECONDS : 0;
    return fileItems.map((fileItem) => {
      const duration = fileItem.duration;
      let billable = duration;
      if (remainingFree > 0) {
        const freeSeconds = Math.min(remainingFree, duration);
        billable = duration - freeSeconds;
        remainingFree -= freeSeconds;
      }
      return (billable / 60) * PRICE_PER_MINUTE;
    });
  };

  // Set the values for the checkboxes
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxValues((prevValues) => ({
      ...prevValues,
      [name]: checked,
    }));
  };

  // Function to get the duration of an audio file
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => {
            resolve(audio.duration); // duration in seconds
        };
    });
  };

  // Create an audio object
  const onDrop = async (acceptedFiles) => {
    const audioFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const duration = await getAudioDuration(file);
        return {
          file,
          name: file.name,
          preview: URL.createObjectURL(file),
          duration, // Add duration in seconds
        };
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...audioFiles]);

    // Recalculate total duration and cost
    const allFiles = [...files, ...audioFiles];
    const totalDuration = allFiles.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(totalDuration);
    setTotalCost(calculateTotalCost(totalDuration));
  };
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Function to handle URL file upload
  const handleUrlUpload = async () => {
    if (!urlFile) {
      alert("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch(urlFile); // Fetch the audio file from the URL
      const blob = await response.blob();
      const file = new File([blob], "audio_from_url.mp3", { type: blob.type });
      const duration = await getAudioDuration(file);
      const newFile = { file, name: file.name, preview: URL.createObjectURL(file), duration };

      setFiles((prevFiles) => [...prevFiles, newFile]);

      const totalDuration = files.reduce((acc, file) => acc + file.duration, 0) + duration;
      setTotalDuration(totalDuration);
      setTotalCost(calculateTotalCost(totalDuration));

      setUrlFile(""); // Reset URL input
      alert("File added from URL successfully.");
    } catch (error) {
      console.error("Error uploading file from URL:", error);
      alert("Failed to add file from URL.");
    }
  };

  //Handle select box selection of options
  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
  };

  // Handle audio upload
  const handleUpload = async () => {
    console.log("Upload button clicked!");

    if (freeTrialActive && files.length > 1) {
      alert("Free trial allows one file up to 5 minutes.");
      return;
    }

    if (files.length === 0 && existingFiles.length === 0) {
      alert("Select a file to upload");
      return;
    }

    console.log("Files to upload:", files);

    const formattedValues = Object.fromEntries(
      Object.entries(checkboxValues).map(([key, value]) => [key, value ? "Yes" : "No"])
    );

    console.log("Sending upload request...");

    try {
      let uploadedFiles = [];
      if (files.length > 0) {
        const perFileCosts = calculatePerFileCosts(files);
        const uploadPromises = files.map((fileItem, index) => {
          const formData = new FormData();
          formData.append("file", fileItem.file);
          formData.append("name", fileItem.name);
          formData.append("size", fileItem.duration.toString());
          formData.append("total_cost", Math.round(perFileCosts[index]));
          if (freeTrialActive) {
            formData.append("free_trial", "true");
          }
          formData.append("verbatim", formattedValues.verbatim);
          formData.append("rush_order", formattedValues.rushOrder);
          formData.append("timestamp", formattedValues.timestamp);
          formData.append("spelling", options.spellingType);
          formData.append("instruction", options.instructions);
          return api.post("/api/files/upload/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        });

        const responses = await Promise.all(uploadPromises);
        uploadedFiles = responses.map((res) => res.data);
      }

      if (freeTrialActive) {
        sessionStorage.removeItem('freeTrialActive');
        setFreeTrialActive(false);
      }
      const combinedFiles = [...existingFiles, ...uploadedFiles];
      console.log("Upload successful:", combinedFiles);

      // Clear pending upload data from localStorage
      localStorage.removeItem('pendingUpload');

      setMessage("File Uploaded Successfully.");
      setMessageType("success");
      setFiles([]);
      setTotalDuration(0);
      setTotalCost(0);
      setOptions({
        spellingType: "US",
        instructions: "",
      });
      localStorage.setItem(CHECKOUT_LIST_STORAGE_KEY, JSON.stringify(combinedFiles));
      localStorage.setItem(UPLOAD_LIST_STORAGE_KEY, JSON.stringify(combinedFiles));
      navigate("/dashboard/payment", { state: { fileDataList: combinedFiles } });
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.error || "Failed to upload file.";
      if (errorMessage === "Free trial already used") {
        sessionStorage.removeItem('freeTrialActive');
        setFreeTrialActive(false);
      }
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  // Function to remove a file
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Recalculate total duration and cost
    const totalDuration = newFiles.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(totalDuration);
    setTotalCost(calculateTotalCost(totalDuration));
  };

  useEffect(() => {
    const totalDuration = files.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(totalDuration);
    setTotalCost(calculateTotalCost(totalDuration));
  }, [freeTrialActive, files, calculateTotalCost]);

  const removeExistingFile = async (fileId) => {
    const removedRaw = localStorage.getItem(REMOVED_LIST_STORAGE_KEY);
    const removed = removedRaw ? JSON.parse(removedRaw) : [];
    const updatedRemoved = Array.isArray(removed) ? [...new Set([...removed, fileId])] : [fileId];
    localStorage.setItem(REMOVED_LIST_STORAGE_KEY, JSON.stringify(updatedRemoved));

    try {
      await api.delete(`/api/files/${fileId}/delete/`);
      const updated = existingFiles.filter((file) => file.id !== fileId);
      setExistingFiles(updated);
      localStorage.setItem(UPLOAD_LIST_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(CHECKOUT_LIST_STORAGE_KEY, JSON.stringify(updated));
      setMessage("File removed from order.");
      setMessageType("success");
    } catch (error) {
      console.error("Error removing file:", error);
      setMessage("Failed to remove file.");
      setMessageType("error");
    }
  };

  const existingTotalCost = existingFiles.reduce((sum, file) => sum + Number(file.total_cost || 0), 0);
  const existingTotalDuration = existingFiles.reduce((sum, file) => sum + Number(file.size || 0), 0);
  const combinedTotalCost = existingTotalCost + totalCost;
  const combinedTotalDuration = existingTotalDuration + totalDuration;
  const totalFileCount = existingFiles.length + files.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert
        message={message}
        messageType={messageType}
        onClear={() => setMessage(null)}
      />

      {freeTrialActive && (
        <div className="bg-teal-50 border-l-4 border-teal-500 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-teal-800">
              Free trial active: first 5 minutes are transcribed. Any time beyond 5 minutes will not be transcribed or charged.
            </p>
          </div>
        </div>
      )}
      
      {/* Pending Upload Alert */}
      {showPendingUploadAlert && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start">
              <FiInfo className="text-blue-400 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-700">
                  Your previous upload settings have been restored. Please re-upload your file to proceed to checkout.
                </p>
                <button
                  onClick={() => {
                    setShowPendingUploadAlert(false);
                    setMessage(null);
                  }}
                  className="text-sm text-blue-700 underline hover:text-blue-900 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Files</h1>
              <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                Estimated Delivery: 1-3 business days
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-mint-green">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/** Left Side - Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/** Drag and Drop Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUpload className="text-mint-green" />
                Upload Audio Files
              </h2>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50 hover:bg-gray-100 hover:border-mint-green transition-all duration-300 cursor-pointer group"
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-mint-green bg-opacity-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiMusic className="text-mint-green w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag & Drop Files Here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse from your computer
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported formats: MP3, WAV, M4A, AAC
                  </p>
                </div>
              </div>
            </div>

            {/** Upload from URL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiLink className="text-mint-green" />
                Upload from URL
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter audio file URL"
                  value={urlFile}
                  onChange={(e) => setUrlFile(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                />
                <button
                  onClick={handleUrlUpload}
                  className="px-6 py-3 bg-mint-green text-white rounded-lg hover:bg-teal-600 transition-colors duration-200 font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  <FiUpload className="w-4 h-4" />
                  Upload
                </button>
              </div>
            </div>

            {/** Selected Files List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineDocumentText className="text-mint-green" />
                Selected Files ({totalFileCount})
              </h2>
              {files.length === 0 && existingFiles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiFile className="text-gray-400 w-8 h-8" />
                  </div>
                  <p className="text-gray-500">No files selected yet</p>
                  <p className="text-sm text-gray-400 mt-1">Upload files to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {existingFiles.map((file) => (
                    <div key={`existing-${file.id}`} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FiMusic className="text-blue-600 w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {Math.ceil(parseFloat(file.size) / 60)} min • ${Number(file.total_cost || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                          Already uploaded
                        </span>
                        <button
                          onClick={() => removeExistingFile(file.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove file"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-mint-green bg-opacity-10 p-2 rounded-lg">
                          <FiMusic className="text-mint-green w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {Math.ceil(file.duration / 60)} min • ${((file.duration / 60) * PRICE_PER_MINUTE).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/** Additional Instructions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block">
                <span className="text-lg font-semibold text-gray-900 mb-2 block">Additional Instructions</span>
                <textarea
                  name="instructions"
                  rows="6"
                  value={options.instructions}
                  onChange={handleOptionChange}
                  placeholder="Add any special instructions for your transcription..."
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent resize-none"
                ></textarea>
              </label>
            </div>
          </div>

          {/** Right Side - Options & Summary */}
          <div className="lg:col-span-1 space-y-6">
            
            {/** Transcription Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Transcription Options</h2>
              
              <div className="space-y-6">
                {/** Accent Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent
                  </label>
                  <select
                    name="spellingType"
                    value={options.spellingType}
                    onChange={handleOptionChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent bg-white"
                  >
                    <option value="US">US English</option>
                    <option value="British">British English</option>
                    <option value="Australia">Australian English</option>
                    <option value="Canada">Canadian English</option>
                  </select>
                </div>

                {/** Verbatim Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-mint-green transition-colors cursor-pointer">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      id="verbatim"
                      name="verbatim"
                      checked={checkboxValues.verbatim}
                      onChange={handleCheckboxChange}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded checked:bg-mint-green checked:border-mint-green focus:outline-none focus:ring-2 focus:ring-mint-green focus:ring-offset-2 cursor-pointer transition duration-200"
                    />
                    <FiCheck className="absolute w-3 h-3 text-white top-1 left-1 hidden peer-checked:block pointer-events-none" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Verbatim</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Include all utterances, filler words, false starts, and stutters
                    </p>
                  </div>
                </label>

                {/** Timestamp Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-mint-green transition-colors cursor-pointer">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      id="timestamp"
                      name="timestamp"
                      checked={checkboxValues.timestamp}
                      onChange={handleCheckboxChange}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded checked:bg-mint-green checked:border-mint-green focus:outline-none focus:ring-2 focus:ring-mint-green focus:ring-offset-2 cursor-pointer transition duration-200"
                    />
                    <FiCheck className="absolute w-3 h-3 text-white top-1 left-1 hidden peer-checked:block pointer-events-none" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Timestamp & Speaker IDs</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Speakers tagged with timestamps at each turn
                    </p>
                  </div>
                </label>

                {/** Rush Order Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-orange-200 bg-orange-50 hover:border-orange-400 transition-colors cursor-pointer">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      id="rushOrder"
                      name="rushOrder"
                      checked={checkboxValues.rushOrder}
                      onChange={handleCheckboxChange}
                      className="peer appearance-none w-5 h-5 border-2 border-orange-300 rounded checked:bg-orange-500 checked:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer transition duration-200"
                    />
                    <FiCheck className="absolute w-3 h-3 text-white top-1 left-1 hidden peer-checked:block pointer-events-none" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">Rush Order</p>
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-medium rounded">Premium</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Guaranteed delivery within 24 hours
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/** Order Summary */}
            <div className="bg-gradient-to-br from-mint-green to-teal-500 rounded-xl shadow-lg p-6 text-white sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div className="flex items-center gap-2">
                    <FiFile className="w-5 h-5" />
                    <span>Number of Files</span>
                  </div>
                  <span className="font-semibold">{totalFileCount}</span>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5" />
                    <span>Total Duration</span>
                  </div>
                  <span className="font-semibold">
                    {Math.ceil(combinedTotalDuration / 60)} min
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-6 h-6" />
                    <span className="text-lg font-medium">Total Cost</span>
                  </div>
                  <span className="text-3xl font-bold">
                    ${combinedTotalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {totalFileCount > 0 ? (
                <button
                  onClick={handleUpload}
                  className="w-full bg-white text-mint-green py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  Proceed to Payment
                  <FiCheck className="w-5 h-5" />
                </button>
              ) : (
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <FiAlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">Upload files to continue</p>
                </div>
              )}
              
              <p className="text-xs text-center mt-4 text-white text-opacity-80">
                Rate: ${PRICE_PER_MINUTE}/minute
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
