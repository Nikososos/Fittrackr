import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import "./WorkoutsPage.css";

export default function WorkoutsPage() {
    const navigate = useNavigate();

    // Demo data 
    const [workouts, setWorkouts] = useState ([
        { id: "w1", name: "Upperbody" },
        { id: "w2", name: "Lowerbody" },
    ]);

    const [menuOpenForId, setMenuOpenForId] = useState(null);

    const hasWorkouts = workouts.length > 0;

    function handleStartNew() {
        const newWorkout = {
            id: crypto.randomUUID(),
            name: "New workout",
        };
        setWorkouts((prev) => [newWorkout, ...prev]);
    }
    return (
        <AppLayout title="Workouts">
            <div className="workoutsPage">
                <div className="workoutsHeader">
                    <h1 className="pageTitle">Workouts</h1>
                    <button className="primaryBtn" onClick={handleStartNew}>
                        Start new workout
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}