import React, { useEffect, useState } from "react";
import api from "../../api/api";
import AdminTopbar from "../../components/superadmin/AdminTopbar";
import { FiTrash2 } from "react-icons/fi";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/superadmin/notifications/");
      setNotifications(response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const deleteNotification = async (notificationId) => {
    const confirmed = window.confirm("Delete this notification?");
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(notificationId);
      await api.delete(`/api/superadmin/notifications/${notificationId}/delete/`);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      setError("");
    } catch (err) {
      const detail = err.response?.data?.error || "Failed to delete notification.";
      setError(detail);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Notifications" />

      <div className="px-6 pb-10">
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Refresh notifications
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900">Notification log</h2>
          <p className="text-sm text-gray-500 mt-1">Delete entries that are no longer useful.</p>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="flex items-start justify-between gap-4 border border-gray-200 rounded-xl p-4">
                  <div>
                    <p className="font-medium text-gray-900">{notification.message}</p>
                    <p className="text-sm text-gray-600">
                      User: {notification.user?.email || notification.user?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.created_at}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${notification.read ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-700"}`}>
                      {notification.read ? "Read" : "Unread"}
                    </span>
                    <button
                      disabled={deletingId === notification.id}
                      onClick={() => deleteNotification(notification.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
                    >
                      <FiTrash2 size={12} />
                      {deletingId === notification.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
