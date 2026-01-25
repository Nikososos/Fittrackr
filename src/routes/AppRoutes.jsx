import { Routes, Route } from "react-router-dom";
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
            <route path="/login" element={<LoginPage />} />
            <route path="/" element={<DashboardPage />} />
            <route path="/exercises" element={<ExcercisesPage />} />
            <route path="/workouts" element={<WorkoutsPage />} />
            <route path="/workouts/:id" element={<WorkoutsBuilderPage />} />
            <route path="/progress" element={<ProgressPage />} />
            <route path="/settings" element={<SettingsPage />} />
        </Routes>
    );
}