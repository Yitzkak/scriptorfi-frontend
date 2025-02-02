// src/components/Footer.js

import React from 'react';
import { FaFacebook, FaTwitter, FaGlobe, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24">
        
        {/* About Section */}
        <div>
          <div className="flex">
            <img src="/scriptorfi-logo-icon.png" alt="Logo" className="w-10 h-10 mr-4" />
            <h3 className="text-white font-bold text-[24px] mb-4">Scriptorfi</h3>
          </div>
          <p>
            Delivering high-quality transcriptions at unbeatable prices.
            Fast, accurate, and secure—trusted by professionals worldwide.
            Your words, perfectly transcribed, every time.
          </p>
        </div>

        {/* Categories Section */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li>About Us</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
            <li>Blog</li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Account</h3>
          <ul className="space-y-2">
            <li>Sign in</li>
            <li>Sign Up</li>
            <li>Upload File</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <p className="text-gray-500">Copyright © 2024 All Rights Reserved</p>
        <div className="flex justify-center space-x-4 mt-4 text-gray-400">
          <FaFacebook size={20} className="hover:text-white cursor-pointer" />
          <FaTwitter size={20} className="hover:text-white cursor-pointer" />
          <FaGlobe size={20} className="hover:text-white cursor-pointer" />
          <FaLinkedin size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
