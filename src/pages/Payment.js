import React from "react";

const Payment = () => {
  return (
    <div className="flex items-center justify-center h-[100%] bg-gray-100 ">
      <div className="relative w-full max-w-3xl p-8">
        {/* Receipt Summary */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h2>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Transcription Service</span>
            <span>$50.00</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Rush Order</span>
            <span>$20.00</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>$70.00</span>
          </div>
        </div>
        {/* Payment Form */}
        <div className="relative z-20 bg-white shadow-xl rounded-2xl p-6 w-full max-w-full border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h2>
          <form>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Cardholder Name</label>
              <input type="text" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]" placeholder="John Doe" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Card Number</label>
              <input type="text" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block text-gray-600 text-sm mb-2">Expiration Date</label>
                <input type="text" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]" placeholder="MM/YY" />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-600 text-sm mb-2">CVV</label>
                <input type="text" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FFCBE]" placeholder="123" />
              </div>
            </div>
            <button className="w-full bg-[#0FFCBE] text-white py-4 rounded-lg font-semibold hover:bg-[#0DCFA2] transition">Pay $70.00</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
