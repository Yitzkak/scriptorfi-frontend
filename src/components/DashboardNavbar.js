import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuUpload, LuLogOut } from "react-icons/lu";
import { TbSettings } from "react-icons/tb";
import { RiCustomerService2Fill } from "react-icons/ri";
import { useAuth } from "../authContext";

const DashboardNavbar = ({}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    const userRole = (localStorage.getItem('role'));
    localStorage.removeItem('accessToken'); // Clear the access token
    localStorage.removeItem('role');

    // Check who whether it's admin or user and redirect to the appropriate login page
    if (userRole == 'superadmin') {
       navigate('/superadmin/login');
    }
    else{
      navigate('/login');
    }
};

  return (
    <nav className="bg-mint-green text-white p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-2xl font-bold">
        <Link to="/">Scriptor-Fi</Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Upload Button */}
        <div className="relative inline-block">
        <Link to="/dashboard/upload">
          <button
            className= " pl-[2.28rem] pr-2 py-2 rounded text-white"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          > 
          <LuUpload size={24}/>
          </button>
        </Link>
        {showTooltip && (
            <div className="absolute top-full py-1 mt-3 p-2 bg-gray-700 text-white text-sm rounded shadow-lg whitespace-nowrap">
              Upload audio
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-700"></div>
            </div>
            
          )}
        </div>

        {/* Profile Section */}
        <div className="relative">
          {/* User Initials / Profile Image */}
          <button
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-blue-600 font-bold"
            onClick={toggleDropdown}
          >
            Y {/* Replace with user initials or image */}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 border border-[#e3e3e3] bg-white rounded-lg shadow-lg min-w-64">
              <div className="py-3 px-3 text-sm text-[#484747]">
                <div onClick={() => navigate("/dashboard/settings")} className="flex text-center items-center p-2 cursor-pointer hover:bg-[#f5f5f5] rounded-md">
                  <TbSettings size="18"/>
                  <div className="ml-2 py-1">Settings</div>
                </div>
                <div onClick={() => navigate("/dashboard/contact")} className="flex text-center items-center p-2 cursor-pointer hover:bg-[#f5f5f5] rounded-md">
                  <RiCustomerService2Fill size="18"/>
                  <div className="ml-2 py-1">Contact support</div>
                </div>
                <div onClick={handleLogout} className="flex text-center items-center p-2 cursor-pointer hover:bg-[#f5f5f5] rounded-md">
                  <LuLogOut size="18"/>
                  <div className="ml-2 py-1">Logout</div>
                </div>
              </div>
            </div>
                
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
