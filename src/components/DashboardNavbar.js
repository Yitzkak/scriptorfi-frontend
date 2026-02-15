import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiUpload, 
  FiLogOut, 
  FiSettings, 
  FiHelpCircle,
  FiUser,
  FiBell
} from "react-icons/fi";
import { useAuth } from "../authContext";
import { useNotifications } from '../NotificationContext';

const DashboardNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.first_name || (user?.email?.split('@')[0] || 'User');
  const { unreadNotificationsCount } = useNotifications();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    const userRole = localStorage.getItem('role');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');

    if (userRole === 'superadmin') {
      navigate('/superadmin/login');
    } else {
      navigate('/login');
    }
  };

  const getInitials = () => {
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.substring(0, 2).toUpperCase();
    }
    return 'US';
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Hidden on mobile when sidebar handles it */}
          <div className="hidden lg:flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-mint-green to-teal-400 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">🎵</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Scriptorfi</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Upload Button */}
            <Link to="/dashboard/upload">
              <button className="flex items-center gap-2 bg-mint-green hover:bg-teal-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow">
                <FiUpload size={18} />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </Link>

            {/* Notifications */}
            <Link to="/dashboard/notifications">
              <button className="relative p-2 text-gray-600 hover:text-mint-green hover:bg-gray-100 rounded-lg transition-colors">
                <FiBell size={22} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 p-1 pr-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-mint-green to-teal-400 flex items-center justify-center text-white font-bold shadow-sm">
                  {getInitials()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">User Account</p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate("/dashboard/settings");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiSettings className="text-gray-500" size={18} />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="text-gray-500" size={18} />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/contact");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiHelpCircle className="text-gray-500" size={18} />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
