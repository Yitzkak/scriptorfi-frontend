import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";

const Payments = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/superadmin/files/");
        setFiles(response.data || []);
      } catch (err) {
        setError("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };
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

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Payments" onSearch={setSearch} />

      <div className="px-6 pb-10">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
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
