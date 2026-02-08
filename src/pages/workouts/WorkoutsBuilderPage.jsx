import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import ExerciseBrowserPanel from "../../components/exercises/ExerciseBrowserPanel";
import ExerciseBrowserItem from "../../components/exercises/ExerciseBrowserItem";
import "./WorkoutsBuilderPage.css";
import ExercisesPage from "../exercises/ExercisesPage";

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

    function updateSetField(workoutExerciseID, setId, field, value) {
        setWorkoutExercises((prev) => 
            prev.map((we) => {
                if (we.id !== workoutExerciseID) return we;
                return {
                    ...we,
                    sets: we.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
                };
            })
        );
    }
    
    function handleSave() {
        //PUT/PATCH to backend comes here

        const payload = {
            workoutId,
            workoutName,
            exercises: workoutExercises,
        };
        console.log("SAVE WORKOUT payload:", payload);
        alert("Saved (demo). Check console for payload.");
    }

    return (
        <AppLayout>
            <div className="wbPage">
                <div className="wbHeader">
                    <div>
                        <div className="wbSmall">Workout</div>
                        <input
                            className="wbTitleInput"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            placeholder="Workout Name"
                        />
                    </div>

                    <button className="primaryBtn" onClick={handleSave}>
                        Save Workout
                    </button>
                </div>

                <div className="wbGrid">
                    {/* LEFT: workout editor */}
                    <section className="wbEditor">
                        {workoutExercises.length === 0 ? (
                            <div className="emptyState">
                                <h2>No exercises yet</h2>
                                <p>Add exercises from the right panel to build your workout.</p>
                            </div>
                        ) : (
                            <div className="exerciseCards">
                                {workoutExercises.map((we) => (
                                    <div key={we.id} className="exerciseCard">
                                        <div className="exerciseCardHeader">
                                            <h3 className="exerciseName">{we.name}</h3>
                                            <button
                                                className="dangerBtn"
                                                onClick={() => removeExercises(we.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="setsTable">
                                            <div className="setsHead">
                                                <div>Set</div>
                                                <div>Weight</div>
                                                <div>Reps</div>
                                                <div></div>
                                            </div>

                                            {we.sets.map((s, idx) => (
                                                <div key={s.id} className="setsRow">
                                                    <div className="setNumber">{idx + 1}</div>

                                                    <input
                                                        className="setInput"
                                                        value={s.weight}
                                                        onChange={(e) =>
                                                            updateSetField(we.id, s.id, "weight", e.target.value)
                                                        }
                                                        placeholder="kg"
                                                        inputMode="decimal"
                                                    />

                                                    <input
                                                        className="setInput"
                                                        value={s.reps}
                                                        onChange={(e) => 
                                                            updateSetField(we.id, s.id, "reps", e.target.value)
                                                        }
                                                        placeholder="reps"
                                                        inputMode="numeric"
                                                    />

                                                    <button
                                                        className="iconBtn"
                                                        onClick={() => removeSet(we.id, s.id)}
                                                        aria-label="Remove set"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="secondaryBtn" onClick={() => addSet(we.id)}>
                                            + Add set
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Right side: Browse Exercises */}
                    <ExerciseBrowserPanel
                        searchValue={search}
                        onSearchChange={setSearch}
                        title="Browse Exercises"
                    >
                        {filteredLibrary.map((ex) => (
                            <ExerciseBrowserItem
                                key={ex.id}
                                text={ex.name}
                                right="+"
                                onClick={() => addExcerciseToWorkout(ex)}
                            />
                        ))}
                    </ExerciseBrowserPanel>
                </div>
            </div>
        </AppLayout>
    );
}