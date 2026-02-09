import { useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import "./ProgressPage.css"

// Dummy data to work with now, later replace with backend
const PROGRESS_BY_DATE = {
    "2026-02-05": {
        workoutName: "Upperbody",
        personalBest: "Bench Press (70kg)",
    },
    "2026-02-12": {
        workoutName: "Lowerbody",
        personalBest: "Squat (140kg)",
    },
    "2026-02-18": {
        workoutName: "Upperbody",
        personalBest: "Overhead Press (45kg)"
    }
};

// Turns number in 2 digit string for ISO date
function pad2(n) {
    return String(n).padStart(2, "0");
}

export default function ProgressPage() {
    return (
        <AppLayout title="Home">
            <div>Progress</div>
        </AppLayout>
    );
}