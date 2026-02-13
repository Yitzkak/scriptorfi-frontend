import { FaShieldAlt, FaTachometerAlt, FaCheckCircle, FaDollarSign, FaHeadset, FaGlobe } from 'react-icons/fa';
import { motion } from "framer-motion";

function WhyChooseUs() {
  const highlights = [
    {
      title: "Security & Privacy",
      description: "Enterprise-grade encryption and strict access controls protect every upload and transcript.",
      icon: <FaShieldAlt />,
    },
    {
      title: "Fast Turnaround",
      description: "Reliable delivery times with clear order status updates from upload to completion.",
      icon: <FaTachometerAlt />,
    },
    {
      title: "Verified Accuracy",
      description: "Human‑verified output with quality checks to ensure clean, readable transcripts.",
      icon: <FaCheckCircle />,
    },
    {
      title: "Transparent Pricing",
      description: "Simple per‑minute pricing with no hidden fees or unexpected add‑ons.",
      icon: <FaDollarSign />,
    },
    {
      title: "Global Language Support",
      description: "Multiple accents and dialects supported with consistent formatting standards.",
      icon: <FaGlobe />,
    },
    {
      title: "Responsive Support",
      description: "Dedicated assistance for file issues, delivery questions, and account help.",
      icon: <FaHeadset />,
    },
  ];

  return (
    <section className="bg-white py-20 px-6 md:px-12 2xl:px-[19rem]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Why teams choose Scriptorfi</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Professional transcription built for speed, clarity, and trust
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            From secure uploads to reliable delivery, every detail is designed for a seamless, enterprise‑ready workflow.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 bg-gray-50 rounded-2xl p-6 border border-gray-200"
          >
            <div className="text-sm text-gray-500 uppercase tracking-widest">Workflow</div>
            <h3 className="text-xl font-semibold text-gray-900 mt-2">From upload to delivery</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-teal-500"></span>
                <p className="text-gray-700">Upload one or multiple files with clear order summaries.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-teal-500"></span>
                <p className="text-gray-700">Choose options like verbatim, timestamps, and rush delivery.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-teal-500"></span>
                <p className="text-gray-700">Pay securely and track status until completion.</p>
              </li>
            </ul>
            <a
              href="/upload"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-teal-500 text-white font-semibold py-3 hover:bg-teal-600 transition"
            >
              Start an Upload
            </a>
          </motion.div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <h4 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h4>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
