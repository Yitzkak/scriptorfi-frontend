import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import api from "../api/api.js";
import Alert from "../components/ui/Alert.js";

const UploadFiles = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0); // Duration in seconds
  const [totalCost, setTotalCost] = useState(0); // Cost in USD
  const [options, setOptions] = useState({
    verbatim: "No",
    rushOrder: "No",
    timestamp: "Yes",
    spellingType: "US",
    instructions: "",
  });

  const PRICE_PER_MINUTE = 0.6; // Price per minute of transcription

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
    setFiles(audioFiles);

    // Calculate total duration and cost
    const totalDuration = audioFiles.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(totalDuration);
    setTotalCost((totalDuration / 60) * PRICE_PER_MINUTE);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Select a file to upload");
      return;
    }

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file.file);
    formData.append("name", file.name);
    formData.append("size", totalDuration.toString());
    //formData.append("status", "pending");
    //formData.append("options", JSON.stringify(options));
    formData.append("total_cost", Math.round(totalCost));
    formData.append("verbatim", options.verbatim);
    formData.append("rush_order", options.rushOrder);
    formData.append("timestamp", options.timestamp);
    formData.append("spelling", options.spellingType);
    formData.append("instruction", options.instructions);

    try {
      const response = await api.post(
        "http://localhost:8000/api/files/upload/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage("File Uploaded Successfully.");
      setMessageType("success");
      setFiles([]);
      setTotalDuration(0);
      setTotalCost(0);
      setOptions({
        verbatim: "No",
        rushOrder: "No",
        timestamp: "No",
        spellingType: "US",
        instructions: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to upload file.");
      setMessageType("error");
    }
  };

  return (
    <div className="p-8">
      <Alert
        message={message}
        messageType={messageType}
        onClear={() => setMessage(null)}
      />
      <h1 className="text-2xl font-bold mb-4">Upload Files</h1>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-100 cursor-pointer"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">
          Drag & drop files here, or click to select files
        </p>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Selected Files:</h2>
        {files.length === 0 ? (
          <p className="text-gray-500">No files selected</p>
        ) : (
          <ul>
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {console.log(file)}
                {file.name} - {Math.ceil(file.duration / 60)} min
              </li>
            ))}
          </ul>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-700">
            Total Duration: {Math.ceil(totalDuration / 60)} minutes
          </p>
          <p className="text-gray-700">
            Total Cost: ${totalCost.toFixed(2)}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <label className="block">
          Verbatim:
          <select
            name="verbatim"
            value={options.verbatim}
            onChange={handleOptionChange}
            className="block w-full mt-1 border rounded"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </label>

        <label className="block">
          Rush Order:
          <select
            name="rushOrder"
            value={options.rushOrder}
            onChange={handleOptionChange}
            className="block w-full mt-1 border rounded"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </label>

        <label className="block">
          Timestamp:
          <select
            name="timestamp"
            value={options.timestamp}
            onChange={handleOptionChange}
            className="block w-full mt-1 border rounded"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </label>

        <label className="block">
          Spelling Type:
          <select
            name="spellingType"
            value={options.spellingType}
            onChange={handleOptionChange}
            className="block w-full mt-1 border rounded"
          >
            <option value="US">US</option>
            <option value="British">British</option>
            <option value="Australia">Australia</option>
            <option value="Canada">Canada</option>
          </select>
        </label>

        <label className="block">
          Additional Instructions:
          <textarea
            name="instructions"
            rows="10"
            value={options.instructions}
            onChange={handleOptionChange}
            className="block w-full mt-1 border rounded"
          ></textarea>
        </label>
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
