import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNotifications } from "../NotificationContext";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const { unreadNotificationsCount, setUnreadNotificationsCount } = useNotifications();
    

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get("http://localhost:8000/api/notifications/");
                setNotifications(response.data);
                setUnreadNotificationsCount(response.data.filter((notif) => !notif.read).length);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.post(`http://localhost:8000/api/notifications/${id}/read/`, {});
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
            setUnreadNotificationsCount((prev) => prev - 1);
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            {notifications.length > 0 ? (
                notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-2 mb-2 rounded ${notif.read ? "bg-gray-100" : "bg-blue-100"}`}
                    >
                        <p>{notif.message}</p>
                        {!notif.read && (
                            <button
                                className="text-sm text-blue-500"
                                onClick={() => markAsRead(notif.id)}
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <p>No notifications</p>
            )}
        </div>
    );
};

export default Notifications;
