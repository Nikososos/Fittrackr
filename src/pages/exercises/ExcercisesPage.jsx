import { useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout"
import "./ExcercisesPage.css"

const EXERCISES = [
    {
        id: "ex1",
        name: "Bench Press (Barbell)",
        equipment: "Barbell",
        muscleGroups: ["Chest", "Shoulders", "Triceps"],
        instructions: [
            "Lay flat on the bench with your feet on the ground.",
            "Lower the bar to your mid chest",
            "press the bar up until your elbows are locked"
        ],
    },
    {
        id: "ex2",
        name: "Dumbell Curl",
        equipment: "Dumbells",
        muscleGroups: ["Biceps"],
        instructions: [
            "Stand tall with dumbells at your side",
            "Curl the weights up without swinging",
            "Lower slowly and repeat",
        ],
    },
    {
        id: "ex3",
        name: "Seated Cable Row",
        equipment: "Cable",
        muscleGroups: ["Back", "Biceps"],
        instructions: [
            "Sit with a neutral spine and grip the handle",
            "Pull handle towards your torso",
            "Control the return",
        ],
    },
];

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps"];

export default function ExcercisesPage() {
    const [selectedId, setSelectedID] = useState(EXCERCISES[0].id);
    const [search, setSearch] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("All");

    const filteredExercises = useMemo(() => {
        return EXERCISES.filter((ex) => {
            const matchesSearch =
                ex.name.toLowerCase().includes(search.toLowerCase().trim());
            
            const matchesMuscle =
                muscleGroup === "All" || ex.muscleGroups.includes(muscleGroup);
            
            return matchesSearch && matchesMuscle;
        });
    }, [search, muscleGroup]);

    const selectedExercise =
        EXERCISES.find((e) => e.id === selectedId) || filteredExercises[0] || null;

    return (
        <AppLayout title="Home">
            <div className="exercisesPage">
                <div className="exDetail">
                    <h1 className="PageTitle">Exercises</h1>

                    {!selectedExercise ? (
                        <div className="empyDetail">Select an exercise</div>
                    ) : (
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
                                    {selectedExercise.instrucitons.map((step) => (
                                        <li key={step}>{step}</li>
                                    ))}
                                </ol>
                            </div>

                            <button className="primaryBtn">Add to workout</button>
                        </>
                    )}
                </div>

                <aside className="exBrowser">
                    <h2 className="browserTitle">Browse Exercises</h2>

                    <div className="filters">
                        <select
                            className="select"
                            value={muscleGroup}
                            onChange={(e) => setMuscleGroup(e.target.value)}
                        >
                            {MUSCLE_GROUPS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>

                        <input
                            className="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search excercise"
                        />
                    </div>

                    <div className="list">
                        {filteredExercises.length === 0 ? (
                            <div className="emptyList">No excercises found.</div>
                        ) : (
                            filteredExercises.map((ex) => (
                                <button
                                    key={ex.id}
                                    className={
                                        ex.id === selectedId ? "listItem listItemActive" : "listItem"
                                    }
                                    onClick={() => setSelectedID(ex.id)}
                                >
                                    {ex.name}
                                </button>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </AppLayout>
    );
}