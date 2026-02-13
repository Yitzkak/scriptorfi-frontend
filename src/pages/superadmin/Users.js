import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";

const Users = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get("/api/superadmin/files/");
        setFiles(response.data || []);
      } catch (err) {
        setError("Failed to load users.");
      }
    };
    fetchFiles();
  }, []);

  const users = useMemo(() => {
    const map = new Map();
    files.forEach((file) => {
      const key = file.user?.email || file.user?.username || "Anonymous";
      const current = map.get(key) || { email: key, files: 0, total: 0, pending: 0 };
      current.files += 1;
      current.total += Number(file.total_cost || 0);
      if (file.status !== "Completed") current.pending += 1;
      map.set(key, current);
    });
    return Array.from(map.values());
  }, [files]);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) => !term || user.email.toLowerCase().includes(term));
  }, [users, search]);

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Users" onSearch={setSearch} />

      <div className="px-6 pb-10">
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Files</th>
                  <th className="px-4 py-3 text-left">Pending</th>
                  <th className="px-4 py-3 text-left">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.email} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{user.email}</td>
                      <td className="px-4 py-4 text-gray-700">{user.files}</td>
                      <td className="px-4 py-4 text-gray-700">{user.pending}</td>
                      <td className="px-4 py-4 text-gray-700">${user.total.toFixed(2)}</td>
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

export default Users;
