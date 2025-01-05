import { Outlet } from "react-router-dom";
import DashboardNavbar from "./components/DashboardNavbar";

const SuperAdminDashboardLayout = () => {
    return (
        <div className="h-screen flex flex-col">
            <DashboardNavbar />

            <Outlet />
        </div>
    )
};

export default SuperAdminDashboardLayout;