import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../authContext';

const SuperAdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await axios.post('http://localhost:8000/api/superadmin/login/', {
                email,
                password,
            });
            
            
            // Save tokens in localStorage or cookies
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            localStorage.setItem('role', 'superadmin');
            // Redirect to Super Admin Dashboard
            window.location.href = '/superadmin/dashboard';
            
            
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md w-96" onSubmit={handleLogin}>
                <h2 className="text-2xl font-bold mb-4">Super Admin Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <label className="block mb-2">Username</label>
                <input
                    type="email"
                    className="border p-2 w-full mb-4 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label className="block mb-2">Password</label>
                <input
                    type="password"
                    className="border p-2 w-full mb-4 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">
                    Login
                </button>
            </form>
        </div>
    );
};

export default SuperAdminLogin;
