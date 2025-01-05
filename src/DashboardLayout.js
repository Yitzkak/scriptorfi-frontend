import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardNavbar from "./components/DashboardNavbar";

const DashboardLayout = () => {
    return (
        <div className="h-screen flex flex-col">
            {/* Navbar */}
            <DashboardNavbar />

            {/* Sidebar and Main Content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
