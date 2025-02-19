import { ArrowRightIcon } from '@heroicons/react/24/solid';
import {FaShieldAlt, FaTachometerAlt, FaCheckCircle, FaDollarSign, FaArrowUp} from 'react-icons/fa';
import { motion } from "framer-motion";

function WhyChooseUs() {
  const features = [
    {
      title: "Security & Privacy",
      description: "Your data is safe with us. We use end-to-end encryption to protect all files and transcripts.",
      icon: <FaShieldAlt />,
    },
    {
      title: "Fast Delivery",
      description: "Get your transcriptions delivered to you quickly without compromising on accuracy.",
      icon: <FaTachometerAlt />,
    },
    {
      title: "High Accuracy",
      description: "Our advanced AI ensures precise and accurate transcripts, reducing errors and saving you time.",
      icon: <FaCheckCircle />,
    },
    {
      title: "Low Cost",
      description: "We charge significantly less than competitors while maintaining exceptional quality.",
      icon: <FaDollarSign />,
    },
  ];
  return (
    <div className="bg-gray-50 py-16 px-6 text-center md:px-12 2xl:px-[19rem] ">
      <div className="max-w-3xl mx-auto">
        <div className="text-3xl font-bold mx-auto text-center mb-4 text-gray-900 pt-10 md:text-4xl lg:text-5xl"> Why <span className="text-[#0FFCBE] font-semibold italic">Choose</span>  Us</div>
          <p className="text-[18px] text-gray-600 text-center mb-8 md:mb-16">
          Get top quality transcriptions at a fraction of the cost – 
          enjoy the same accuracy, faster turnarounds, and unmatched value for your money!
          </p>
      </div>

      {/* Highlights Section */}
        {/* Main Content */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image Section */}
          <div className="h-[80.5%] pt-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6 }}
              className="w-full max-w-full h-[100%]"
            >
              <img 
                src="/images/front-view-teenage-girl-with-headphones-online-school.jpg" 
                alt="Why Choose Us" 
                className="w-full max-w-full h-[100%] rounded-xl shadow-2xl"
              />
            </motion.div>
            <div>
              <button className="flex text-center items-center justify-center w-full bg-[#0FFCBE] text-white font-semibold py-4 px-4 mt-4 rounded-lg hover:bg-[#0FFCBE]"> 
                <p className="mr-2 font-[500]">Upload file</p>
                <FaArrowUp/>
              </button>
            </div>
          </div>
          

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 md:0 xl:gap-12">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col rounded-lg hover:shadow-xl transition duration-300 lg:p-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-start text-white text-2xl pb-2">
                  <span className="rounded-tl-lg rounded-br-lg p-3 bg-[#0FFCBE] shadow-2xl shadow-[#0FFCBE]">
                    {feature.icon}
                  </span>
                </div>
                <div className="flex flex-col items-start pb-4">
                  <p className="text-lg font-semibold pt-5 pb-1 text-gray-800">{feature.title}</p>
                  <p className="text-gray-600 text-[16px] text-left">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div> 


    </div>
  );
}

export default WhyChooseUs;
