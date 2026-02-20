import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import api from "../api/api";
import Alert from "../components/ui/Alert";
import { FiUpload, FiCheckCircle, FiFileText } from "react-icons/fi";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const FILE_LIST_STORAGE_KEY = "checkoutFileList";
  const UPLOAD_LIST_STORAGE_KEY = "uploadExistingFiles";
  const REMOVED_LIST_STORAGE_KEY = "removedFileIds";
  const [claiming, setClaiming] = useState(false);
  const [paystackEmail, setPaystackEmail] = useState("");
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  // Currency preference comes from the user's profile; fall back to USD until it's available
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD']);

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        setAvailableCurrencies(Object.keys(data.rates));
        if (currency !== 'USD') {
          setExchangeRate(data.rates[currency] || 1);
        } else {
          setExchangeRate(1);
        }
      })
      .catch(() => {
        setAvailableCurrencies(['USD']);
        setExchangeRate(1);
      });
  }, [currency]);

  const removeFileFromSummary = async (fileId) => {
    const removedRaw = localStorage.getItem(REMOVED_LIST_STORAGE_KEY);
    const removed = removedRaw ? JSON.parse(removedRaw) : [];
    const updatedRemoved = Array.isArray(removed) ? [...new Set([...removed, fileId])] : [fileId];
    localStorage.setItem(REMOVED_LIST_STORAGE_KEY, JSON.stringify(updatedRemoved));

    const updated = fileList.filter((file) => file.id !== fileId);
    setFileList(updated);
    if (updated.length === 0) {
      localStorage.removeItem(FILE_LIST_STORAGE_KEY);
      localStorage.removeItem(UPLOAD_LIST_STORAGE_KEY);
    } else {
      localStorage.setItem(FILE_LIST_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(UPLOAD_LIST_STORAGE_KEY, JSON.stringify(updated));
    }

    try {
      await api.delete(`/api/files/${fileId}/delete/`);
      setMessage("File removed from order.");
      setMessageType("success");
    } catch (error) {
      console.error("Error removing file:", error);
      setMessage("File removed from order locally, but the server could not delete it.");
      setMessageType("error");
    }
  };

  // Get file details from navigation state, storage, or fetch by IDs
  useEffect(() => {
    const fetchFileDetails = async () => {
      const removedRaw = localStorage.getItem(REMOVED_LIST_STORAGE_KEY);
      const removed = removedRaw ? JSON.parse(removedRaw) : [];
      const removedIds = Array.isArray(removed) ? removed : [];

      if (location.state?.fileDataList) {
        const filtered = location.state.fileDataList.filter((f) => !removedIds.includes(f.id));
        setFileList(filtered);
        localStorage.setItem(FILE_LIST_STORAGE_KEY, JSON.stringify(filtered));
        setLoading(false);
      } else if (location.state?.fileData) {
        const filtered = removedIds.includes(location.state.fileData.id) ? [] : [location.state.fileData];
        setFileList(filtered);
        localStorage.setItem(FILE_LIST_STORAGE_KEY, JSON.stringify(filtered));
        setLoading(false);
      } else if (localStorage.getItem(FILE_LIST_STORAGE_KEY)) {
        try {
          const stored = JSON.parse(localStorage.getItem(FILE_LIST_STORAGE_KEY));
          if (Array.isArray(stored) && stored.length > 0) {
            const filtered = stored.filter((f) => !removedIds.includes(f.id));
            setFileList(filtered);
            localStorage.setItem(FILE_LIST_STORAGE_KEY, JSON.stringify(filtered));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing stored checkout files:", error);
        }
      } else if (location.state?.fileIds && location.state.fileIds.length > 0) {
        // Fetch file details by ID
        try {
          const response = await api.get(`/api/files/`);
          const ids = location.state.fileIds;
          const files = response.data.filter(f => ids.includes(f.id));
          if (files.length > 0) {
            setFileList(files);
            localStorage.setItem(FILE_LIST_STORAGE_KEY, JSON.stringify(files));
          } else {
            setMessage("File not found. Please upload a file first.");
            setMessageType("error");
            setTimeout(() => navigate("/upload"), 3000);
          }
        } catch (error) {
          console.error('Error fetching file:', error);
          setMessage("Failed to load file details");
          setMessageType("error");
            setTimeout(() => navigate("/upload"), 3000);
        } finally {
          setLoading(false);
        }
      } else {
        setMessage("No file data found. Please upload a file first.");
        setMessageType("error");
        setTimeout(() => navigate("/upload"), 3000);
      }
    };
    
    fetchFileDetails();
  }, [location.state, navigate]);

  useEffect(() => {
    const claimFiles = async () => {
      if (fileList.length === 0 || claiming) return;
      setClaiming(true);
      try {
        await api.post("/api/files/claim/", {
          upload_ids: fileList.map((f) => f.id),
        });
      } catch (error) {
        console.error("Error claiming files:", error);
      } finally {
        setClaiming(false);
      }
    };

    claimFiles();
  }, [fileList, claiming]);

  const handlePaystackPayment = async () => {
    if (fileList.length === 0) {
      alert("Please upload your file first.");
      return;
    }

    if (!paystackEmail) {
      setMessage("Please enter your email for Paystack payment.");
      setMessageType("error");
      return;
    }

    setPaystackLoading(true);
    try {
      const isBatch = fileList.length > 1;
      const payload = isBatch
        ? {
            file_ids: fileList.map((f) => f.id),
            callback_url: `${window.location.origin}/dashboard/payment/success`,
            email: paystackEmail,
          }
        : {
            file_id: fileList[0].id,
            callback_url: `${window.location.origin}/dashboard/payment/success`,
            email: paystackEmail,
          };

      const response = await api.post("/api/payment/paystack/initialize/", payload);

      if (response.data.authorization_url) {
        if (isBatch) {
          sessionStorage.setItem("paystack_file_ids", JSON.stringify(fileList.map((f) => f.id)));
        } else {
          sessionStorage.setItem("paystack_file_id", fileList[0].id);
        }
        if (response.data.reference) {
          sessionStorage.setItem("paystack_reference", response.data.reference);
        }
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      console.error("Payment creation error:", error);
      setMessage(error.response?.data?.error || "Failed to create payment");
      setMessageType("error");
      setPaystackLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    if (fileList.length === 0) {
      alert("Please upload your file first.");
      return;
    }

    setPaypalLoading(true);
    try {
      const isBatch = fileList.length > 1;
      const payload = isBatch
        ? {
            file_ids: fileList.map((f) => f.id),
            return_url: `${window.location.origin}/dashboard/payment/success`,
            cancel_url: `${window.location.origin}/dashboard/payment/cancel`,
          }
        : {
            file_id: fileList[0].id,
            return_url: `${window.location.origin}/dashboard/payment/success`,
            cancel_url: `${window.location.origin}/dashboard/payment/cancel`,
          };

      const response = await api.post(
        isBatch ? "/api/payment/create-batch/" : "/api/payment/create/",
        payload
      );

      if (response.data?.approval_url) {
        if (isBatch) {
          sessionStorage.setItem("paypal_file_ids", JSON.stringify(fileList.map((f) => f.id)));
        } else {
          sessionStorage.setItem("paypal_file_id", fileList[0].id);
        }
        sessionStorage.setItem("paypal_payment_id", response.data.payment_id);
        window.location.href = response.data.approval_url;
      }
    } catch (error) {
      console.error("PayPal payment creation error:", error);
      setMessage(error.response?.data?.error || "Failed to create PayPal payment");
      setMessageType("error");
      setPaypalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-mint-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (fileList.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const totalCost = fileList.reduce((sum, file) => sum + Number(file.total_cost || 0), 0);
  const totalDuration = fileList.reduce((sum, file) => sum + Number(file.size || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Alert
        message={message}
        messageType={messageType}
        onClear={() => setMessage(null)}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
          <p className="text-gray-600">Review your order and proceed with payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 bg-white shadow-sm rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiFileText className="text-mint-green" />
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {fileList.map((file) => (
                <div key={file.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {Math.ceil(parseFloat(file.size) / 60)} minutes • {file.spelling} English
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">${Number(file.total_cost || 0).toFixed(2)}</span>
                      <button
                        onClick={() => removeFileFromSummary(file.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                    {file.verbatim === "Yes" && (
                      <span className="inline-flex items-center gap-1">
                        <FiCheckCircle className="text-green-600 w-4 h-4" /> Verbatim
                      </span>
                    )}
                    {file.rush_order === "Yes" && (
                      <span className="inline-flex items-center gap-1">
                        <FiCheckCircle className="text-orange-600 w-4 h-4" /> Rush Order
                      </span>
                    )}
                    {file.timestamp === "Yes" && (
                      <span className="inline-flex items-center gap-1">
                        <FiCheckCircle className="text-green-600 w-4 h-4" /> Timestamps
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.ceil(totalDuration / 60)} minutes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-mint-green">${totalCost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Upload More Files Button */}
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  localStorage.setItem(UPLOAD_LIST_STORAGE_KEY, JSON.stringify(fileList));
                  navigate("/dashboard/upload", { state: { existingFiles: fileList } });
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <FiUpload className="w-5 h-5" />
                Upload More Files
              </button>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">PayPal Manual Transfer</p>
                <p className="text-sm text-blue-700">
                  Send your payment to billing@scriptorfi.com and include your file name(s) in the note. Once sent,
                  our team will confirm and begin processing.
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <label className="block text-sm font-medium text-gray-700">Paystack Email</label>
                <input
                  type="email"
                  value={paystackEmail}
                  onChange={(event) => setPaystackEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-green"
                />
                <button
                  onClick={handlePaystackPayment}
                  disabled={paystackLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paystackLoading ? "Processing..." : "Pay with Paystack"}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Secure card payment powered by Paystack
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <button
                  onClick={handlePayPalPayment}
                  disabled={paypalLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paypalLoading ? "Redirecting..." : "Pay with PayPal"}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Pay securely with PayPal
                </p>
              </div>

              <div className="mb-4 flex items-center gap-4">
                <label className="font-semibold">Currency:</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {availableCurrencies.map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
