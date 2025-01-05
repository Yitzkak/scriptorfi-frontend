import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(password.length < 8) {
          setError('Password must be at least 8 characters long.');
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase(), username, password, confirm_password: confirmPassword}),
            });

            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
            } else {
                const data = await response.json();
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#0FFCBE]">
           
        <div className="bg-white bg-opacity-10 p-2 w-[50rem] md:w-[37rem]">
        <h1 className="text-3xl font-mono text-center pb-4 text-white mb-4">Sign Up</h1>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-black pb-4 bg-opacity-20 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#dfe5e0]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.5a4.5 4.5 0 014.5 4.5c0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5a4.5 4.5 0 014.5-4.5zm0 12c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
                />
              </svg>
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Email"
                className="w-full px-4 py-4 bg-black bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-4 bg-black bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full px-4 py-4 bg-black bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-black py-5 text-white text-lg font-poppins rounded-sm shadow-2xl hover:bg-gray transition"
            >
              Sign Up
            </button>
          </form>
          <div className="text-center mt-4 text-sm text-white">
          Already have an account?{' '}
                <button
                    onClick={() => navigate('/login')}
                    className="text-blue-500 hover:underline"
                >
                    Login here
                </button>
          </div>
        </div>
      </div>
    );
};

export default Register;
