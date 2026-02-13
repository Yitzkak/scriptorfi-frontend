import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const Register = () => {
    const [first_name, setFirstname] = useState('');
    const [last_name, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const countryList = countries.getNames('en');

 
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
                body: JSON.stringify({ email: email.toLowerCase(), first_name, last_name, country, password, confirm_password: confirmPassword}),
            });

            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...');
                
                // Check if there's a pending upload
                const pendingUploadId = localStorage.getItem('pendingUploadId');
                
                const freeTrialPending = sessionStorage.getItem('freeTrialPending') === 'true';

                if (pendingUploadId) {
                    // Redirect to login with upload message
                    setTimeout(() => navigate('/login', { 
                        state: { 
                            from: '/register', 
                            message: 'Please login to complete your upload and proceed to checkout' 
                        } 
                    }), 2000);
                } else if (freeTrialPending) {
                  setTimeout(() => navigate('/login', { 
                    state: { 
                      from: '/register',
                      freeTrial: true,
                      message: 'Please login to activate your free trial.'
                    } 
                  }), 2000);
                } else {
                    // Normal registration, go to login
                    setTimeout(() => navigate('/login'), 2000);
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="bg-white">
          <section className="bg-gray-50 py-16 px-6 md:px-12">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Sign Up</p>
              <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Create your Scriptorfi account</h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Get started in minutes and upload your first audio file for professional transcription.
              </p>
            </div>
          </section>

          <section className="py-16 px-6 md:px-12">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-gray-900">Why create an account?</h2>
                <ul className="mt-6 space-y-4">
                  {[
                    "Track uploads and payment status",
                    "Access completed transcripts anytime",
                    "Fast checkout and saved preferences",
                  ].map((text, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 w-2 h-2 rounded-full bg-teal-500"></span>
                      <p className="text-gray-700">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Create account</h2>
                <p className="mt-2 text-sm text-gray-600">Use your work or personal email.</p>

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
                {success && <p className="text-teal-600 text-sm mt-4">{success}</p>}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First name</label>
                      <input
                        type="text"
                        placeholder="First name"
                        className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={first_name}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last name</label>
                      <input
                        type="text"
                        placeholder="Last name"
                        className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={last_name}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                      />
                    </div>
                  </div>

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
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      id="country"
                      className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value="">Choose a country (optional)</option>
                      {Object.entries(countryList).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      placeholder="Create a password"
                      className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-teal-500 py-3 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition"
                  >
                    Create account
                  </button>
                </form>

                <div className="text-center mt-4 text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-teal-600 hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
    );
};

export default Register;
