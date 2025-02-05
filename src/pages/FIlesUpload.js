import React, { useState } from "react";
import { FaCloudUploadAlt, FaLink, FaGoogleDrive, FaDropbox, FaCheck } from "react-icons/fa";

const FilesUpload = () => {
  const [files, setFiles] = useState([]);
  const [duration, setDuration] = useState(0);
  const [verbatim, setVerbatim] = useState(false);
  const [rushOrder, setRushOrder] = useState(false);
  const [timestamp, setTimestamp] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [accent, setAccent] = useState("US");

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  const calculateTotal = () => {
    let basePrice = duration * 0.5;
    let extraCharges = (verbatim ? 0.2 : 0) * duration;
    return (basePrice + extraCharges).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-3xl mx-10 my-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Your Files</h2>

        {/* Upload Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className="flex items-center gap-2 bg-gray-200 p-4 rounded-lg cursor-pointer hover:bg-gray-300">
            <FaCloudUploadAlt className="text-2xl text-[#0FFCBE]" />
            <span>Upload from Computer</span>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
          </label>
          <button className="flex items-center gap-2 bg-gray-200 p-4 rounded-lg hover:bg-gray-300">
            <FaLink className="text-2xl text-[#0FFCBE]" /> Upload from URL
          </button>
          <button className="flex items-center gap-2 bg-gray-200 p-4 rounded-lg hover:bg-gray-300">
            <FaGoogleDrive className="text-2xl text-[#0FFCBE]" /> Upload from Google Drive
          </button>
          <button className="flex items-center gap-2 bg-gray-200 p-4 rounded-lg hover:bg-gray-300">
            <FaDropbox className="text-2xl text-[#0FFCBE]" /> Upload from Dropbox
          </button>
        </div>

        {/* Accent Selection */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Select Accent:</label>
          <select value={accent} onChange={(e) => setAccent(e.target.value)} className="w-full p-3 border rounded-lg">
            <option>US</option>
            <option>British</option>
            <option>Australia</option>
            <option>Canada</option>
          </select>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={verbatim} onChange={() => setVerbatim(!verbatim)} />
            Verbatim (+$0.2/min)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={timestamp} onChange={() => setTimestamp(!timestamp)} />
            Timestamp & Speaker IDs
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={rushOrder} onChange={() => setRushOrder(!rushOrder)} />
            Rush Order (+$0.5/min)
          </label>
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Further Instructions:</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows="3"
            placeholder="Provide any additional details here..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          ></textarea>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <p><strong>Total Minutes:</strong> {duration} min</p>
          <p><strong>Number of Files:</strong> {files.length}</p>
          <p><strong>Subtotal:</strong> ${calculateTotal()}</p>
        </div>

        {/* Uploaded Files */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
          <ul className="list-disc pl-6 text-gray-700">
            {files.map((file, index) => (
              <li key={index} className="flex items-center gap-2">
                <FaCheck className="text-green-500" /> {file.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Submit Button */}
        <button className="mt-6 w-full bg-[#0FFCBE] text-white py-3 rounded-lg font-semibold hover:bg-[#0DCFA2] transition">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default FilesUpload;
