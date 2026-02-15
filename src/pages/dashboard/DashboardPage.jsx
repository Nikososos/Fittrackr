import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getWorkoutCompletions } from "../../api/workoutcompletionsApi";
import "./DashboardPage.css";

function formatLongDate(iso) {
    if (!iso) return "-";
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("en", { day: "2-digit", month: "long", year: "numeric" });
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { token, userId } = useAuth();
    const { displayName } = useAuth();

    const [completions, setCompletions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token || !userId) return;

        async function load() {
            try {
                setError("");
                setIsLoading(true);

                const res = await getWorkoutCompletions({ token, userId });
                const list = Array.isArray(res) ?res : res?.data || [];
                setCompletions(list);
            }   catch(e) {
                console.error(e)
                setError("Could not load dashboard stats.")
            }   finally {
                setIsLoading(false);
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