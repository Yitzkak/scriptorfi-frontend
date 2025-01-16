import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../api/api";
import Alert from "../components/ui/Alert";


const FileList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null); // 'success' or 'error'

    // Fetch files
    useEffect(() => {
      const fetchFiles = async () => {
        try {
          const response = await api.get('http://localhost:8000/api/files/');
          setFiles(response.data);
          if (response.data.length > 0) {
           setMessage("File fetched successfully.");
          }
          setMessageType("success");
        } catch (error) {
          setMessage("Failed to fetch files. Please try again.");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      };
  
      fetchFiles();
    }, []);
  
    // Delete file
    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this file?");
        if (confirmed) {
          try {
            await api.delete(`http://localhost:8000/api/files/${id}/delete/`);
            setFiles(files.filter((file) => file.id !== id));
            setMessage("File deleted successfully.");
            setMessageType("success");
          } catch (err) {
            setMessage("Failed to delete file. Please try again.");
            setMessageType("error");
          }
        }
    };
  
    return (
      <div className="p-8">
        <Alert message={message} messageType={messageType} onClear={() => setMessage(null)} />

        <h1 className="text-2xl font-bold mb-4">My Files</h1>
        {loading ? (
          <p>Loading...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Filename</th>
                <th className="border border-gray-300 px-4 py-2">Size</th>
                <th className="border border-gray-300 px-4 py-2">Date Uploaded</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="text-gray-700">
                  <td className="border border-gray-300 px-4 py-2">{file.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{file.size}</td>
                  <td className="border border-gray-300 px-4 py-2">{file.date_uploaded}</td>
                  <td className="border border-gray-300 px-4 py-2">{file.status}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => alert(`Viewing details for ${file.name}`)}
                      className={`px-3 py-1 rounded mr-2 ${
                        file.status === "Completed" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-700 cursor-not-allowed"
                      }`}
                      disabled={file.status !== "Completed"}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  
  export default FileList;
  