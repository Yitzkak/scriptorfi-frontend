import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className=" items-center justify-center bg-gray-100 pb-8">
        <div className="relative bg-[#0FFCBE] py-20 text-center text-gray-900">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Get in Touch
            </h2>
            <p className="text-center text-gray-600 mb-2 px-20">
            Have any questions or need support? Reach out to us and we'll get back to you as soon as possible.
            </p>
        </div>

      <div className="flex justify-center">   
      <div className="w-full max-w-4xl  px-5 py-20">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail className="text-[#0FFCBE] w-6 h-6" />
              <div>
                <p className="text-gray-700 font-semibold">Email</p>
                <p className="text-gray-600">support@yourcompany.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="text-[#0FFCBE] w-6 h-6" />
              <div>
                <p className="text-gray-700 font-semibold">Phone</p>
                <p className="text-gray-600">+1 (234) 567-890</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="text-[#0FFCBE] w-6 h-6" />
              <div>
                <p className="text-gray-700 font-semibold">Office Location</p>
                <p className="text-gray-600">123 Business Street, New York, USA</p>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">Your Name</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Your Email</label>
                <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]" placeholder="johndoe@example.com" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Message</label>
                <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]" rows="4" placeholder="Write your message here..."></textarea>
              </div>
              <button className="w-full bg-[#0FFCBE] text-white py-3 rounded-lg font-semibold hover:bg-[#0DCFA2] transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Contact;
