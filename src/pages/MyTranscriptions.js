import React, { useEffect, useState } from "react";
import api from "../api/api";
import Alert from "../components/ui/Alert";
import { FiFileText, FiDownload, FiEye, FiExternalLink } from "react-icons/fi";

const MyTranscriptions = () => {
  const editorUrl = process.env.REACT_APP_EDITOR_URL || "http://localhost:3001";
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [activeTranscript, setActiveTranscript] = useState(null);

  useEffect(() => {
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

    fetchTranscriptions();
  }, []);

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

  const openInEditor = async (file) => {
    try {
      let transcriptText = file?.transcript?.text;
      if (!transcriptText) {
        const response = await api.get(`/api/transcriptions/${file.id}/`);
        transcriptText = response.data?.text || "";
      }

      localStorage.setItem(
        "scriptorfi_editor_payload",
        JSON.stringify({
          text: transcriptText,
          fileName: file.name,
          fileId: file.id,
          createdAt: new Date().toISOString(),
        })
      );

      window.open(`${editorUrl}#/editor`, "_blank", "noopener,noreferrer");
    } catch (error) {
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
            <p className="text-gray-600">No completed transcriptions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {files.map((file) => (
              <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate" title={file.name}>{file.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.ceil(Number(file.size || 0) / 60)} minutes • {file.spelling} English
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleView(file.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-mint-green text-white rounded-lg hover:bg-teal-600 transition"
                    >
                      <FiEye /> View
                    </button>
                    <button
                      onClick={() => openInEditor(file)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition"
                    >
                      <FiExternalLink /> Preview in Editor
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {file.transcript?.file && (
                    <a
                      href={file.transcript.file}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      download
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiDownload /> Download Transcript
                    </a>
                  )}
                </div>
              </div>
            ))}
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
