// src/components/Footer.js
import React from 'react';
import { FaFacebook, FaGlobe, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-24 ">
        
        {/* About Section */}
        <div>
          <div className="flex">
            <img src="images/scriptorfi-logo-icon.png" alt="Logo" className="w-10 h-10 mr-4" />
            <h3 className="text-[#0FFCBE] font-bold text-[24px] mb-4">Scriptorfi</h3>
          </div>
          <p className="">
            Delivering high-quality transcriptions at unbeatable prices.
            Fast, accurate, and secure—trusted by professionals worldwide.
            Your words, perfectly transcribed, every time.
          </p>
        </div>

        {/* Categories Section */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <Link to="/about" className=" hover:text-slate-100"><li className="hover:text-[#0FFCBE] md:py-2">About Us</li></Link>
            <Link to="/contact" className="hover:text-slate-100"><li className=" hover:text-[#0FFCBE] md:py-2">Contact</li></Link>
            <Link to="/privacy-policy" className="hover:text-slate-100"><li className="hover:text-[#0FFCBE] md:py-2">Privacy & Policy</li></Link>
            <Link to="/blog" className="hover:text-slate-100"><li className="hover:text-[#0FFCBE] md:py-2">Blog</li></Link>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Account</h3>
          <ul className="space-y-2">
            <Link to="/login" className=" hover:text-slate-100"><li className="hover:text-[#0FFCBE] md:py-2">Sign In</li></Link>
            <Link to="/register" className=" hover:text-slate-100"><li className="hover:text-[#0FFCBE] md:py-2">Sign Up</li></Link>
            <Link to="/about" className=" hover:text-slate-100"><li className="hover:text-[#0FFCBE] md:py-2">Upload File</li></Link>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <p className="text-gray-500">Copyright © 2024 All Rights Reserved</p>
        <div className="flex justify-center space-x-4 mt-4 text-gray-400">
          <FaFacebook size={20} className="hover:text-white cursor-pointer" />
          <FaXTwitter size={20} className="hover:text-white cursor-pointer" />
          <FaGlobe size={20} className="hover:text-white cursor-pointer" />
          <FaLinkedin size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
