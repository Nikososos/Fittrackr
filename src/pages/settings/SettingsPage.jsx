import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import "./SettingsPage.css";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Demo data, (later connect with Auth token from backend)
    const [email] = useState("user@email.com");

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function handleChangeEmail() {
        alert("Open change email modal/form later");
    }

    function handleChangePassword() {
        alert("Open change password modal/form")
    }

    return (
        <AppLayout title="Settings">
            <div className="settingsPage">
                <h1 className="pageTitle">Settings</h1>

                <div className="settingsCard">
                    <div className="settingsRow">
                        <div className="settingsLabel">Email</div>
                        <div className="settingsValue">{email}</div>
                        <button className="secondaryBtn" onClick={handleChangeEmail}>
                            Change Email
                        </button>
                    </div>

                    <div className="settingsRow">
                        <div className="settingsLabel">Password</div>
                        <div className="settingsValue">**********</div>
                        <button className="secondaryBtn" onClick={handleChangePassword}>
                            Change Password
                        </button>
                    </div>
                </div>

                <button className="logoutBtn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </AppLayout>
    );
}