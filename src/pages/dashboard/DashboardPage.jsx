import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getExercises } from "../../api/exercisesApi";
import { getWorkoutCompletions } from "../../api/workoutcompletionsApi";
import "./DashboardPage.css";

function toDateOnlyISO(value) {
    if (!value) return null;
    return String(value).slice(0, 10);
}

function formatPrettyDate(isoDate) {
    if (!isoDate) return "-";
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en", { day: "2-digit", month: "long", year: "numeric" });
}

function yearMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { token, userId } = useAuth();

    const [completions, setCompletions] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token || !userId) return;

        async function load() {
            try {
                setError("");
                
                const [cRes, eRes] = await Promise.all([
                    getWorkoutCompletions({ token, userId }),
                    getExercises({ token })
                ]);

                const cList = Array.isArray(cRes) ? cRes : cRes?.data || [];
                const eList = Array.isArray(eRes) ? eRes : eRes?.data || [];

                
                setCompletions(cList);
                setExercises(eList);
            }   catch(e) {
                console.error(e)
                setError("Could not load dashboard stats.")
            }
        }

        load();
    },  [token, userId]);

    const { countThisYear, lastWorkoutISO } = useMemo(() => {
        const year = new Date().getFullYear();

        let count = 0;
        let latest = null;

        for (const c of completions) {
            const iso = String(c.date || "");
            if (!iso) continue;

            if (iso.startsWith(`${year}-`)) count++;
            if (!latest || iso > latest) latest = iso;
        }

        return { countThisYear: count, lastWorkoutISO: latest };
    },  [completions]);
    
    return (
        <AppLayout title="Home">
            <div className="dashboardGrid">

                <h2 className="welcomeMessage">
                    Welcome
                </h2>

                <button 
                    type="button"
                    className="startWorkoutBtn"
                    onClick={() => navigate("/workouts/new")}
                >
                    Start new Workout
                </button>

                {error && <div className="errorBanner">{error}</div>}

                <div className="statsRow">
                    <div className="statCard">
                        <span className="statLabel">Date last Workout:</span>
                        <span className="statValue">
                            {isLoading? "Loading..." : formatLongDate(lastWorkoutISO)}
                        </span>
                    </div>

                    <div className="statCard">
                        <span className="statLabel">Total workouts this year:</span>
                        <span className="statValue">
                            {isLoading ? "..." : countThisYear}
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}