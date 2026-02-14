import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ExercisesPage from "../pages/exercises/ExercisesPage";
import WorkoutsPage from "../pages/workouts/WorkoutsPage";
import WorkoutsBuilderPage from "../pages/workouts/WorkoutsBuilderPage";
import ProgressPage from "../pages/progress/ProgressPage";
import SettingsPage from "../pages/settings/SettingsPage";
import ProtectedRoute from "../components/routing/ProtectedRoute";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route 
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/exercises"
                element={
                    <ProtectedRoute>
                        <ExercisesPage />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/workouts" 
                element={
                    <ProtectedRoute>
                        <WorkoutsPage />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/workouts/:id" 
                element={
                    <ProtectedRoute>
                        <WorkoutsBuilderPage />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/progress"
                element={
                    <ProtectedRoute>
                        <ProgressPage />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/settings" 
                element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}