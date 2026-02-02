import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import api from "../api/api.js";
import Alert from "../components/ui/Alert.js";
import { LuUpload, LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const UploadFiles = () => {
  const [files, setFiles] = useState([]);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0); // Duration in seconds
  const [totalCost, setTotalCost] = useState(0); // Cost in USD
  const [uploadSource, setUploadSource] = useState("local"); // Tracks the current upload source
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

  const navigate = useNavigate();
  const PRICE_PER_MINUTE = 0.6; // Price per minute of transcription

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
    if (uploadSource === "local") {
      setFiles((prevFiles) => [...prevFiles, ...audioFiles]);
    } else {
      setAdditionalFiles((prevFiles) => [...prevFiles, ...audioFiles]);
    }

    // Recalculate total duration and cost
    const allFiles = [...files, ...audioFiles];
    const totalDuration = allFiles.reduce((acc, file) => acc + file.duration, 0);
    setTotalDuration(totalDuration);
    setTotalCost((totalDuration / 60) * PRICE_PER_MINUTE);
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
      const newFile = { ...file, preview: URL.createObjectURL(file), duration };

      setFiles((prevFiles) => [...prevFiles, newFile]);

      const totalDuration = files.reduce((acc, file) => acc + file.duration, 0) + duration;
      setTotalDuration(totalDuration);
      setTotalCost((totalDuration / 60) * PRICE_PER_MINUTE);

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

    if (files.length === 0) {
      alert("Select a file to upload");
      return;
    }

    console.log("Files to upload:", files);

    const formattedValues = Object.fromEntries(
      Object.entries(checkboxValues).map(([key, value]) => [key, value ? "Yes" : "No"])
    );

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file.file);
    formData.append("name", file.name);
    formData.append("size", totalDuration.toString());
    formData.append("total_cost", Math.round(totalCost));
    formData.append("verbatim", formattedValues.verbatim);
    formData.append("rush_order", formattedValues.rushOrder);
    formData.append("timestamp", formattedValues.timestamp);
    formData.append("spelling", options.spellingType);
    formData.append("instruction", options.instructions);

    console.log("Sending upload request...");

    try {
      const response = await api.post(
        "/api/files/upload/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Upload successful:", response.data);
      setMessage("File Uploaded Successfully.");
      setMessageType("success");
      setFiles([]);
      setTotalDuration(0);
      setTotalCost(0);
      setOptions({
        spellingType: "US",
        instructions: "",
      });
      navigate("/dashboard/payment", { state: { fileData: response.data } });
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      setMessage(error.response?.data?.error || "Failed to upload file.");
      setMessageType("error");
    }
  };

  return (
    <div className="p-8 text-[#1A1A1A] bg-[#fafafa]">
      <Alert
        message={message}
        messageType={messageType}
        onClear={() => setMessage(null)}
      />
      <div className="mb-4 border-b-[1px] border-[#aaaaaa42] pt-0 pb-2">
        <h1 className="block text-[32px] ">Upload Files</h1>
        <p>Estimated Delivery: 1-3 business days</p>
      </div>
      
      <div className="flex space-x-10"> 

        {/** Left Side */}
        <div className="flex-grow-[3] mt-4">
          
          {/** Drag and Drop upload */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 px-4 py-10 rounded-lg bg-gray-100 cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center">
              <LuUpload size="34"/>
              <p className=" text-[30px] pl-6">
                Drag & Drop Files Here, or Click to Select Files
            </p>
            </div>
          </div>

          {/** Upload from URL */}
          <div className="mt-4">
            <div className="flex items-center mt-2">
              <label className="block mt-4 w-full">
                <input
                  type="text"
                  placeholder="Upload from a Web Link"
                  value={urlFile}
                  onChange={(e) => setUrlFile(e.target.value)}
                  className="rounded-l-lg block w-full p-4 border-2 border-black focus:outline-none focus:rounded-none focus:ring-0 focus:ring-black focus:border-black"
                />
              </label>
              <button
                onClick={handleUrlUpload}
                className="p-4 bg-[#1A1A1A] w-1/4 mt-4 text-white hover:bg-transparent border-2 border-[#1A1A1A] hover:text-[#1A1A1A] transition duration-300 ease-in-out rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="font-bold"><LuUpload size="16" className="inline font-[500] mr-3"/></span>
                Upload
              </button>
            </div>
          </div>

          <div className="mt-6 p-4">
            <h2 className="text-[18px] border-b-[1px] border-[#aaaaaa42] mt-5 pb-2">Selected Files:</h2>
            {files.length === 0 ? (
              <p className="p-4">No files selected</p>
            ) : (
              <ul className="p-2 space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex text-sm text-gray-600 justify-between">
                    <span className="">{file.name}</span>  
                    <span className="">{Math.ceil(file.duration / 60)} min</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

        {/** Right Side */}
        <div className=" flex-grow-[7] mt-3">
          <div className="space-y-2 shadow-md bg-white p-10">
            {/** Spelling Option */}
            <div className="flex space-x-10 mb-4 pb-5">
              <label className="block font-[500] pt-3">
                Accent:
              </label>
              <select
                    name="spellingType"
                    value={options.spellingType}
                    onChange={handleOptionChange}
                    className="block w-full mt-1 border rounded p-2"
                  >
                    <option value="US">US</option>
                    <option value="British">British</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
              </select>
            </div>

            {/** Check Box for Verbatim */}
            <div className="flex">
              <div className="relative">
                <input
                  type="checkbox"
                  id="verbatim"
                  name="verbatim"
                  checked= {checkboxValues.verbatim}
                  onChange={handleCheckboxChange}
                  className="peer appearance-none w-6 h-6 border-2 border-gray-600 rounded-md checked:bg-[#359d82] checked:border-[#359d82] focus:outline-none focus:ring-2 focus:ring-[#359d82] focus:ring-offset-2 cursor-pointer transition duration-200"
                />
                <svg
                  className="peer-checked:block absolute w-4 h-4 text-white top-1 left-1 hidden pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <label className="block ml-2 pb-4">
                <p className="font-[500]">Verbatim </p>
                <p className="text-[13px] text-gray-800 font-[400]">Include all utterances (filler words, false starts, and stutters)</p>
              </label> 
            </div>

            {/** Checkbox for Timestamp & Speaker IDs */}
            <div className="flex">
              <div className="relative">
                <input
                  type="checkbox"
                  id="timestamp"
                  name="timestamp"
                  checked= {checkboxValues.timestamp}
                  onChange={handleCheckboxChange}
                  className="peer appearance-none w-6 h-6 border-2 border-gray-600 rounded-md checked:bg-[#359d82] checked:border-[#359d82] focus:outline-none focus:ring-2 focus:ring-[#359d82] focus:ring-offset-2 cursor-pointer transition duration-200"
                />
                <svg
                  className="peer-checked:block absolute w-4 h-4 text-white top-1 left-1 hidden pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <label className="block ml-2 pb-4 ">
                <p className="font-[500]">Timestamp & Speaker IDs </p> 
              <p className="text-[13px] text-gray-800 font-[400]">Speakers tagged with timestamps at each turn.</p>
              </label> 
            </div>

            {/** Checkbox for Rush Order */}
            <div className="flex">
              <div className="relative">
                <input
                  type="checkbox"
                  id="rushOrder"
                  name="rushOrder"
                  checked= {checkboxValues.rushOrder}
                  onChange={handleCheckboxChange}
                  className="peer appearance-none w-6 h-6 border-2 border-gray-600 rounded-md checked:bg-[#359d82] checked:border-[#359d82] focus:outline-none focus:ring-2 focus:ring-[#359d82] focus:ring-offset-2 cursor-pointer transition duration-200"
                />
                <svg
                  className="peer-checked:block absolute w-4 h-4 text-white top-1 left-1 hidden pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <label className="block ml-2 pb-4">
                <p className="font-[500]">Rush Order </p>
                <p className="text-[13px] text-gray-800 font-[300]">Guaranteed delivery within 24 hours.</p>
              </label> 
            </div>
          </div>

          {/** Order Summary Section */}
          <div className="mt-5 shadow-lg bg-white border-1 border-gray-600 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 border-b pb-4">Total</h2>
            <div className="">
                <div className="mt-4">
                  <div className="flex py-2 justify-between">
                    <p className="font-[500]">No. of Files:</p> 
                    <p>{files.length > 0 ? files.length : "0"}</p>
                  </div>
                  <div className="flex py-2 justify-between">
                    <p className="font-[500]">Total Duration:</p> 
                    <p>{files.length > 0 ? Math.ceil(totalDuration / 60) : "0" } minute(s)</p>
                  </div>
                  <div className="flex pt-4 justify-between border-t mt-4">
                    <p className="font-[500]">Subtotal:</p> 
                    <p>{files.length > 0 && "$" + totalCost.toFixed(2)}</p>
                  </div>
                </div>
            </div>
          </div>

          {/** Upload Button */}
          <div>
          {files.length > 0 && (
            <button
              onClick={handleUpload}
              className="mt-4 w-full px-4 py-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
