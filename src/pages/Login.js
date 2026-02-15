import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../authContext';


function Login() {
      const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [uploadMessage, setUploadMessage] = useState('');

    useEffect(() => {
        // Check if redirected from upload page
        if (location.state?.from === '/upload' && location.state?.message) {
            setUploadMessage(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
          console.error("Email and password are required.");
          return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.toLowerCase(), password }),
            });

            if (response.ok) {
                const data = await response.json();
              const storage = rememberMe ? localStorage : sessionStorage;
              storage.setItem('accessToken', data.access);
                  // Fetch user profile after login
                  const profileResponse = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/user-profile/`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${data.access}`
                    }
                  });
                  if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    // Store user info in context and localStorage
                    login(profileData);
                    storage.setItem('user', JSON.stringify(profileData));
                  }
              storage.setItem('refreshToken', data.refresh);
              storage.setItem('role', 'user');
                
                // Check if there's a pending upload ID
                const pendingUploadId = localStorage.getItem('pendingUploadId');
                const freeTrialPending = sessionStorage.getItem('freeTrialPending') === 'true' || location.state?.freeTrial;
                
                if (pendingUploadId) {
                    // Claim the anonymous upload
                    try {
                        const claimResponse = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/files/claim/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${data.access}`
                            },
                            body: JSON.stringify({ upload_id: parseInt(pendingUploadId) })
                        });
                        
                        if (claimResponse.ok) {
                            localStorage.removeItem('pendingUploadId');
                            // User has pending upload, go directly to checkout/payment page
                          navigate('/dashboard/payment', { state: { fileIds: [parseInt(pendingUploadId, 10)] } });
                        } else {
                            console.error('Failed to claim upload');
                            navigate('/dashboard');
                        }
                    } catch (error) {
                        console.error('Error claiming upload:', error);
                        navigate('/dashboard');
                    }
                } else if (freeTrialPending) {
                  sessionStorage.setItem('freeTrialActive', 'true');
                  sessionStorage.removeItem('freeTrialPending');
                  navigate('/dashboard/upload', { state: { freeTrial: true } });
                } else {
                  // Normal login, go to dashboard
                  navigate('/dashboard');
                }
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        }
    };

  return (
    <div className="bg-white">
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Sign In</p>
          <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Log in to manage uploads, review transcripts, and complete payments.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Why sign in?</h2>
            <ul className="mt-6 space-y-4">
              {[
                "Continue your uploads and checkout",
                "Track order status and payments",
                "Access your transcripts anytime",
              ].map((text, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-teal-500"></span>
                  <p className="text-gray-700">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
            <p className="mt-2 text-sm text-gray-600">Use your registered email and password.</p>

            {uploadMessage && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                <p className="text-sm">{uploadMessage}</p>
              </div>
            )}
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
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
                  placeholder="Enter your password"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-teal-600"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-teal-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-500 py-3 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition"
              >
                Sign in
              </button>
            </form>

            <div className="text-center mt-4 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-600 hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
