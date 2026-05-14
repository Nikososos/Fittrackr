import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { noviFetch } from "../../api/noviClient";
import "./RegisterPage.css";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("")

        const emailNormalized = email.trim().toLowerCase();
        const passwordNormalized = password.trim();
        const confirmNormalized = confirmPassword.trim();

        //* checks if all fields are filledin
        if (!emailNormalized || !passwordNormalized || !confirmNormalized) {
            setError("Please fill in all fields.");
            return;
        }

        //* Checks if password and verify password fields are the same
        if (passwordNormalized !== confirmNormalized) {
            setError("Passwords do not match.");
            return;
        }

        //* Checks if password is correct length
        if (passwordNormalized.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setIsLoading(true);

            await noviFetch("/api/register", {
                method: "POST",
                body: {
                    email: emailNormalized,
                    password: passwordNormalized,
                },
            });

            navigate("/login");
        } catch (err) {
            console.error("REGISTER ERROR:", err);
            const message = err?.message || "";
            if (message.toLowerCase().includes("already")) {
                setError("This email address is already in use.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }
        
    return (
        <div className="loginPage">
            <div className="loginCard" role="dialog" aria-label="Register">
                <h1 className="loginTitle">FitTrackr</h1>

                <form className="loginForm" onSubmit={handleSubmit}>
                    <label className="fieldLabel" htmlFor="email">
                        Email Adress
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
                        autoComplete="new-password"
                    />

                    <label className="fieldLabel" htmlFor="confirmPassword">
                        Verify Password
                    </label>
                    <input
                        id="confirmPassword"
                        className="textInput"
                        type="password"
                        placeholder="*******"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                    />

                    {error && <div className="errobanner">{error}</div>}

                    <div className="buttonRow">
                        <button
                            className="btnSecondary"
                            type="button"
                            onClick={() => Navigate("/login")}
                        >
                            Back to login
                        </button>
                        <button
                            className="btnPrimary"
                            type="button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Registering..." : "Register account"}
                        </button>
                    </div>
                </form>
            </div>    
        </div>
    );
}
