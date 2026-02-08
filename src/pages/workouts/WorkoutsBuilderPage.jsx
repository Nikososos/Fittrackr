import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import "./WorkoutsBuilderPage.css";
import ExcercisesPage from "../exercises/ExcercisesPage";

// Dummy data used, connect to db later//

const EXERCISE_LIBRARY = [
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
    const [workoutName, setWorkoutName ] = useState ("Upperbody");
    const [workoutExercises, setWorkoutExercises] = useState([
        createWorkoutExercise(EXERCISE_LIBRARY[0]),
        createWorkoutExercise(EXERCISE_LIBRARY[1]),
    ]);


    // Browse panel state
    const [search, setSearch] = useState("");

    const filteredLibrary = useMemo (() => {
        const q = search.toLowerCase().trim();
        if (!q) return EXERCISE_LIBRARY;
        return EXERCISE_LIBRARY.filter((e) => e.name.toLowerCase().includes.apply(q));
    }, [search]);

    function addExcerciseToWorkout(exercise) {
        setWorkoutExercises((prev) => {
            return [...prev, createWorkoutExercise(exercise)];
        });
    }

    function removeExercises(workoutExerciseId) {
        setWorkoutExercises((prev) => prev.filter((we) => we.id !== workoutExerciseId));
    }

    function addSet(workoutExerciseId) {
        setWorkoutExercises((prev) => 
            prev.map((we) => 
                we.id === workoutExerciseId
                    ? { ...we, sets: [...we.sets, createSet()] }
                    : we 
            )
        );
    }

    function removeSet(workoutExerciseId, setId) {
        setWorkoutExercises((prev) =>
            prev.map((we) => {
                if (we.id !== workoutExerciseID) return we;
                if (we.sets.length <= 1) return we; //keep at least 1 set
                return { ...we, sets: we.sets.filter((s) => s.id !== setId) };
            })
        );
    }

    function 
}