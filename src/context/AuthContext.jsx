import React, { createContext, useContext, useMemo, UseState } from "react";

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
}