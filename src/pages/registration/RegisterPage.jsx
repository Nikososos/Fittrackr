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
                        autocomplete="email"
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
                        autocomplete="new-password"
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
                        onChange={(e) => setEmail(e.target.value)}
                        autocomplete="new-password"
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
