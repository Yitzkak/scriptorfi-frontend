import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // For navigation to the register page
import axios from "axios";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset errors before submission

        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                console.log(data.access);
                console.log(data.refresh);
                navigate('/dashboard'); // Redirect to the dashboard on success
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        }
    };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0FFCBE]">
      <div className="bg-white bg-opacity-10 p-2 w-[50rem] md:w-[37rem]">
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
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-4 bg-black bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          <div className="flex justify-between items-center mb-4 text-sm text-white">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox text-white bg-white bg-opacity-20"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <a href="#" className="hover:underline">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-black py-5 text-white text-lg font-poppins rounded-sm shadow-2xl hover:bg-gray transition"
          >
            LOGIN
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-white">
          Don't have an account?{" "}
          <Link to="/register" className="underline hover:text-blue-300">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
