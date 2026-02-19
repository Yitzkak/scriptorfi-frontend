import React, { useState, useEffect } from "react";
import axios from "axios";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import api from "../api/api";
import Alert from "../components/ui/Alert";
import { 
  FiUser, 
   useEffect(() => {
     fetch('https://api.exchangerate-api.com/v4/latest/USD')
       .then(res => res.json())
       .then(data => {
         setAvailableCurrencies(Object.keys(data.rates));
       })
       .catch(() => {
         setAvailableCurrencies(['USD']);
       });
   }, []);
  FiMail, 
  FiLock, 
  FiGlobe,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiSettings as FiSettingsIcon
} from "react-icons/fi";

countries.registerLocale(enLocale);

// Helper for persistent currency
const getInitialCurrency = () => {
  return localStorage.getItem('userCurrency') || 'USD';
};

const Settings = () => {
    // Currency state for settings
    const [currency, setCurrency] = useState(getInitialCurrency());
    const [availableCurrencies, setAvailableCurrencies] = useState(['USD']);

    // Fetch available currencies
    useEffect(() => {
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(res => res.json())
        .then(data => {
          setAvailableCurrencies(Object.keys(data.rates));
   useEffect(() => {
     api
       .get("http://127.0.0.1:8000/api/user-profile/")
       .then((response) => {
         setFormData({
           ...formData,
           first_name: response.data.first_name,
           last_name:  response.data.last_name,
           email: response.data.email,
           country: response.data.country
         });
         if (response.data.currency) {
           setCurrency(response.data.currency);
           localStorage.setItem('userCurrency', response.data.currency);
         }
       })
       .catch((error) => console.error(error));
   }, []);
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [country, setCountry] = useState("");
  const countryList = countries.getNames("en");

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'security'

  useEffect(() => {
    api
      .get("http://127.0.0.1:8000/api/user-profile/")
      .then((response) => {
        console.log("Data here", response.data);
        setFormData({
          ...formData,
          first_name: response.data.first_name,
          last_name:  response.data.last_name,
          email: response.data.email,
          country: response.data.country
        });
      })
      .catch((error) => console.error(error));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
  
    api
      .put(
        "http://127.0.0.1:8000/api/update-profile/",
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          country: formData.country
        }
      )
      .then((response) => {
        setMessage(response.data.message);
        setMessageType("success");
      })
      .catch((error) => {
        setMessage("Failed to update profile.");
        setMessageType("error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    api
      .put(
        "http://127.0.0.1:8000/api/update-password/",
        {
          old_password: formData.oldPassword,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword
        }
      )
      .then((response) => {
        setMessage(response.data.message);
        setMessageType("success");
        setFormData({ ...formData, oldPassword: "", newPassword: "", confirmPassword: ""});
      })
      .catch((error) => {
        setMessage("Failed to update password.");
        setMessageType("error");
      })
      .finally(() => {
        setPasswordLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert message={message} messageType={messageType} onClear={() => setMessage(null)} />
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-mint-green bg-opacity-10 p-3 rounded-lg">
              <FiSettingsIcon className="text-mint-green w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Currency Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><FiGlobe className="text-mint-green" />Currency Preference</h2>
          <p className="text-sm text-gray-600 mb-4">Choose your preferred currency for all prices and payments. This will be used everywhere in your account.</p>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {availableCurrencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-mint-green text-mint-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiUser className="w-5 h-5" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "security"
                    ? "border-mint-green text-mint-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiShield className="w-5 h-5" />
                Security
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" ? (
              /* Profile Information Form */
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="text-mint-green" />
                    Personal Details
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Update your personal information and contact details
                  </p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="first_name">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400 w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="last_name">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400 w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400 w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Country Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="country">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiGlobe className="text-gray-400 w-5 h-5" />
                    </div>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select your country</option>
                      {Object.entries(countryList).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-mint-green text-white rounded-lg hover:bg-teal-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Security/Password Form */
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiShield className="text-mint-green" />
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Ensure your account is using a strong password to stay secure
                  </p>
                </div>

                {/* Password Fields */}
                <div className="space-y-6">
                  {/* Old Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="oldPassword">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400 w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                        placeholder="Enter your current password"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="newPassword">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400 w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                        placeholder="Enter your new password"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCheckCircle className="text-gray-400 w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-green focus:border-transparent"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Password Security Tips</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Use a mix of uppercase and lowercase letters</li>
                    <li>• Include numbers and special characters</li>
                    <li>• Avoid using personal information</li>
                    <li>• Don't reuse passwords from other accounts</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-mint-green text-white rounded-lg hover:bg-teal-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiShield className="w-5 h-5" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
