import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

            //Later hierbij terugkomen om aan te passen met backend call voor nu dummy code
            await new Promise((r) => setTimeout(r, 600));

            //Neppe token
            login("demo-token-123");

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

                </form>

            </div>

        </div>
    )
}