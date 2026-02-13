import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";
import { getUsers } from "../../api/usersApi";

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

        const emailNormalized = email.trim().toLowerCase();
        const passwordNormalized = password.trim();

        if (!emailNormalized || !passwordNormalized) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            setIsLoading(true);

            const data = await loginRequest({
                email: emailNormalized,
                password: passwordNormalized,
            });

            const token = data.token || data.accessToken || data.jwt;
            if (!token) throw new Error("No token received from server");

            const users = await getUsers({ token });
            const userList = Array.isArray(users) ? users : users?.data || [];

            const me = userList.find(
                (u) => (u.email ?? "").trim().toLowerCase() === emailNormalized
            );

            if (!me?.id) {
                throw new Error("Logged in, but could not read userId from token.");
            }
            //Token
            console.log("FOUND USER", me);
            login(token, me.id);
            console.log("Saved userId", localStorage.getItem("userId"));

            //Navigeer naar dashboard na login
            navigate("/");
        }   catch (err) {
            console.error("LOGIN ERROR: ", err);
            setError(err?.message || "Login failed. Please check your details");
            setError("Login failed. Please check your details");
        }   finally {
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

                    {error && <div className="errorbanner">{error}</div>}

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