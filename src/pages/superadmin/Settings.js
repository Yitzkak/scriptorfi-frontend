import React from "react";
import AdminTopbar from "../../components/superadmin/AdminTopbar";

const Settings = () => {
  return (
    <div className="min-h-screen">
      <AdminTopbar title="Settings" />

      <div className="px-6 pb-10">
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-900">Workspace settings</h2>
          <p className="text-sm text-gray-500 mt-1">Basic configuration for operations.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Support email</label>
              <input
                type="email"
                value="support@scriptorfi.com"
                disabled
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Base transcription rate</label>
              <input
                type="text"
                value="$0.50 / min"
                disabled
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment providers</label>
              <input
                type="text"
                value="PayPal, Paystack"
                disabled
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            To update these settings, change backend environment variables and redeploy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
