import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {

    // 🔥 IMPORTANT: start as undefined
    const [currentUser, setCurrentUser] = useState(undefined);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        } else {
            setCurrentUser(null);
        }
    }, []);

    // ✅ LOGIN
    const login = (userData) => {
        setCurrentUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // ✅ LOGOUT
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}