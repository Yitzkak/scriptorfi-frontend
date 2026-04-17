import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";
import { FiTrash2 } from "react-icons/fi";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/superadmin/users/");
      setUsers(response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) => {
      const haystack = `${user.email || ""} ${user.username || ""} ${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [users, search]);

  const deleteUser = async (user) => {
    const label = user.email || user.username || `user #${user.id}`;
    const confirmed = window.confirm(`Delete ${label}? This also deletes the user's uploaded audio files and transcripts.`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(user.id);
      await api.delete(`/api/superadmin/users/${user.id}/delete/`);
      setUsers((prev) => prev.filter((entry) => entry.id !== user.id));
      setError("");
    } catch (err) {
      const detail = err.response?.data?.error || "Failed to delete user.";
      setError(detail);
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Users" onSearch={setSearch} />

      <div className="px-6 pb-10">
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Refresh users
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Files</th>
                  <th className="px-4 py-3 text-left">Pending</th>
                  <th className="px-4 py-3 text-left">Total Spend</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{user.email || user.username}</div>
                        <div className="text-xs text-gray-500">{`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {user.is_super_admin ? "Super Admin" : user.is_staff ? "Staff" : "Customer"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">{user.file_count}</td>
                      <td className="px-4 py-4 text-gray-700">{user.pending_files}</td>
                      <td className="px-4 py-4 text-gray-700">${Number(user.total_spend || 0).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <button
                          disabled={deletingUserId === user.id}
                          onClick={() => deleteUser(user)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          <FiTrash2 size={12} />
                          {deletingUserId === user.id ? "Deleting..." : "Delete"}
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

export default Users;
