// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { BsArrowRight } from 'react-icons/bs';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-2 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)]' 
          : 'py-4 bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/images/logo-icon-black.png" 
                alt="Scriptorfi" 
                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Scriptorfi
              </span>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center gap-8">
              <NavLink to="/" active={isActive('/')}>Home</NavLink>
              <NavLink to="/about" active={isActive('/about')}>About</NavLink>
              <NavLink to="/services" active={isActive('/services')}>Services</NavLink>
              <NavLink to="/contact" active={isActive('/contact')}>Contact</NavLink>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <a 
                href="/editor-home"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all"
              >
                Try Editor
                <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <Link to="/login">
                <button className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  Log In
                </button>
              </Link>
              <Link to="/register">
                <button className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">
                  Sign Up Free
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu} 
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiX size={22} /> : <HiOutlineMenuAlt3 size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile Slide-out Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
              <img 
                src="/images/logo-icon-black.png" 
                alt="Scriptorfi" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Scriptorfi</span>
            </Link>
            <button 
              onClick={closeMenu}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <HiX size={22} />
            </button>
          </div>

          {/* Mobile Links */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-1">
              <MobileNavLink to="/" onClick={closeMenu} active={isActive('/')}>Home</MobileNavLink>
              <MobileNavLink to="/about" onClick={closeMenu} active={isActive('/about')}>About</MobileNavLink>
              <MobileNavLink to="/services" onClick={closeMenu} active={isActive('/services')}>Services</MobileNavLink>
              <MobileNavLink to="/contact" onClick={closeMenu} active={isActive('/contact')}>Contact</MobileNavLink>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <a 
                href="/editor-home"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between w-full px-4 py-4 text-base font-medium text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors"
                onClick={closeMenu}
              >
                Try Our Editor
                <BsArrowRight size={18} />
              </a>
            </div>
          </div>

          {/* Mobile Footer Actions */}
          <div className="p-6 border-t border-gray-100 space-y-3">
            <Link to="/login" onClick={closeMenu} className="block">
              <button className="w-full py-3.5 text-base font-semibold text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                Log In
              </button>
            </Link>
            <Link to="/register" onClick={closeMenu} className="block">
              <button className="w-full py-3.5 text-base font-semibold text-white bg-gray-900 rounded-2xl hover:bg-gray-800 transition-colors">
                Sign Up Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Desktop nav link with active state
const NavLink = ({ to, active, children }) => (
  <Link 
    to={to} 
    className={`relative text-sm font-medium transition-colors ${
      active 
        ? 'text-gray-900' 
        : 'text-gray-500 hover:text-gray-900'
    }`}
  >
    {children}
    {active && (
      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
    )}
  </Link>
);

// Mobile nav link with active state
const MobileNavLink = ({ to, onClick, active, children }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-colors ${
      active 
        ? 'text-emerald-600 bg-emerald-50' 
        : 'text-gray-700 hover:bg-gray-50'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
