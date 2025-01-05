import { createContext, useContext, useState } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Store user info here


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
