import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNotifications } from '../NotificationContext';


const Sidebar = () => {
    const location = useLocation();
    const { unreadNotificationsCount } = useNotifications();
    
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <nav className="flex-1 px-4 py-2">
        <ul>
          <li className="py-2">
            <Link to="" 
              className={`block hover:text-gray-400 ${
                location.pathname === "/dashboard" ? "font-bold" : ""
                }`}
              >
              Dashboard
            </Link>
          </li>
          <li className="py-2">
            <Link 
                to="/dashboard/upload" 
                className={`block hover:text-gray-400 ${
                  location.pathname === "/dashboard/upload" ? "font-bold" : ""
                  }`}
              >
              Upload Files
            </Link>
          </li>
          <li className="py-2">
            <Link 
                to="/dashboard/transcriptions" 
                className={`block hover:text-gray-400 ${
                  location.pathname === "/dashboard/transcriptions" ? "font-bold" : ""
                  }`}
                >
                My Transcriptions
            </Link>
          </li>
          <li className="py-2">
            <Link 
                to="/dashboard/settings" 
                className={`block hover:text-gray-400 ${
                  location.pathname === "/dashboard/settings" ? "font-bold" : ""
                  }`}
                >
                Settings
            </Link>
          </li>
          <li className="py-2">
            <Link
                to="/dashboard/files"
                className={`block hover:text-gray-400 ${
                location.pathname === "/dashboard/files" ? "font-bold" : ""
                }`}
                >
                My Files
            </Link>
           </li>
           <li className="py-2">
            <Link
                to="/dashboard/notifications"
                className={`block hover:text-gray-400 ${
                location.pathname === "/dashboard/notifications" ? "font-bold" : ""
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
