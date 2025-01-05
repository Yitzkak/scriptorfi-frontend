import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <nav className="flex-1 px-4 py-2">
        <ul>
          <li className="py-2">
            <Link to="" className="hover:text-gray-400">
              Dashboard
            </Link>
          </li>
          <li className="py-2">
            <Link to="/dashboard/upload" className="hover:text-gray-400">
              Upload Files
            </Link>
          </li>
          <li className="py-2">
            <Link to="/dashboard/transcriptions" className="hover:text-gray-400">
              My Transcriptions
            </Link>
          </li>
          <li className="py-2">
            <Link to="/dashboard/settings" className="hover:text-gray-400">
              Settings
            </Link>
          </li>
          <li>
            <Link
                to="/dashboard/files"
                className={`block px-4 py-2 hover:bg-gray-100 ${
                location.pathname === "/dashboard/files" ? "bg-gray-200 font-bold" : ""
                }`}
                >
                My Files
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
