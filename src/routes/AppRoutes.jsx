import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ExcercisesPage from "../pages/exercises/ExcercisesPage";
import WorkoutsPage from "../pages/workouts/WorkoutsPage";
import WorkoutsBuilderPage from "../pages/workouts/WorkoutsBuilderPage";
import ProgressPage from "../pages/progress/ProgressPage";
import SettingsPage from "../pages/settings/SettingsPage"

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<DashboardPage />} />
            <Route path="/exercises" element={<ExcercisesPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}