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
        <AppLayout title="Home">
            <div>Settings</div>
        </AppLayout>
    );
}