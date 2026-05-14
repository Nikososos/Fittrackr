import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import ExerciseBrowserPanel from "../../components/exercises/ExerciseBrowserPanel";
import ExerciseFilters from "../../components/exercises/ExerciseFilters";
import ExerciseBrowserItem from "../../components/exercises/ExerciseBrowserItem";
import { useAuth } from "../../context/AuthContext";
import { getExercises } from "../../api/exercisesApi";
import { getWorkouts } from "../../api/workoutsApi";
import { getWorkoutExercises, createWorkoutExercise } from "../../api/workoutExercisesApi";
import "./ExercisesPage.css";

const DEFAULT_MUSCLE_GROUPS = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps"];

const emptyForm = {
    name: "",
    equipment: "",
    targetMuscle: "",
    instruction: "",
};

function normalizeExercise(apiItem) {
    return {
        id: String(apiItem.id),
        name: apiItem.name ?? "Unnamed exercise",
        equipment: apiItem.equipment ?? "-",
        muscleGroups: [apiItem.targetMuscle].filter(Boolean),
        instructions: apiItem.instruction
            ? apiItem.instruction.split(". ").map(s => s.replace(/\.$/, "").trim()).filter(Boolean)
            : ["No instructions available yet."],
        imageUrl: apiItem.imageUrl ?? null,
    };
}
export default function ExercisesPage() {
    const { token, userId } = useAuth();

    const [exercises, setExcercises] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const [search, setSearch] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("All");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Add exercise form state (admin only)
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [formSucces, setFormSucces] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // workout dropdown state
    const [workouts, setWorkouts] = useState([]);
    const [showWorkoutDropdown, setShowWorkoutDropdown] = useState(false);
    const [addSucces, setAddSucces] = useState("");
    const [addError, setAddError] = useState("");

    // Load excercises from backend
    useEffect (() => {
        async function load() {
            try {
                setError("");
                setIsLoading(true);

                const data = await getExercises({token});
                const list = Array.isArray(data) ? data : data?.data || [];
                const normalized = list.map(normalizeExercise);
                setExcercises(normalized);

                //set default selection to first item if nothing is selected yet
                if (!selectedId && normalized.length > 0) {
                    setSelectedId(normalized[0].id);
                }
            // error handling if nothing loads in
            } catch (e) {
              console.error(e);
              setError("Could not load exercises from backend.");  
            } finally {
              setIsLoading(false);
            }
        }

        load();
    }, [token]);

    // Check if current user is admin
    useEffect (() => {
        async function checkAdmin() {
            try {
                const { getUsers } = await import("../../api/usersApi");
                const res = await getUsers({ token });
                const list = Array.isArray(res) ? res : res?.data || [];
                const me = list.find((u) => String(u.id) === String(userId));
                setIsAdmin(Boolean(me?.roles?.includes("admin")));
            } catch (e) {
                console.error("Could not check admin status", e);
            }
        }

        if (token && userId) checkAdmin();
    }, [token, userId]);

    // Load workouts for dropdown
    useEffect(() => {
        async function loadWorkouts() {
            try {
                const data = await getWorkouts( {token });
                const list = Array.isArray(data) ? data : data?.data || [];
                setWorkouts(list);
            } catch (e) {
                console.error("Could not load workouts", e);
            }
        }

        loadWorkouts();
    },  [token]);

    // Close dropwdown when selected exercise changes
    useEffect(() => {
        setShowWorkoutDropdown(false);
        setAddSucces("");
        setAddError("");
    },  [selectedId]);

    async function handleAddToWorkout(workout) {
        setAddSucces("");
        setAddError("");
        setShowWorkoutDropdown(false)

        try {
            // Check if exercise is already in this workout
            const allWE = await getWorkoutExercises({ token });
            const weList = Array.isArray(allWE) ? allWE : allWE?.data || [];
            const alreadyAdded = weList.some(
                (we) =>
                    Number(we.workoutId) === Number(workout.id) &&
                    Number(we.exerciseId) === Number(selectedExercise.id)
            );

            if (alreadyAdded) {
                setAddError(`"${selectedExercise.name}" is already in "${workout.title}".`);
                return;
            }

            // Add exercise with 3 default empty sets
            const defaultSets = JSON.stringify([
                { weight: 0, reps: 0 },
                { weight: 0, reps: 0 },
                { weight: 0, reps: 0 },
            ]);

                await createWorkoutExercise({
                token,
                item: {
                    workoutId: Number(workout.id),
                    exerciseId: Number(selectedExercise.id),
                    sets: defaultSets,
                },
            });

            setAddSucces(`"${selectedExercise.name}" added to "${workout.title}"!`);
        } catch (e) {
            console.error(e);
            setAddError("Could not add exercise to workout.");
        }
    }

    const muscleOptions = useMemo (() => {
        const set = new Set(DEFAULT_MUSCLE_GROUPS);
        exercises.forEach((ex) => ex.muscleGroups.forEach((m) => set.add(m)));
        return Array.from(set);
    }, [exercises]);

    //* filtering excercises on the searchbar right panel
    const filteredExercises = useMemo(() => {
        return exercises.filter((ex) => {
            const matchesSearch =
                ex.name.toLowerCase().includes(search.toLowerCase().trim());
            
            const matchesMuscle =
                muscleGroup === "All" || ex.muscleGroups.includes(muscleGroup);
            
            return matchesSearch && matchesMuscle;
        });
    }, [exercises, search, muscleGroup]);

    const selectedExercise =
        exercises.find((e) => e.id === selectedId) || filteredExercises[0] || null;

    return (
        <AppLayout title="Exercises">
            <div className="exercisesPage">
                <div className="exDetail">

                    {isLoading && <div>Loading exercises...</div>}
                    {error && <div className="errorbanner">{error}</div>}
                    
                    {!isLoading && !error && !selectedExercise ? (
                        <div className="empyDetail">Select an exercise</div>
                    ) : (
                       !isLoading &&
                       !error &&
                       selectedExercise && (             
                        <>
                            <h2 className="exerciseTitle">{selectedExercise.name}</h2>

                            <div className="meta">
                                <strong>Equipment:</strong> {selectedExercise.equipment}
                            </div>
                            <div>
                                <strong>Muscle group:</strong>{" "}
                                {selectedExercise.muscleGroups.join(", ")}
                            </div>

                            <div className="exerciseMediaBlock">
                                <div className="exerciseImageWrapper">
                                    {selectedExercise.imageUrl ? (
                                        <img
                                            className="exerciseImage"
                                            alt={selectedExercise.name}
                                            src={new URL(selectedExercise.imageUrl, import.meta.env.VITE_NOVI_BASE_URL).toString()}
                                            onError={(e) => console.log("IMG ERROR:", e.currentTarget.src)}
                                            onLoad={() => console.log("IMG LOADED")}
                                        />
                                    ) : (
                                        <div className="imagePlaceholder">Exercise image</div>
                                    )}
                                </div>

                                <div className="instruction">
                                    <h3>How to do:</h3>
                                    <ol>
                                        {selectedExercise.instructions.map((step) => (
                                            <li key={step}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>

                            {/* add to workout */}
                            <div className="addToWorkoutWrapper">
                                <div className="addToWorkoutRow">
                                    <button
                                        className="primaryBtn"
                                        type="button"
                                        onClick={() => {
                                            setAddSucces("")
                                            setAddError("");
                                            setShowWorkoutDropdown((prev) => !prev);
                                        }}
                                    >
                                        Add to workout
                                    </button>

                                    {showWorkoutDropdown && (
                                        <div className="workoutDropdown">
                                            {workouts.length === 0 ? (
                                                <div className="workoutDropdownEmpty">
                                                    No workouts found. Create one first.
                                                </div>
                                            ) : (
                                                workouts.map((w) => (
                                                    <button
                                                        key={w.id}
                                                        className="workoutDropdownItem"
                                                        type="button"
                                                        onClick={() => handleAddToWorkout(w)}
                                                    >
                                                        {w.title}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {addSucces && (
                                    <div className="addSuccesBanner">
                                        <span>{addSucces}</span>
                                        <button
                                            className="addBannerClose"
                                            onClick={() => setAddSucces("")}
                                            aria-label="Dismiss"
                                        >
                                            X
                                        </button>
                                    </div>
                                )}

                                {addError && (
                                    <div className="addErrorBanner">
                                        <span>{addError}</span>
                                        <button
                                            className="addBannerClose"
                                            onClick={() => setAddError("")}
                                            aria-label="Dismiss"
                                        >
                                            X
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                       )
                    )}
                </div>

                <ExerciseBrowserPanel title="Browse Exercises">
                    <ExerciseFilters
                        muscleGroupValue={muscleGroup}
                        onMuscleGroupChange={setMuscleGroup}
                        muscleGroupOptions={muscleOptions}
                        searchValue={search}
                        onSearchChange={setSearch}
                        showMuscleGroup={true}
                    />

                    <div className="exPanelList">
                        {filteredExercises.map((ex) => (
                            <ExerciseBrowserItem
                                key={ex.id}
                                text={ex.name}
                                right=">"
                                onClick={() => setSelectedId(ex.id)}
                            />
                        ))}
                    </div>
                </ExerciseBrowserPanel>
            </div>
        </AppLayout>
    );
}