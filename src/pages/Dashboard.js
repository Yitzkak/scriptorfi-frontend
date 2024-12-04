import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken'); // Clear the access token
        navigate('/login'); // Redirect to the login page
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold">Welcome to the Dashboard!</h1>
            <button
                onClick={handleLogout}
                className="mt-4 px-6 py-2 text-white bg-red-500 hover:bg-red-600 rounded"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
