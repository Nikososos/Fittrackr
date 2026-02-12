import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import ExerciseBrowserPanel from "../../components/exercises/ExerciseBrowserPanel";
import ExerciseFilters from "../../components/exercises/ExerciseFilters";
import ExerciseBrowserItem from "../../components/exercises/ExerciseBrowserItem";
import { useAuth } from "../../context/AuthContext";
import { getExercises } from "../../api/exercisesApi";
import "./ExercisesPage.css";

const DEFAULT_MUSCLE_GROUPS = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps"];

function normalizeExercise(apiItem) {
    const id = apiItem.id ?? apiItem.excercise_id;

    return {
        id: String(apiItem.exercise_id),
        name: apiItem.name ?? "Unnamed exercise",
        equipment: apiItem.equipment ?? "-",
        muscleGroups: [apiItem.target_muscle].filter(Boolean),
        instructions: apiItem.instructions ?? [
            "No instructions available yet."
        ],
    };
}
export default function ExcercisesPage() {
    const { token } = useAuth();

    const [exercises, setExcercises] = useState([]);
    const [selectedId, setSelectedID] = useState(null);

    const [search, setSearch] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("All");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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
                    setSelectedID(normalized[0].id);
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

    const muscleOptions = useMemo (() => {
        const set = new Set(DEFAULT_MUSCLE_GROUPS);
        exercises.forEach((ex) => ex.muscleGroups.forEach((m) => set.add(m)));
        return Array.from(set);
    }, [exercises]);


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
                    <h1 className="PageTitle">Exercises</h1>

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

                            <div className="imagePlaceholder">Exercise image</div>

                            <div className="instruction">
                                <h3>How to do:</h3>
                                <ol>
                                    {selectedExercise.instructions.map((step) => (
                                        <li key={step}>{step}</li>
                                    ))}
                                </ol>
                            </div>

                            <button className="primaryBtn">Add to workout</button>
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
                                onClick={() => setSelectedID(ex.id)}
                            />
                        ))}
                    </div>
                </ExerciseBrowserPanel>
            </div>
        </AppLayout>
    );
}