import React, { useState } from "react";
import { Mail } from "lucide-react";
import api from "../api/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/api/contact/", formData);
      setStatus({ type: "success", message: "Message sent successfully." });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      const fallbackMessage = "Unable to send message. Please try again.";
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        fallbackMessage;
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Contact</p>
          <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Get in touch</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions or need support? Send us a note and we’ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold">Email us</p>
                <p className="text-gray-600">support@scriptorfi.com</p>
                <p className="mt-3 text-sm text-gray-500">We typically respond within 1 business day.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-medium">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="johndoe@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="4"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>
              {status.message && (
                <p
                  className={`text-sm ${
                    status.type === "success" ? "text-teal-600" : "text-red-600"
                  }`}
                >
                  {status.message}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
