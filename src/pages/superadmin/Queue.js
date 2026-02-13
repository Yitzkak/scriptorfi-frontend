import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";
import { FiFileText, FiUploadCloud, FiX } from "react-icons/fi";

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

  const handleTranscriptUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    if (transcriptText) formData.append("transcript_text", transcriptText);
    if (transcriptFile) formData.append("transcript_file", transcriptFile);

    try {
      setUpdating(true);
      await api.post(`/api/superadmin/files/${selectedFile.id}/transcript/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchFiles();
      setSelectedFile(null);
      setTranscriptText("");
      setTranscriptFile(null);
    } catch (err) {
      setError("Failed to upload transcript.");
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
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Duration (s)</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
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
                      <td className="px-4 py-4 text-gray-700">
                        {file.user?.email || file.user?.username || "Anonymous"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">{file.size}</td>
                      <td className="px-4 py-4 text-gray-700">${file.total_cost}</td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {file.status}
                        </span>
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
                            onClick={() => setSelectedFile(file)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Upload transcript
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
    </div>
  );
};

export default Queue;
