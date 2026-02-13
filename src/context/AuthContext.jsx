import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function Authprovider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
    const isAuthenticated = Boolean(token);

    const login = (tokenValue, userIdValue) => {
        setToken(tokenValue);
        localStorage.setItem("token", tokenValue);

        const idStr = String(userIdValue);
        setUserId(idStr);
        localStorage.setItem("userId", idStr);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
    };

    const value = useMemo(
        () => ({token, userId, isAuthenticated, login, logout }),
        [token, userId, isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error ("useAuth must be used within Authprovider");
    return ctx;
}