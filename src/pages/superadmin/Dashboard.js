import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const SuperAdminDashboard = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await api.get('http://localhost:8000/api/superadmin/files/');
                setFiles(response.data);
                console.log(response.data);
            } catch (err) {
                setError('Failed to fetch files. Please try again.');
            }
        };

        fetchFiles();
    }, []);

    const updateFileStatus = async (id, status) => {
        // Check if the file has already been marked
        // If it has already been marked as completed, don't do anything
        // if the complete button is clicked again. Same for pending button
        const clickedFile = files.find(file => file.id === id);
        if (clickedFile && clickedFile.status === status) return;
    
        try {
            await api.post(
                `http://localhost:8000/api/superadmin/files/${id}/status/`,
                { status }
            );
            setFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.id === id ? { ...file, status } : file
                )
            );
            alert('File status updated successfully!');
        } catch (err) {
            setError('Failed to update file status. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">File Name</th>
                            <th className="border border-gray-300 p-2">Size</th>
                            <th className="border border-gray-300 p-2">Uploaded By</th>
                            <th className="border border-gray-300 p-2">Status</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file.id}>
                                <td className="border border-gray-300 p-2">{file.name}</td>
                                <td className="border border-gray-300 p-2">{file.size}</td>
                                <td className="border border-gray-300 p-2">{file.user?.username || 'N/A'}</td>
                                <td className="border border-gray-300 p-2">{file.status}</td>
                                <td className="border border-gray-300 p-2">
                                    <button
                                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                        onClick={() => updateFileStatus(file.id, 'Completed')}
                                    >
                                        Mark as Completed
                                    </button>
                                    <button
                                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        onClick={() => updateFileStatus(file.id, 'Pending')}
                                    >
                                        Mark as Pending
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
