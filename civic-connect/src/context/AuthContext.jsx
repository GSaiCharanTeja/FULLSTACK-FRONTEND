
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, seedIfEmpty } from '../utils/data';
import { login as authLogin, register as authRegister, logout as authLogout } from '../utils/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        seedIfEmpty();
        const user = Session.currentUser();
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);





    // ✅ TEMP LOGIN (no backend)
    const login = (email, password) => {
        // fake user (temporary)
        const user = {
            id: 1,
            name: "Test User",
            email: email,
            role: "citizen"
        };

        setCurrentUser(user);

        return { ok: true, user };
    };

    // ✅ TEMP REGISTER
    const register = (name, email, password, role, constituency) => {
        const user = {
            id: Date.now(),
            name,
            email,
            role,
            constituency
        };

        setCurrentUser(user);

        return { ok: true, user };
    };

    // ✅ LOGOUT
    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, register, logout, setCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);

}
