import React from 'react';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Payment from './pages/Payment';
import UploadFiles from './pages/UploadFiles';
import MyTranscriptions from './pages/MyTranscriptions';
import FileList from './pages/FileList';
import SuperAdminLogin from './pages/superadmin/Login';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import { NotificationProvider } from './NotificationContext';
import Notifications from './components/Notifications';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FilesUpload from './pages/FIlesUpload';


import DashboardLayout from './DashboardLayout';
import Layout from './Layout';
import PrivateRoute from './utils/PrivateRoute';
import SuperAdminPrivateRoute from './utils/SuperAdminPrivateRoute';
import SuperAdminDashboardLayout from './SuperAdminDashboardLayout';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "services", element: <Services /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "upload", element: <FilesUpload /> },
      { path: "superadmin/login", element: <SuperAdminLogin /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "", element: <Dashboard /> }, // Default dashboard page
      { path: "settings", element: <Settings /> },
      { path: "payment", element: <Payment /> },
      { path: "contact", element: <Contact /> },
      { path: "upload", element: <UploadFiles /> },
      { path: "transcriptions", element: <MyTranscriptions /> },
      { path: "files", element: <FileList /> },
      { path: "notifications", element: <Notifications /> },
    ],
  },
  {
    path: "/superadmin/dashboard",
    element: (
      <SuperAdminPrivateRoute>
        <SuperAdminDashboardLayout />
      </SuperAdminPrivateRoute>
    ),
    children: [
      { path: "", element: <SuperAdminDashboard />}
    ]
  }
]);

function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}

export default App;
