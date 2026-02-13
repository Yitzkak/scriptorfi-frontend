import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiLogOut } from "react-icons/fi";

const AdminTopbar = ({ title, onSearch }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("role");
    navigate("/superadmin/login");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Admin operations console</p>
        </div>

        <div className="flex flex-1 md:flex-none items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 md:w-72 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files, users"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </form>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
