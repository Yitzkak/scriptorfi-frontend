import React, { useState } from 'react';
import axios from 'axios';

const SuperAdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
                <div className="bg-white min-h-screen">
                    <section className="bg-gray-50 py-16 px-6 md:px-12">
                        <div className="max-w-6xl mx-auto text-center">
                            <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Admin</p>
                            <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Super Admin Login</h1>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                Access the operations console to manage uploads, payments, and transcripts.
                            </p>
                        </div>
                    </section>

                    <section className="py-16 px-6 md:px-12">
                        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900">Sign in to continue</h2>
                            <p className="mt-2 text-sm text-gray-600">Use your admin credentials.</p>

                            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
                                >
                                    Sign in
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
    );
};

export default SuperAdminLogin;
