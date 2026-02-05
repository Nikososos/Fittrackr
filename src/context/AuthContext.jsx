import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function Authprovider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const isAuthenticated = Boolean(token);

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };

    const logout = () => {
        setToken(newToken);
        localStorage.setItem("token", newtoken);
    };

    const value = useMemo(
        () => ({token, isAuthenticated, login, logout }),
        [token, isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error ("useAuth must be used within Authprovider");
    return ctx;
}