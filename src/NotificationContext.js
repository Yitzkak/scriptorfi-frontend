import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

    return (
        <NotificationContext.Provider value={{ unreadNotificationsCount, setUnreadNotificationsCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use the NotificationContext
export const useNotifications = () => {
    return useContext(NotificationContext);
};
