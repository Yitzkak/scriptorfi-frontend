import React from 'react';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { FaPencilAlt, FaDownload, FaUpload } from 'react-icons/fa';
import { BiPencil } from "react-icons/bi";
import { BiMessageEdit } from "react-icons/bi";
import { BiCloudUpload } from "react-icons/bi";
import { BiDownload } from "react-icons/bi";


const OurProcess = () => {
  return (
    <div className="bg-gray-50 py-16 mt-10">
      <div className="text-3xl font-bold text-center mb-4 text-gray-900 pt-10 md:text-4xl lg:text-5xl"> Our transcription <span className="text-[#0FFCBE] font-semibold italic">Workflow</span>  </div>
      <p className="text-[20px] text-gray-600 text-center mb-24">
        Our streamlined process ensures fast, accurate, and hassle-free transcription, from file upload to delivery
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center space-y-10 md:space-y-0 md:space-x-16">
        
        {/* Step 1 - Upload */}
        <div className="flex flex-col items-center text-center  shadow-lg rounded-lg p-8">
          <BiCloudUpload className="w-16 h-16 text-[#362f2f] transition-transform duration-200 ease-in-out hover:animate-wiggle" />
          <p className="mt-4 font-semibold text-lg text-gray-700">Upload Audio/Video</p>
          <p className="text-[16px] text-[#374151] max-w-xs mt-2">
            Effortlessly upload files to our cloud for transcription.
          </p>
        </div>

        {/* Step 2 - Transcription */}
        <div className="flex flex-col items-center text-center shadow-lg rounded-lg p-8 ">
          <BiMessageEdit className="w-16 h-16 text-[#362f2f] transition-transform duration-200 ease-in-out hover:animate-wiggle" />
          <p className="mt-4 text-[20px] font-semibold text-gray-700">Transcription Process</p>
          <p className="text-[16px] text-[#374151] max-w-xs mt-2">
            Our team converts your audio/video into text with high accuracy.
          </p>
        </div>

        {/* Step 3 - Download */}
        <div className="flex flex-col items-center text-center shadow-lg rounded-lg p-8">
          <BiDownload className="w-16 h-16 text-[#362f2f] transition-transform duration-200 ease-in-out hover:animate-wiggle" />
          <p className="mt-4 font-semibold text-[20px] text-gray-700">Receive Your Transcript</p>
          <p className="text-[16px] text-[#374151] max-w-xs mt-2">
            Download the completed transcript once it's ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurProcess;
