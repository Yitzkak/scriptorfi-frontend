// src/components/Navbar.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-slate-100 text-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <div className="text-2xl font-bold">
            <Link to="/">Scriptor-Fi</Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-gray-400">Home</Link>
            <Link to="/about" className="hover:text-gray-400">About</Link>
            <Link to="/services" className="hover:text-gray-400">Services</Link>
            <Link to="/contact" className="hover:text-gray-400">Contact</Link>
          </div>

          {/* Right Section with Buttons */}
          <div className="hidden md:flex space-x-4">
            <button className="bg-black px-4 py-2 rounded text-white hover:bg-gray-500">Login</button>
            <button className="bg-transparent border-2 border-[#448bca] px-4 py-2 rounded hover:bg-[#bfd7ed]">Upload</button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button onClick={toggleMenu} aria-label="Toggle menu">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col space-y-4 py-4">
            <Link to="/" onClick={toggleMenu} className="hover:text-gray-400">Home</Link>
            <Link to="/about" onClick={toggleMenu} className="hover:text-gray-400">About</Link>
            <Link to="/services" onClick={toggleMenu} className="hover:text-gray-400">Services</Link>
            <Link to="/contact" onClick={toggleMenu} className="hover:text-gray-400">Contact</Link>
            <button className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 mt-2">Login</button>
            <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 mt-2">Upload</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;