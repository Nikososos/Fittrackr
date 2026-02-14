import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getExercises } from "../../api/exercisesApi";
import { patchWorkout } from "../../api/workoutsApi";
import { getWorkouts } from "../../api/workoutsApi";
import { createWorkoutExercise, patchWorkoutExercise, getWorkoutExercises } from "../../api/workoutExercisesApi";
import ExerciseBrowserPanel from "../../components/exercises/ExerciseBrowserPanel";
import ExerciseFilters from "../../components/exercises/ExerciseFilters";
import ExerciseBrowserItem from "../../components/exercises/ExerciseBrowserItem";
import "./WorkoutsBuilderPage.css";


function createSet() {
    return { id: crypto.randomUUID(), weight: "", reps: "" };
}

function createWorkoutExerciseState(exercise) {
    return {
        id: crypto.randomUUID(),
        exerciseId: String(exercise.id),
        name: exercise.name,
        sets: [createSet(), createSet(), createSet()],
    };
}

export default function WorkoutsBuilderPage() {
    const { token } = useAuth();
    const { id } = useParams();

    
    const [workoutName, setWorkoutName ] = useState ("");
    const [workoutExercises, setWorkoutExercises] = useState([]);

    const [exerciseLibrary, setExerciseLibrary] = useState([]);

    const muscleGroupOptions = useMemo(() => {
        const unique = Array.from(
            new Set((exerciseLibrary || []).map((e) => e.targetMuscle).filter(Boolean))
        ).sort();

        return ["All", ...unique];
    },  [exerciseLibrary]);

    // Browse panel state
    const [muscleGroup, setMuscleGroup] = useState("All");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadExercises() {
            try {
                const data = await getExercises( { token });
                const list = Array.isArray(data) ? data : data?.data || [];
                setExerciseLibrary(list);
            }   catch (e) {
                console.error("Could not load exercises", e);
                setExerciseLibrary([]);
            }
        }

        loadExercises();
    }, [token]);

    useEffect(() => {
        if (!token || !id) return;

        async function load() {
        // 1) load workout title
        const workouts = await getWorkouts({ token });
        const w = (Array.isArray(workouts) ? workouts : []).find(
            (x) => String(x.id) === String(id)
        );
        if (w) setWorkoutName(w.title ?? "");

        // 2) load workout_exercises for this workout
        const allWE = await getWorkoutExercises({ token });
        const list = (Array.isArray(allWE) ? allWE : allWE?.data || []).filter(
            (we) => String(we.workoutId) === String(id)
        );

        // map backend rows -> UI state
        const mapped = list.map((we) => {
            let parsedSets = [];
        try {
            parsedSets = JSON.parse(we.sets || "[]");
        } catch {
            parsedSets = [];
        }

        const exMeta = exerciseLibrary.find((e) => String(e.id) === String(we.exerciseId));

        return {
            id: crypto.randomUUID(), // IMPORTANT: record id for PATCH/DELETE
            workoutExerciseId: we.workoutExerciseId, // optional
            exerciseId: Number(we.exerciseId),
            name: exMeta?.name || `Exercise ${we.exerciseId}`,
            sets: parsedSets.map((s) => ({
                id: crypto.randomUUID(),
                weight: String(s.weight ?? ""),
                reps: String(s.reps ?? ""),
            })),
        };
    });

    setWorkoutExercises(mapped);
  }

  load().catch(console.error);
}, [token, id, exerciseLibrary]);

    const filteredLibrary = useMemo (() => {
        const q = search.toLowerCase().trim();
        
        return exerciseLibrary.filter((e) => {
            const matchesSearch = e.name.toLowerCase().includes(q);
            const matchesMuscle =
                muscleGroup === "All" || e.targetMuscleGroup === muscleGroup;
            
            return matchesSearch && matchesMuscle;
        });
    }, [search, muscleGroup, exerciseLibrary]);

    function addExerciseToWorkout(exercise) {
        setWorkoutExercises((prev) => {
            const alreadyAdded = prev.some((we) => String(we.exerciseId) === String(exercise.id));
            if (alreadyAdded) return prev; // avoid duplicates
            return [...prev, createWorkoutExerciseState(exercise)];
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
                if (we.id !== workoutExerciseId) return we;
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
    
    async function handleSave() {
        try {
            const title = workoutName.trim() || "New workout";

            await patchWorkout({
                token,
                id,
                patch: { title }
            });

            const allWE = await getWorkoutExercises({ token });
            const existingList = Array.isArray(allWE) ? allWE : allWE?.data || [];
            const existing = existingList.filter((we) => String(we.workoutId) === String(id));

            for (const we of workoutExercises) {
                const setsToSave = we.sets.map((s) => ({
                    weight: Number(s.weight) || 0,
                    reps: Number(s.reps) || 0,
                }));

                const match = existing.find(
                    (x) => String(x.exerciseId) === String(we.exerciseId)
                );

                if (match) {
                    // PATCH existing row
                    await patchWorkoutExercise({
                        token,
                        id: match.id,
                        patch: { sets: JSON.stringify(setsToSave) },
                    });
                } else {
                    // POST new row
                    await createWorkoutExercise({
                        token,
                        item: {
                            workoutId: Number(id),
                            exerciseId: Number(we.exerciseId),
                            sets: JSON.stringify(setsToSave),
                        },
                    });
                }
            }
            console.log("Save Workout Payload", { id, title, excercises: workoutExercises });
            alert("Workout saved!");
        }   catch (e) {
            console.error(e);
            alert("Could not save workout.")
        }
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
                    <ExerciseBrowserPanel title="Browse Exercises">
                        <ExerciseFilters
                            muscleGroupValue={muscleGroup}
                            onMuscleGroupChange={setMuscleGroup}
                            muscleGroupOptions={muscleGroupOptions}
                            searchValue={search}
                            onSearchChange={setSearch}
                            showMuscleGroup={true}
                        />

                        <div className="exPanelList">
                            {filteredLibrary.map((ex) => (
                                <ExerciseBrowserItem
                                    key={ex.id}
                                    text={ex.name}
                                    right="+"
                                    onClick={() => addExerciseToWorkout(ex)}
                                />
                            ))}
                        </div>
                    </ExerciseBrowserPanel>
                </div>
            </div>
        </AppLayout>
    );
}