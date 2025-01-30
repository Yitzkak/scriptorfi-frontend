import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNotifications } from '../NotificationContext';


const Sidebar = () => {
    const location = useLocation();
    const { unreadNotificationsCount } = useNotifications();
    
  return (
    <div className="w-64 bg-[#5fd4c4] text-[#1A1C1C] flex flex-col">
      <nav className="flex-1 px-3 py-3">
        <ul>
          <li className="">
            <Link to="" 
              className={`block rounded-md p-3 hover:bg-[#a7b8b4] ${
                location.pathname === "/dashboard" ? "bg-[#86a099]" : ""
                }`}
              >
              Dashboard
            </Link>
          </li>
          <li className="">
            <Link 
                to="/dashboard/upload" 
                className={`block rounded-md p-3 hover:bg-[#a7b8b4] ${
                  location.pathname === "/dashboard/upload" ? "bg-[#86a099] rounded-md p-3" : ""
                  }`}
              >
              Upload Files
            </Link>
          </li>
          <li className="">
            <Link 
                to="/dashboard/settings" 
                className={`block rounded-md p-3 hover:bg-[#a7b8b4] ${
                  location.pathname === "/dashboard/settings" ? "bg-[#86a099]" : ""
                  }`}
                >
                Settings
            </Link>
          </li>
          <li className="">
            <Link
                to="/dashboard/files"
                className={`block rounded-md p-3 hover:bg-[#a7b8b4] ${
                location.pathname === "/dashboard/files" ? "bg-[#86a099]" : ""
                }`}
                >
                My Files
            </Link>
           </li>
           <li className="">
            <Link
                to="/dashboard/notifications"
                className={`block rounded-md p-3 hover:bg-[#a7b8b4] ${
                location.pathname === "/dashboard/notifications" ? "bg-[#86a099]" : ""
                }`}
                >
                Notifications 
                <span className="bg-red-500 text-white rounded-full px-2 py-1 ml-2">{unreadNotificationsCount}</span>
            </Link>
           </li>
        </ul>
      </nav>
      <div className="p-4 text-sm text-gray-400">
        © 2024 Scriptorfi
      </div>
    </div>
  );
};

export default Sidebar;
