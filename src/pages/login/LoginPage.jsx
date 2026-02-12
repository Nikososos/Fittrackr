import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            setIsLoading(true);

            const data = await loginRequest ({ email, password });
            console.log("LOGIN RESPONSE:", data);
            const token = data.token || data.accesToken || data.jwt;
            if (!token) throw new Error("No token received from server");

            //Token
            login(token);

            //Navigeer naar dashboard na login
            navigate("/");
        } catch (err) {
            setError("Login failed. Please check your details");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="loginPage">
            <div className="loginCard" role="dialog" aria-label="Login">
                <h1 className="loginTitle">FitTrackr</h1>

                <form className="loginForm" onSubmit={handleSubmit}>
                    <label className="fieldLabel" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        id="email"
                        className="textInput"
                        type="email"
                        placeholder="name@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />

                    <label className="fieldLabel" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        className="textInput"
                        type="password"
                        placeholder="*******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />

                    {error && <div classname="errorbanner">{error}</div>}

                    <div className="buttonRow">
                        <button className="btnPrimary" type="submit" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </button>

                        <button
                            className="btnSecondary"
                            type="button"
                            onClick={() => navigate ("/register")}
                            disabled={isLoading}
                        >
                            Register    
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}