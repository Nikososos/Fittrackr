import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showInfo, setShowInfo] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const emailNormalized = email.trim().toLowerCase();
        const passwordNormalized = password.trim();
        const confirmNormalized = confirmPassword.trim();

        if (!emailNormalized || !passwordNormalized || !confirmNormalized) {
            setError("Please fill in all fields.");
            return;
        }

        if (passwordNormalized !== confirmNormalized) {
            setError("Passwords do not match.");
            return;
        }

        if (passwordNormalized.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setShowInfo(true);
    }

    return (
        <div className="loginPage">
            <div className="loginCard" role="dialog" aria-label="Register">
                <h1 className="loginTitle">FitTrackr</h1>

                {showInfo ? (
                    <div className="registerInfo">
                        <p className="registerInfoText">
                            Registration is not available at this time.
                            Please use one of the demo accounts to log in.
                        </p>
                        <div className="demoAccounts">
                            <p className="demoLabel">Demo accounts:</p>
                            <code className="demoAccount">demo2@fittrackr.nl / demo123</code>
                            <code className="demoAccount">demo3@fittrackr.nl / demo456</code>
                            <code className="demoAccount">demo4@fittrackr.nl / demo789</code>
                        </div>
                        <div className="buttonRow">
                            <button
                                className="btnPrimary"
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                Go to login
                            </button>
                        </div>
                    </div>
                ) : (
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

                        {error && <div className="errorbanner">{error}</div>}

                        <div className="buttonRow">
                            <button
                                className="btnSecondary"
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                Back to login
                            </button>
                            <button
                                className="btnPrimary"
                                type="submit"
                            >
                                Register account
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

