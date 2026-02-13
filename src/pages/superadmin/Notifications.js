import React, { useEffect, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";

const Notifications = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get("/api/superadmin/files/");
        setFiles(response.data || []);
      } catch (err) {
        setError("Failed to load notifications.");
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Notifications" />

      <div className="px-6 pb-10">
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
          <p className="text-sm text-gray-500 mt-1">Latest uploads and status changes.</p>

          <div className="mt-6 space-y-4">
            {files.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              files.slice(0, 12).map((file) => (
                <div key={file.id} className="flex items-start justify-between gap-4 border border-gray-200 rounded-xl p-4">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded by {file.user?.email || file.user?.username || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{file.date_uploaded}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{file.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
