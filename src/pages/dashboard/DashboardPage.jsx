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

    const exerciseNameById = useMemo(() => {
        const m = new Map();
        (exercises || []).forEach((ex) => m.set(String(ex.id), ex.name));
        return m;
    },  [exercises]);

    const { lastWorkoutISO, workoutsThisYear } = useMemo(() => {
        const now = new Date()
        const thisYear = now.getFullYear();

        let countYear = 0;
        let latest = null;

        for (const c of completions) {
            const iso = toDateOnlyISO(c.date);
            if (!iso) continue;

            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) continue;

            if (d.getFullYear() === thisYear) countYear += 1;
            if (!latest || d > latest) latest = d;
        }

        return { 
            lastWorkoutISO: latest ? toDateOnlyISO(latest.toISOString()) : null,
            workoutsThisYear: countYear,
        };
    },  [completions]);

    // Strongest lift Highlight
    const StrongestLift = useMemo(() => {
        let best = null;

        for (const c of completions) {
            const value = Number(c.bestValue ?? 0);
            if (!value) continue;

            if (!best || value > Number(best.bestValue ?? 0)) {
                best = c;
            }
        }

        if (!best) return { label: "-", value: "-"};
        
        const exName =
            best.bestExerciseId != null
                ? exerciseNameById.get(String(best.bestExerciseId)) || `Exercise ${best.bestExerciseId}`
                : "Exercise";
        
        return {
            label: exName,
            value: `${Number(best.bestValue)} kg`,
        };
    },  [completions, exerciseNameById]);

    // This month vs last month calculation
    const monthComparison = useMemo (() => {
        const now = new Date();
        const thisMonthKey = yearMonthKey(now);

        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthKey = yearMonthKey(prev);

        let thisMonth = 0;
        let lastMonth = 0;

        for (const c of completions) {
            const iso = toDateOnlyISO(c.date);
            if (!iso) continue;

            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) continue;

            const key = yearMonthKey(d);
            if (key === thisMonthKey) thisMonth += 1;
            if (key === lastMonthKey) lastMonth += 1;
        }

        const diff = thisMonth - lastMonth;
        const diffLabel = diff === 0 ? "No change" : diff > 0 ? `+${diff}` : `${diff}`;

        return { thisMonth, lastMonth, diffLabel };
    },  [completions]);
    
    return (
        <AppLayout title="Home">
            <div className="dashboardGrid">

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
                            {formatPrettyDate(lastWorkoutISO)}
                        </span>
                    </div>

                    <div className="statCard">
                        <span className="statLabel">Total workouts this year:</span>
                        <span className="statValue">
                            {workoutsThisYear}
                        </span>
                    </div>
                </div>

                <div className="statsRow">
                    <div className="statCard">
                        <span className="statLabel">Strongest lift:</span>
                        <span className="statValue">
                            {StrongestLift.label} ({StrongestLift.value})
                        </span>
                    </div>

                    <div className="statCard">
                        <span className="statLabel">This month vs last month</span>
                        <span className="statValue">
                            {monthComparison.thisMonth} vs {monthComparison.lastMonth} ({monthComparison.diffLabel})
                        </span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}