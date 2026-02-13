import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardNavbar from "./components/DashboardNavbar";

const DashboardLayout = () => {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            {/* Navbar */}
            <DashboardNavbar />

            {/* Sidebar and Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
