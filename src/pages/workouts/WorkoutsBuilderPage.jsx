import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getExercises } from "../../api/exercisesApi";
import { createWorkout, getWorkouts, patchWorkout } from "../../api/workoutsApi";
import { createWorkoutCompletion } from "../../api/workoutcompletionsApi";
import { createWorkoutExercise, patchWorkoutExercise, getWorkoutExercises, deleteWorkoutExercise } from "../../api/workoutExercisesApi";
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
    const navigate = useNavigate();
    const { token, userId } = useAuth();
    const { id } = useParams();

    
    const [workoutName, setWorkoutName ] = useState ("");
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const [saveError, setSaveError] = useState("");
    const [saveSucces, setSaveSucces] = useState("");

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
        if (!token || !id || id === "new") return;

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
            id: crypto.randomUUID(),
            workoutExerciseId: we.workoutExerciseId,
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
                muscleGroup === "All" || e.targetMuscle === muscleGroup;
            
            return matchesSearch && matchesMuscle;
        });
    }, [search, muscleGroup, exerciseLibrary]);

    // Helper to format today as YYYY-MM-DD, later used in handleFinishWorkout
    function todayISO() {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    // Add excercise to workout
    function addExerciseToWorkout(exercise) {
        setSaveError("");
        setWorkoutExercises((prev) => {
            const alreadyAdded = prev.some((we) => String(we.exerciseId) === String(exercise.id));
            if (alreadyAdded) return prev; // avoid duplicates
            return [...prev, createWorkoutExerciseState(exercise)];
        });
    }

    // remove excercise from workout
    function removeExercises(workoutExerciseId) {
        setWorkoutExercises((prev) => prev.filter((we) => we.id !== workoutExerciseId));
    }

    // add set to excercise
    function addSet(workoutExerciseId) {
        setWorkoutExercises((prev) => 
            prev.map((we) => 
                we.id === workoutExerciseId
                    ? { ...we, sets: [...we.sets, createSet()] }
                    : we 
            )
        );
    }

    // remove set from excercise
    function removeSet(workoutExerciseId, setId) {
        setWorkoutExercises((prev) =>
            prev.map((we) => {
                if (we.id !== workoutExerciseId) return we;
                if (we.sets.length <= 1) return we; //keep at least 1 set
                return { ...we, sets: we.sets.filter((s) => s.id !== setId) };
            })
        );
    }

    // update inputfield kg and sets
    function updateSetField(workoutExerciseID, setId, field, value) {
        let sanitizedValue = value;

        // allow numbers + decimal point
        if (field === "weight") {
            sanitizedValue = value.replace(/[^0-9.]/g, "");
        }

        // allow only integers
        if (field ==="reps")
            sanitizedValue = value.replace(/[^0-9]/g, "");

        setWorkoutExercises((prev) => 
            prev.map((we) => {
                if (we.id !== workoutExerciseID) return we;
                return {
                    ...we,
                    sets: we.sets.map((s) =>
                        s.id === setId ? { ...s, [field]: sanitizedValue } : s
                    ),
                };
            })
        );
    }

    //checks if workouts already exist
    async function ensureWorkoutExists() {
        //If editing existing workout return id
        if (id) {
            const numericId = Number(id);
            
            if (!Number.isInteger(numericId)) {
                throw new Error(`Invalid Route id: ${id}`);
            }
            
            return Number(id);

        }

        const title = workoutName.trim() || "New Workout";

        const created = await createWorkout({
            token,
            workout: {
                userId: Number(userId),
                title,
            },
        });

        console.log("createworkout response: ", created);

        const createdId = created?.id ?? created?.data?.id ?? created?.workout?.id;

        if (!Number.isInteger(Number(createdId))) {
            console.error("Unexpected createworkout response", created);
            throw new Error("createWorkout did not return a valid workout id")
        }

        // Move URL from /workouts/new > /workouts/realId so refresh works
        navigate(`/workouts/${created.id}`, { replace: true });

        return Number(created.id);
    }
    
    // save workout with changes made
    async function handleSave() {

        setSaveError("");
        setSaveSucces("");

        // Validate at least one exercise required
        if (workoutExercises.length === 0) {
            setSaveError("You need to add at least one exercise before saving");
            return;
        }

        if (!workoutName.trim()) {
            setSaveError("Please enter a name for your workout.");
            return;
        }

        // Validate no duplicate workout name
        const titleToCheck = workoutName.trim() || "New Workout";
        try {
            const allWorkouts = await getWorkouts({ token })
            const workoutList = Array.isArray(allWorkouts) ? allWorkouts : allWorkouts?.data || [];
            const duplicate = workoutList.find(
                (w) =>
                    String(w.userId) === String(userId) &&
                    w.title.trim().toLowerCase() === titleToCheck.toLowerCase() &&
                    String(w.id) !== String(id)
            );
            if (duplicate) {
                setSaveError(`A workout named "${titleToCheck}" already exists. Please choose a different name`);
                return
            }
        } catch (e) {
            console.error("Could not check for duplicate workouts names", e);
        }

        try {
            const title = titleToCheck;
            const isExistingWorkout = Boolean(id);
            const workoutId = await ensureWorkoutExists();

            // Only patch if it already existed; if it was just created, title is already set
            if (isExistingWorkout) {
                await patchWorkout({ token, id: workoutId, patch: { title }});
            }

            const allWE = await getWorkoutExercises({ token });
            const existingList = Array.isArray(allWE) ? allWE : allWE?.data || [];
            const existing = existingList.filter(
                (we) => String(we.workoutId) === String(workoutId));
            // Delete backend Rows that user removed in the UI
            const uiExerciseIds = new Set(
                workoutExercises.map((we) => String(we.exerciseId))
            );

            const toDelete = existing.filter(
                (row) => !uiExerciseIds.has(String(row.exerciseId))
            );

            for (const row of toDelete) {
                await deleteWorkoutExercise({ token, id: row.id })
            }
            
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
                            workoutId: Number(workoutId),
                            exerciseId: Number(we.exerciseId),
                            sets: JSON.stringify(setsToSave),
                        },
                    });
                }
            }
            console.log("Save Workout Payload", { id, title, excercises: workoutExercises });
            setSaveSucces(`Workout "${title}" saved succesfully!`);
        }  catch (e) {
            console.error(e);
            setSaveError("Could not save workout.")
        }
    }

    async function handleFinishWorkout() {
        setSaveError("");
        setSaveSucces("");

        try {
            if (!workoutExercises.length) {
                setSaveError("You need to add at least one exercise before finishing the workout.");
                return;
            }

            const workoutId = await ensureWorkoutExists();

            // validate all sets
            for (const we of workoutExercises) {
                for (const s of we.sets) {
                    const weight = Number(s.weight);
                    const reps = Number(s.reps);

                    if (!weight || !reps) {
                        setSaveError("All sets must have weight and reps greater than 0");
                        return;
                    }
                }
            }

            // if validation passes look for the strongest lift
            let bestValue = 0;
            let bestExerciseId = null;

            for (const we of workoutExercises) {
                for (const s of we.sets) {
                    const weight = Number(s.weight);

                    if (weight > bestValue) {
                        bestValue = weight;
                        bestExerciseId = Number(we.exerciseId);
                    }
                }
            }

            const completion = {
                userId: Number(userId),
                workoutId: Number(workoutId),
                date: todayISO(),
                bestExerciseId,
                bestValue,
            };

            await createWorkoutCompletion( { token, completion });

            setSaveSucces("workout finished! Logged in progress.");
            setTimeout(() => navigate("/progress"), 1500);

        }  catch (e) {
            console.error(e);
            setSaveError("Could not finish workout.");
        }
    }

    // navigate back to workout overview page without saving
    function handleBack() {
        navigate("/workouts");
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
                            onChange={(e) => {
                                setWorkoutName(e.target.value);
                                setSaveError("");
                                setSaveSucces("");
                            }}
                            placeholder="Workout Name"
                        />
                    </div>
                    
                    <div className="wbHeaderActions">
                        <button type="button" className="secondaryBtn" onClick={handleFinishWorkout}>
                            Finish Workout
                        </button>
                        <button type="button" className="secondaryBtn" onClick={handleBack}>
                            Back
                        </button>
                        <button type="button" className="primaryBtn" onClick={handleSave}>
                            Save Workout
                        </button>
                    </div>
                </div>

                {saveError && (
                    <div className="saveErrorBanner">
                        <span>{saveError}</span>
                        <button
                            className="saveErrorClose"
                            onClick={() => setSaveError("")}
                            aria-label="Dismiss"
                        >
                            X
                        </button>
                    </div>
                )}

                {saveSucces && (
                    <div className="saveSuccesbanner">
                        <span>{saveSucces}</span>
                        <button
                        className="saveSuccessClose"
                        onClick={() => setSaveSucces("")}
                        aria-label="Dismiss"
                        >
                            X   
                        </button>
                    </div>
                )}

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
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        value={s.weight}
                                                        onChange={(e) =>
                                                            updateSetField(we.id, s.id, "weight", e.target.value)
                                                        }
                                                        placeholder="kg"
                                                    />

                                                    <input
                                                        className="setInput"
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={s.reps}
                                                        onChange={(e) => 
                                                            updateSetField(we.id, s.id, "reps", e.target.value)
                                                        }
                                                        placeholder="reps"
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