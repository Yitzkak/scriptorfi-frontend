import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import api from "../api/api.js";
import Alert from "../components/ui/Alert.js";

const UploadFiles = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const onDrop = (acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
    const handleUpload = async (event) => {
        if (files.length === 0 ) {
            alert('Select a file to upload')
            return;
        }
            
        const file = files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        formData.append("size", file.size);
        formData.append("status", "pending");

            try {
                const response = await api.post("http://localhost:8000/api/files/upload/", formData, 
                    {
                        headers: {'Content-Type': 'multipart/form-data'}
                    }
                );
                setMessage("File Uploaded Successfully.");
                setMessageType("success");
                setFiles([]);
            } catch (error) {
                console.error(error);
               setMessage("Failed to upload file.");
               setMessageType("error");
            }
    };

  return (
    <div className="p-8">
      <Alert message={message} messageType={messageType} onClear={() => setMessage(null)} />
      <h1 className="text-2xl font-bold mb-4">Upload Files</h1>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-100 cursor-pointer"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">Drag & drop files here, or click to select files</p>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Selected Files:</h2>
        {files.length === 0 ? (
          <p className="text-gray-500">No files selected</p>
        ) : (
          <ul>
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {files.length > 0 && (
        <button
          onClick={handleUpload}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload Files
        </button>
      )}
    </div>
  );
};

export default UploadFiles;
