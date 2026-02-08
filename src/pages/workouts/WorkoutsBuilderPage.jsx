import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import "./WorkoutsBuilderPage.css";
import ExcercisesPage from "../exercises/ExcercisesPage";

// Dummy data used, connect to db later//

const EXCERCISE_LIBRARY = [
    { id: "ex1", name: "Bench Press (Barbell)" },
    { id: "ex2", name: "Dumbell Curl" },
    { id: "ex3", name: "Seated Cable Row" },
    { id: "ex4", name: "Lat Pulldown" },
    { id: "ex5", name: "Shoulder Press" },
];

function createSet() {
    return { id: crypto.randomUUID(), weigth: "", reps: "" };
}

function createWorkoutExercise(exercise) {
    return {
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        name: exercise.name,
        sets: [createSet(), createSet(), createSet()],
    };
}

export default function WorkoutsBuilderPage() {
    const { id: workoutId } = useParams();

    // To solve issues now use local workout state (fetch later through backend using workoutId)


}