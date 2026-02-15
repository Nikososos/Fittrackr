import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function Authprovider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
    const [displayName, setDisplayName] = useState(() => localStorage.getItem("displayName"));
    const isAuthenticated = Boolean(token);

    const login = (tokenValue, userIdValue, displayNameValue ) => {
        setToken(tokenValue);
        localStorage.setItem("token", tokenValue);

        const idStr = String(userIdValue);
        setUserId(idStr);
        localStorage.setItem("userId", idStr);

        const nameStr = String(displayNameValue || "");
        setDisplayName(nameStr);
        localStorage.setItem("displayName", nameStr);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        setDisplayName(null);

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("displayName")
    };

    const value = useMemo(
        () => ({token, userId, displayName, isAuthenticated, login, logout }),
        [token, userId, displayName, isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error ("useAuth must be used within Authprovider");
    return ctx;
}