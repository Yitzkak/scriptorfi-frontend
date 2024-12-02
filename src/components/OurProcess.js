import React from 'react';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { FaPencilAlt, FaDownload, FaUpload } from 'react-icons/fa';
import { BiPencil } from "react-icons/bi";
import { BiMessageEdit } from "react-icons/bi";
import { BiCloudUpload } from "react-icons/bi";
import { BiDownload } from "react-icons/bi";


const OurProcess = () => {
  return (
    <div className="bg-gray-50 py-16">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Process</h2>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-10 md:space-y-0 md:space-x-16">
        
        {/* Step 1 - Upload */}
        <div className="flex flex-col items-center text-center">
          <BiCloudUpload className="w-16 h-16 text-[#362f2f] transition-transform duration-200 ease-in-out hover:animate-wiggle" />
          <p className="mt-4 font-semibold text-lg text-gray-700">Upload Audio/Video</p>
          <p className="text-sm text-gray-500 max-w-xs mt-2">
            Effortlessly upload files to our cloud for transcription.
          </p>
        </div>

        {/* Step 2 - Transcription */}
        <div className="flex flex-col items-center text-center">
          <BiMessageEdit className="w-16 h-16 text-[#362f2f] transition-transform duration-200 ease-in-out hover:animate-wiggle" />
          <p className="mt-4 font-semibold text-lg text-gray-700">Transcription Process</p>
          <p className="text-sm text-gray-500 max-w-xs mt-2">
            Our team converts your audio/video into text with high accuracy.
          </p>
        </div>

        {/* Step 3 - Download */}
        <div className="flex flex-col items-center text-center">
          <BiDownload className="w-16 h-16 text-[#362f2f] transition-transform duration-200 ease-in-out hover:animate-wiggle" />
          <p className="mt-4 font-semibold text-lg text-gray-700">Receive Your Transcript</p>
          <p className="text-sm text-gray-500 max-w-xs mt-2">
            Download the completed transcript once it's ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurProcess;
