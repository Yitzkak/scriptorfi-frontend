import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
            <p>Here you can upload files, view your transcriptions, and manage your account.</p>

            {/* Example content */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white shadow rounded">
                    <h2 className="font-semibold">Upload Files</h2>
                    <p className="text-sm text-gray-600">Upload new transcription files.</p>
                </div>
                <div className="p-4 bg-white shadow rounded">
                    <h2 className="font-semibold">My Transcriptions</h2>
                    <p className="text-sm text-gray-600">View and manage your transcriptions.</p>
                </div>
                <div className="p-4 bg-white shadow rounded">
                    <h2 className="font-semibold">Account Settings</h2>
                    <p className="text-sm text-gray-600">Update your account information.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
