import React, { useState } from "react";
import api from "../api/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/api/auth/password-reset/", { email });
      setStatus({
        type: "success",
        message: "If that email exists, a reset link has been sent.",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Unable to send reset link. Please try again.";
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Password Reset</p>
          <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Forgot your password?</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Enter your email and we’ll send a password recovery link.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Request reset link</h2>
          <p className="mt-2 text-sm text-gray-600">We’ll email you a secure link to reset your password.</p>

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
            {status.message && (
              <p
                className={`text-sm ${status.type === "success" ? "text-teal-600" : "text-red-600"}`}
              >
                {status.message}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-teal-500 py-3 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
