import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/superadmin/AdminSidebar";

const SuperAdminDashboardLayout = () => {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboardLayout;