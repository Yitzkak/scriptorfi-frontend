import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const executePayment = async () => {
      const paymentId = searchParams.get("paymentId") || sessionStorage.getItem("paypal_payment_id");
      const payerId = searchParams.get("PayerID");
      const fileId = sessionStorage.getItem("paypal_file_id");

      if (!paymentId || !payerId || !fileId) {
        setStatus("error");
        setMessage("Missing payment information");
        return;
      }

      try {
        const response = await api.post("http://localhost:8000/api/payment/execute/", {
          payment_id: paymentId,
          payer_id: payerId,
          file_id: fileId,
        });

        setStatus("success");
        setMessage(response.data.message || "Payment successful!");
        
        // Clear session storage
        sessionStorage.removeItem("paypal_file_id");
        sessionStorage.removeItem("paypal_payment_id");

        // Redirect to transcriptions after 3 seconds
        setTimeout(() => {
          navigate("/dashboard/my-transcriptions");
        }, 3000);
      } catch (error) {
        console.error("Payment execution error:", error);
        setStatus("error");
        setMessage(error.response?.data?.error || "Payment failed");
      }
    };

    executePayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to your transcriptions...</p>
          </>
        )}

        {status === "error" && (
          <>
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/dashboard/my-transcriptions")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Transcriptions
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
