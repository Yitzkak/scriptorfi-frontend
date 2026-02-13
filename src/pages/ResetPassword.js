import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/api/auth/password-reset/confirm/", {
        uid,
        token,
        new_password: password,
        confirm_password: confirmPassword,
      });
      setStatus({ type: "success", message: "Password reset successfully. Redirecting to sign in..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Unable to reset password. Please try again.";
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const missingParams = !uid || !token;

  return (
    <div className="bg-white">
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Password Reset</p>
          <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Set a new password</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Choose a strong password for your account.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {missingParams ? (
            <p className="text-red-600 text-sm">Invalid or missing reset link.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  placeholder="Enter a new password"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {status.message && (
                <p className={`text-sm ${status.type === "success" ? "text-teal-600" : "text-red-600"}`}>
                  {status.message}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-teal-500 py-3 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;
