import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiLayers,
  FiCreditCard,
  FiUsers,
  FiBell,
  FiSettings,
  FiMenu,
  FiX,
} from "react-icons/fi";

const AdminSidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/superadmin/dashboard", label: "Overview", icon: FiHome, exact: true },
    { path: "/superadmin/dashboard/queue", label: "Upload Queue", icon: FiLayers },
    { path: "/superadmin/dashboard/payments", label: "Payments", icon: FiCreditCard },
    { path: "/superadmin/dashboard/users", label: "Users", icon: FiUsers },
    { path: "/superadmin/dashboard/notifications", label: "Notifications", icon: FiBell },
    { path: "/superadmin/dashboard/settings", label: "Settings", icon: FiSettings },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Scriptorfi Admin</h2>
        <p className="text-xs text-gray-500 mt-1">Operations Console</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                active
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-teal-600"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  active ? "text-white" : "text-gray-500 group-hover:text-teal-600"
                }`}
              />
              <span className="font-medium flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} Scriptorfi
        </p>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-100"
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col shadow-sm">
        <SidebarContent />
      </div>

      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl z-40 transform transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;
