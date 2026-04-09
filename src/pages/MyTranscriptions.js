import React, { useEffect, useState } from "react";
import api from "../api/api";
import Alert from "../components/ui/Alert";
import { FiFileText, FiDownload, FiEye, FiExternalLink, FiClock, FiLoader, FiRefreshCw } from "react-icons/fi";

const MyTranscriptions = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [activeTranscript, setActiveTranscript] = useState(null);
  const [retrying, setRetrying] = useState(null);

  const fetchTranscriptions = async () => {
    try {
      const response = await api.get("/api/transcriptions/");
      setFiles(response.data || []);
    } catch (error) {
      setMessage("Failed to load transcriptions");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
    
    // Poll for updates every 10 seconds if there are processing files
    const interval = setInterval(() => {
      fetchTranscriptions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Retry auto-transcription for a file
  const handleRetryTranscription = async (fileId) => {
    setRetrying(fileId);
    try {
      await api.post(`/api/files/${fileId}/auto-transcribe/`);
      setMessage("Auto-transcription started! It may take a few minutes...");
      setMessageType("success");
      fetchTranscriptions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to start transcription");
      setMessageType("error");
    } finally {
      setRetrying(null);
    }
  };

  const handleView = async (fileId) => {
    try {
      const response = await api.get(`/api/transcriptions/${fileId}/`);
      setActiveTranscript(response.data);
    } catch (error) {
      setMessage("Transcript not available");
      setMessageType("error");
    }
  };

  const handleClose = () => setActiveTranscript(null);

  const downloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const downloadAsText = (file) => {
    const text = file.transcript?.text || "";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInEditor = async (file) => {
    try {
      let transcriptText = file?.transcript?.text;
      console.log("[openInEditor] file:", file.id, "transcript from file:", transcriptText?.length || 0);
      
      if (!transcriptText) {
        const response = await api.get(`/api/transcriptions/${file.id}/`);
        console.log("[openInEditor] API response:", response.data);
        transcriptText = response.data?.text || "";
      }
      
      console.log("[openInEditor] Final transcript length:", transcriptText?.length || 0);

      const payload = {
        text: transcriptText,
        fileName: file.name,
        fileId: file.id,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem("scriptorfi_editor_payload", JSON.stringify(payload));
      console.log("[openInEditor] Saved to localStorage, opening /editor");

      // Don't use noopener - it can prevent localStorage access in the new window
      window.open("/editor", "_blank");
    } catch (error) {
      console.error("[openInEditor] Error:", error);
      setMessage("Failed to open transcript in editor");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Alert message={message} messageType={messageType} onClear={() => setMessage(null)} />

      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Transcriptions</h1>
          <p className="text-gray-600">View and download your completed transcripts</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transcriptions...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No transcriptions yet.</p>
            <p className="text-sm text-gray-500 mt-1">Upload a file and pay to start transcription.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {files.map((file) => {
              const isCompleted = file.status === "Completed";
              const isProcessing = file.status === "Processing";
              const isPending = file.status === "Pending";
              
              return (
              <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate" title={file.name}>{file.name}</h3>
                      {/* Status Badge */}
                      {isProcessing && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          <FiLoader className="animate-spin w-3 h-3" /> Processing
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          <FiClock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.ceil(Number(file.size || 0) / 60)} minutes • {file.spelling} English
                      {file.transcription_type === 'auto' && <span className="ml-2 text-blue-600">• Auto (AI)</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-2">
                    <button
                      onClick={() => handleView(file.id)}
                      disabled={!isCompleted}
                      className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${
                        isCompleted 
                          ? "bg-mint-green text-white hover:bg-teal-600" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FiEye /> View
                    </button>
                    <button
                      onClick={() => openInEditor(file)}
                      disabled={!isCompleted}
                      className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition ${
                        isCompleted 
                          ? "border-teal-600 text-teal-700 hover:bg-teal-50" 
                          : "border-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FiExternalLink /> Editor
                    </button>
                  </div>
                </div>

                {/* Show processing message or download options */}
                <div className="mt-4">
                  {isProcessing && (
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                      <FiLoader className="animate-spin" />
                      Your transcript is being generated. This may take a few minutes...
                    </p>
                  )}
                  {isPending && file.transcription_type === 'auto' && file.payment_status === 'Paid' && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-yellow-600 flex items-center gap-2">
                        <FiClock />
                        Auto-transcription not started yet.
                      </p>
                      <button
                        onClick={() => handleRetryTranscription(file.id)}
                        disabled={retrying === file.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                      >
                        {retrying === file.id ? (
                          <><FiLoader className="animate-spin" /> Starting...</>
                        ) : (
                          <><FiRefreshCw /> Start Transcription</>
                        )}
                      </button>
                    </div>
                  )}
                  {isPending && !(file.transcription_type === 'auto' && file.payment_status === 'Paid') && (
                    <p className="text-sm text-yellow-600 flex items-center gap-2">
                      <FiClock />
                      Waiting for transcription to start...
                    </p>
                  )}
                  {isCompleted && (
                    <div className="flex items-center gap-3">
                      {file.transcript?.file ? (
                        <button
                          onClick={() => downloadFile(file.transcript.file, `${file.name.replace(/\.[^.]+$/, "")}_transcript`)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <FiDownload /> Download Transcript
                        </button>
                      ) : file.transcript?.text ? (
                        <button
                          onClick={() => downloadAsText(file)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <FiDownload /> Download as .txt
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500">Transcript pending...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {activeTranscript && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4">
              {activeTranscript.text ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{activeTranscript.text}</pre>
              ) : (
                <p className="text-gray-600">No transcript text available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTranscriptions;
