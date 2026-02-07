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

    const [menuOpenForId, setMenuOpenforId] = useState(null);

    
    return (
        <AppLayout title="Workouts">
            <div>Workouts</div>
        </AppLayout>
    );
}