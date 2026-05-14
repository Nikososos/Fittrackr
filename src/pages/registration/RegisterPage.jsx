import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { noviFetch } from "../../api/noviClient";
import "/RegisterPage.css";

export default function RegisterPage() {
    return (
        <div className="loginPage">
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

                
            </form>
        </div>
    )
}
