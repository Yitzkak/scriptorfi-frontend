import React, { useState, useEffect } from "react";
import axios from "axios";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import api from "../api/api";
import Alert from "../components/ui/Alert";

countries.registerLocale(enLocale);

const Settings = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [country, setCountry] = useState("");
  const countryList = countries.getNames("en");

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

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
    setLoading(true);

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
        setLoading(false);
      });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <Alert message={message} messageType={messageType} onClear={() => setMessage(null)} />
          <form onSubmit={handleProfileUpdate} className="mb-6 bg-white p-8 shadow rounded">
            <h2 className="text-xl font-semibold mb-3">Profile Information</h2>
            <div className="flex w-full mb-4">
              <div className="w-1/2 mr-2">
                <label className="block text-sm font-medium mb-1" htmlFor="username">
                  First name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className=" p-3 border rounded w-full"
                />
              </div>
              <div className="w-1/2 ml-2">
              <label className="block text-sm font-medium mb-1" htmlFor="username">
                  Last name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded"
                />
              </div>
              
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="country">
                Country
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-3 border rounded"
              >
                <option value="">--Choose a country--</option>
                {Object.entries(countryList).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <form onSubmit={handlePasswordUpdate} className="mb-6 bg-white p-8 shadow rounded">
            <h2 className="text-xl font-semibold mb-3">Change Password</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="oldPassword">
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-3 bg-green-500 text-white rounded"
              disabled={loading}
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
