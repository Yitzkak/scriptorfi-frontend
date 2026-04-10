import { createContext, useContext, useState } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Helper to get initial user from localStorage
const getInitialUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
};

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser); // Restore user from localStorage on init


    const login = (userData) => {
        setUser(userData); // Update user state with userData
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null); // Clear user state
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
