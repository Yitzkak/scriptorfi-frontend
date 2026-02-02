import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import Alert from "../components/ui/Alert";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fileDetails, setFileDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  // Get file details from navigation state
  useEffect(() => {
    if (location.state && location.state.fileData) {
      setFileDetails(location.state.fileData);
    } else {
      setMessage("No file data found. Please upload a file first.");
      setMessageType("error");
      setTimeout(() => navigate("/dashboard/upload-files"), 3000);
    }
  }, [location.state, navigate]);

  // Handle PayPal payment creation
  const handlePayPalPayment = async () => {
    if (!fileDetails) return;

    setLoading(true);
    try {
      const response = await api.post("http://localhost:8000/api/payment/create/", {
        file_id: fileDetails.id,
        return_url: `${window.location.origin}/dashboard/payment/success`,
        cancel_url: `${window.location.origin}/dashboard/payment/cancel`,
      });

      // Redirect to PayPal approval URL
      if (response.data.approval_url) {
        // Store file_id and payment_id in sessionStorage for callback
        sessionStorage.setItem("paypal_file_id", fileDetails.id);
        sessionStorage.setItem("paypal_payment_id", response.data.payment_id);
        
        // Redirect to PayPal
        window.location.href = response.data.approval_url;
      }
    } catch (error) {
      console.error("Payment creation error:", error);
      setMessage(error.response?.data?.error || "Failed to create payment");
      setMessageType("error");
      setLoading(false);
    }
  };

  if (!fileDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Alert
        message={message}
        messageType={messageType}
        onClear={() => setMessage(null)}
      />
      
      <div className="relative w-full max-w-3xl">
        {/* Order Summary */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>File Name:</span>
              <span className="font-medium">{fileDetails.name}</span>
            </div>
            
            <div className="flex justify-between text-gray-600">
              <span>Duration:</span>
              <span>{Math.ceil(parseFloat(fileDetails.size) / 60)} minutes</span>
            </div>

            {fileDetails.verbatim === "Yes" && (
              <div className="flex justify-between text-gray-600">
                <span>Verbatim Transcription:</span>
                <span>Included</span>
              </div>
            )}

            {fileDetails.rush_order === "Yes" && (
              <div className="flex justify-between text-gray-600">
                <span>Rush Order (24hr delivery):</span>
                <span>Included</span>
              </div>
            )}

            {fileDetails.timestamp === "Yes" && (
              <div className="flex justify-between text-gray-600">
                <span>Timestamps & Speaker IDs:</span>
                <span>Included</span>
              </div>
            )}

            <div className="border-t pt-3 mt-3 flex justify-between font-semibold text-lg">
              <span>Total Amount:</span>
              <span className="text-green-600">${fileDetails.total_cost}.00</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="relative z-20 bg-white shadow-xl rounded-2xl p-6 w-full border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
          
          <div className="space-y-4">
            {/* PayPal Payment Button */}
            <button
              onClick={handlePayPalPayment}
              disabled={loading}
              className="w-full bg-[#0070ba] text-white py-4 rounded-lg font-semibold hover:bg-[#005ea6] transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.905 9.5c.13-1.164-.082-1.957-.665-2.54-.583-.584-1.543-.84-2.707-.84H11.05c-.387 0-.72.28-.78.663l-2.295 14.49c-.046.29.175.553.467.553h3.396l.853-5.388-.027.168c.06-.383.388-.663.78-.663h1.622c3.188 0 5.683-1.295 6.412-5.04.025-.122.043-.24.06-.357.23-1.474.002-2.477-.633-3.046z"/>
                    <path d="M9.062 9.545c.036-.228.203-.42.424-.485.093-.028.192-.042.293-.042h7.48c.888 0 1.71.056 2.446.174.18.03.354.062.524.098.17.036.335.075.496.118.08.022.16.044.238.068.473.142.895.328 1.26.56.13-1.165-.082-1.958-.665-2.54-.583-.585-1.543-.84-2.707-.84H11.05c-.387 0-.72.28-.78.663L8.078 21.273c-.046.29.175.553.467.553h3.396l.853-5.388z"/>
                  </svg>
                  Pay with PayPal
                </>
              )}
            </button>

            {/* Info Text */}
            <p className="text-sm text-gray-500 text-center">
              You'll be redirected to PayPal to complete your payment securely.
            </p>

            {/* Cancel Button */}
            <button
              onClick={() => navigate("/dashboard/upload-files")}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
