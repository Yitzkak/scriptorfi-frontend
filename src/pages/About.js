import React from "react";
import {FaShieldAlt, FaTachometerAlt, FaCheckCircle, FaDollarSign} from 'react-icons/fa';

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      {/* Hero Section */}
      <div className="relative bg-[#0FFCBE] py-20 text-center text-gray-900">
        <h1 className="text-5xl font-bold">About Us</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto">
          We are dedicated to providing high-quality, accurate, and affordable transcription services. Our AI-driven technology ensures speed and precision, giving you the best results every time.
        </p>
      </div>
      
      {/* Our Mission Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Our goal is to make transcription services accessible, affordable, and incredibly accurate. We leverage advanced AI to deliver industry-leading quality while keeping costs low.
        </p>
        <img src="/images/laptop-and-headset.jpg" alt="Our Mission" className="mx-auto mt-8 rounded-xl shadow-lg w-3/4" />
      </div>
      
      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900">Why Choose Us?</h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mt-8">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-[#0FFCBE] text-white rounded-full shadow-lg">
              <FaShieldAlt />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Secure Transcription & Confidentiality</h3>
              <p className="text-gray-600">
                Your audio files are handled with the highest level of security. 
                From the moment you upload them to when they are transcribed, 
                we guarantee that your sensitive content stays private and is not shared with any third parties.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-[#0FFCBE] text-white rounded-full shadow-lg">
              <FaTachometerAlt />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Fast & Efficient Transcription Services</h3>
              <p className="text-gray-600">
                We value your time, which is why we ensure a fast turnaround for every transcription. 
                Our system processes your files efficiently, and our human experts finalize them with precision, ensuring you receive your results promptly.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-[#0FFCBE] text-white rounded-full shadow-lg">
              <FaCheckCircle />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Human-Driven Accuracy for Every Transcription</h3>
              <p className="text-gray-600 text-[16px]">
                We rely on both state-of-the-art transcription tools and the critical eye of our experienced professionals to guarantee high accuracy. 
                Our experts review every transcription to ensure that even the most complex audio is captured perfectly.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-[#0FFCBE] text-white rounded-full shadow-lg">
              <FaDollarSign />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Budget-Friendly Pricing, Premium Service</h3>
              <p className="text-gray-600">
                Offering the most affordable transcription services around, we ensure you get high-quality results without the hefty price tag. 
                Whether for personal or business needs, we provide value that fits any budget.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Team Section */}
      <div className="bg-gray-100 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Our team consists of experts in AI, linguistics, and customer support, ensuring you get the best service possible.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <img src="/images/team1.jpg" alt="Team Member" className="w-24 h-24 mx-auto rounded-full" />
            <h3 className="mt-4 text-lg font-semibold">Jane Doe</h3>
            <p className="text-gray-500">CEO & Founder</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <img src="/images/team2.jpg" alt="Team Member" className="w-24 h-24 mx-auto rounded-full" />
            <h3 className="mt-4 text-lg font-semibold">John Smith</h3>
            <p className="text-gray-500">Head of AI Development</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <img src="/images/team3.jpg" alt="Team Member" className="w-24 h-24 mx-auto rounded-full" />
            <h3 className="mt-4 text-lg font-semibold">Emily Johnson</h3>
            <p className="text-gray-500">Customer Success Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
