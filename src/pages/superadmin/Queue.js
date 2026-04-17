import React, { useEffect, useMemo, useState, useRef } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";
import { FiFileText, FiUploadCloud, FiX, FiEye, FiPlay, FiPause, FiDollarSign, FiTrash2 } from "react-icons/fi";

const statusOptions = ["Pending", "In Review", "Completed"];

const Queue = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [viewingTranscript, setViewingTranscript] = useState(null);
  const [playingFileId, setPlayingFileId] = useState(null);
  const audioRef = useRef(null);

  // Audio player handlers
  const handlePlayPause = (file) => {
    if (!file.file) {
      setError("Audio file not available.");
      return;
    }
    
    if (playingFileId === file.id) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingFileId(null);
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Create new audio and play
      audioRef.current = new Audio(file.file);
      audioRef.current.onended = () => setPlayingFileId(null);
      audioRef.current.onerror = () => {
        setError("Failed to play audio file.");
        setPlayingFileId(null);
      };
      audioRef.current.play().catch(err => {
        setError("Failed to play audio file.");
        setPlayingFileId(null);
      });
      setPlayingFileId(file.id);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/superadmin/files/");
      setFiles(response.data || []);
    } catch (err) {
      setError("Failed to load upload queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const totals = useMemo(() => {
    const pending = files.filter((f) => f.status === "Pending").length;
    const review = files.filter((f) => f.status === "In Review").length;
    const completed = files.filter((f) => f.status === "Completed").length;
    return { pending, review, completed };
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesStatus = statusFilter === "All" || file.status === statusFilter;
      const haystack = `${file.name} ${file.user?.email || ""} ${file.user?.username || ""}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [files, search, statusFilter]);

  const updateStatus = async (fileId, status) => {
    try {
      setUpdating(true);
      await api.post(`/api/superadmin/files/${fileId}/status/`, { status });
      setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, status } : file)));
    } catch (err) {
      setError("Failed to update file status.");
    } finally {
      setUpdating(false);
    }
  };

  const markAsPaid = async (fileId) => {
    try {
      setUpdating(true);
      await api.post(`/api/superadmin/files/${fileId}/mark-paid/`);
      setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, payment_status: 'Paid' } : file)));
      setError("");
    } catch (err) {
      setError("Failed to mark file as paid.");
    } finally {
      setUpdating(false);
    }
  };

  const deleteFile = async (fileId, fileName) => {
    const confirmed = window.confirm(`Delete ${fileName}? This will remove the audio file and any linked transcript.`);
    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);
      await api.delete(`/api/superadmin/files/${fileId}/delete/`);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
      if (viewingTranscript?.id === fileId) {
        setViewingTranscript(null);
      }
      if (playingFileId === fileId && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setPlayingFileId(null);
      }
      setError("");
    } catch (err) {
      const detail = err.response?.data?.error || "Failed to delete file.";
      setError(detail);
    } finally {
      setUpdating(false);
    }
  };

  const handleTranscriptUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    if (transcriptText) formData.append("transcript_text", transcriptText);
    if (transcriptFile) formData.append("transcript_file", transcriptFile);

    try {
      setUpdating(true);
      await api.post(`/api/superadmin/files/${selectedFile.id}/transcript/`, formData, {
        headers: { "Content-Type": undefined },
      });
      await fetchFiles();
      setSelectedFile(null);
      setTranscriptText("");
      setTranscriptFile(null);
      setError("");
    } catch (err) {
      const detail = err.response?.data?.error || err.message || "Unknown error";
      setError(`Failed to upload transcript: ${detail}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Upload Queue" onSearch={setSearch} />

      <div className="px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            { label: "Pending", value: totals.pending },
            { label: "In Review", value: totals.review },
            { label: "Completed", value: totals.completed },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Filter status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="All">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchFiles}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Refresh queue
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-left">Audio</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Duration (s)</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Transcript</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                      No files found.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-xs text-gray-500">{file.date_uploaded}</div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handlePlayPause(file)}
                          disabled={!file.file}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
                            file.file 
                              ? playingFileId === file.id
                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          title={file.file ? (playingFileId === file.id ? "Pause" : "Play Audio") : "Audio not available"}
                        >
                          {playingFileId === file.id ? <FiPause size={12} /> : <FiPlay size={12} />}
                          {playingFileId === file.id ? "Pause" : "Play"}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {file.user?.email || file.user?.username || "Anonymous"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">{file.size}</td>
                      <td className="px-4 py-4 text-gray-700">${file.total_cost}</td>
                      <td className="px-4 py-4">
                        {file.payment_status === 'Paid' ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            Paid
                          </span>
                        ) : file.payment_status === 'Under Review' ? (
                          <div className="flex flex-col gap-1">
                            <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                              Under Review
                            </span>
                            <button
                              disabled={updating}
                              onClick={() => markAsPaid(file.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                            >
                              <FiDollarSign size={12} />
                              Confirm Payment
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={updating}
                            onClick={() => markAsPaid(file.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50"
                          >
                            <FiDollarSign size={12} />
                            Mark Paid
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {file.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {file.transcript ? (
                          <button
                            onClick={() => setViewingTranscript(file)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100"
                          >
                            <FiEye size={12} /> View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={updating}
                            onClick={() => updateStatus(file.id, "In Review")}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                          >
                            In Review
                          </button>
                          <button
                            disabled={updating}
                            onClick={() => updateStatus(file.id, "Completed")}
                            className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              setTranscriptText(file.transcript?.text || "");
                              setTranscriptFile(null);
                              setSelectedFile(file);
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            {file.transcript ? "Edit transcript" : "Upload transcript"}
                          </button>
                          <button
                            disabled={updating}
                            onClick={() => deleteFile(file.id, file.name)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
                          >
                            <FiTrash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedFile(null)}
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Upload transcript</h2>
            <p className="text-sm text-gray-500 mt-1">{selectedFile.name}</p>

            <form onSubmit={handleTranscriptUpload} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transcript text</label>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  rows={6}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Or upload a file</label>
                <input
                  type="file"
                  onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiFileText />
                  Transcript will be linked to the file.
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition disabled:opacity-60"
                >
                  <FiUploadCloud />
                  {updating ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewingTranscript && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col relative">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Transcript — {viewingTranscript.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{viewingTranscript.user?.email || "Anonymous"}</p>
              </div>
              <button onClick={() => setViewingTranscript(null)} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {viewingTranscript.transcript?.text ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{viewingTranscript.transcript.text}</pre>
              ) : viewingTranscript.transcript?.file ? (
                <a
                  href={viewingTranscript.transcript.file}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 underline text-sm"
                >
                  Download uploaded file
                </a>
              ) : (
                <p className="text-gray-500 text-sm">No transcript content saved.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Queue;
