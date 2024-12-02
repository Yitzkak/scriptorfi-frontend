// src/components/Footer.js

import React from 'react';
import { FaFacebook, FaTwitter, FaGlobe, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Section */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">ABOUT</h3>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </p>
        </div>

        {/* Categories Section */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">CATEGORIES</h3>
          <ul className="space-y-2">
            <li>Website Design</li>
            <li>UI Design</li>
            <li>Web Development</li>
            <li>Video Editor</li>
            <li>Theme Creator</li>
            <li>Templates</li>
          </ul>
        </div>

        {/* Quick Links Section */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">QUICK LINKS</h3>
          <ul className="space-y-2">
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Contribute</li>
            <li>Privacy Policy</li>
            <li>Sitemap</li>
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
