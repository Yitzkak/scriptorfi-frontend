import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";
import { FiTrash2 } from "react-icons/fi";

const Payments = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/superadmin/files/");
      setFiles(response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    const term = search.toLowerCase();
    return files.filter((file) => {
      const haystack = `${file.name} ${file.user?.email || ""} ${file.payment_status || ""}`.toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [files, search]);

  const totals = useMemo(() => {
    const paid = files.filter((f) => f.payment_status === "Paid");
    const unpaid = files.filter((f) => f.payment_status !== "Paid");
    const paidTotal = paid.reduce((sum, f) => sum + Number(f.total_cost || 0), 0);
    const unpaidTotal = unpaid.reduce((sum, f) => sum + Number(f.total_cost || 0), 0);
    return { paidTotal, unpaidTotal, paidCount: paid.length, unpaidCount: unpaid.length };
  }, [files]);

  const deletePaymentItem = async (file) => {
    const confirmed = window.confirm(`Delete ${file.name}? This removes the payment record and uploaded file.`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(file.id);
      await api.delete(`/api/superadmin/files/${file.id}/delete/`);
      setFiles((prev) => prev.filter((entry) => entry.id !== file.id));
      setError("");
    } catch (err) {
      const detail = err.response?.data?.error || "Failed to delete payment record.";
      setError(detail);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Payments" onSearch={setSearch} />

      <div className="px-6 pb-10">
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchFiles}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Refresh payments
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">${totals.paidTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{totals.paidCount} files</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-500">Unpaid</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">${totals.unpaidTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{totals.unpaidCount} files</p>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{file.name}</td>
                      <td className="px-4 py-4 text-gray-700">
                        {file.user?.email || file.user?.username || "Anonymous"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">${file.total_cost}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          file.payment_status === "Paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {file.payment_status || "Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          disabled={deletingId === file.id}
                          onClick={() => deletePaymentItem(file)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          <FiTrash2 size={12} />
                          {deletingId === file.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
