import { useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout"
import "./ExcercisesPage.css"

export default function ExcercisesPage() {

    const selectedExercise =
        EXERCISES.find((e) => e.id === selectedId) || filteredExercises[0] || null;
    return (
        <AppLayout title="Excercises">
            <div className="exercisesPage">
                <div className="exDetail">
                    <h1 className="PageTitle">Exercises</h1>

                    
                </div>
            </div>
        </AppLayout>
    );
}