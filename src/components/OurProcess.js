import React from 'react';
import { BiMessageEdit, BiCloudUpload, BiDownload } from "react-icons/bi";
import { motion } from "framer-motion";


const OurProcess = () => {
  const steps = [
    {
      title: "Upload Files",
      description: "Drag, drop, or select multiple audio files and review your order summary instantly.",
      icon: <BiCloudUpload />,
    },
    {
      title: "Transcription",
      description: "Human‑verified transcription with clear formatting, timestamps, and speaker labels.",
      icon: <BiMessageEdit />,
    },
    {
      title: "Delivery",
      description: "Receive your transcript in your dashboard and download when ready.",
      icon: <BiDownload />,
    },
  ];

  return (
    <section className="bg-white py-20 px-6 md:px-12 2xl:px-[19rem]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Our transcription workflow</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Simple, professional, and built for speed
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            A streamlined process that takes you from upload to delivery with clear status updates.
          </p>
        </div>

        <div className="mt-14 relative">
          <div className="hidden md:block absolute left-0 right-0 top-6 h-[2px] bg-gradient-to-r from-teal-500/20 via-teal-500/70 to-teal-500/20" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative"
              >
                <div className="flex items-center gap-4 md:flex-col md:items-start">
                  <div>
                    <div className="w-14 h-14 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-teal-500/30">
                      {step.icon}
                    </div>
                    <div className="hidden md:block mt-3 text-xs font-semibold text-teal-600 tracking-widest">
                      STEP {index + 1}
                    </div>
                  </div>
                  <div className="md:mt-8">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <div className="md:hidden mt-4 text-xs font-semibold text-teal-600 tracking-widest">STEP {index + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurProcess;
