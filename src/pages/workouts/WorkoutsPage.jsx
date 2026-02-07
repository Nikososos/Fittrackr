import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import "./WorkoutsPage.css";

export default function WorkoutsPage() {
    const navigate = useNavigate();

    // Demo data 
    const [workouts, setWorkouts] = useState ([
        { id: "w1", name: "Upperbody" },
        { id: "w2", name: "Lowerbody" },
    ]);

    const [menuOpenForId, setMenuOpenForId] = useState(null);

    const hasWorkouts = workouts.length > 0;

    function handleStartNew() {
        const newWorkout = {
            id: crypto.randomUUID(),
            name: "New workout",
        };
        setWorkouts((prev) => [newWorkout, ...prev]);

        navigate(`/workouts/${newWorkout.id}`);
    }

    function handleEdit(id) {
        //navigate to workout build
        navigate(`/workouts/${id}`);
    }

    function handleDelete(id) {
        setWorkouts((prev) => prev.filter((w) => w.id !== id));
        setMenuOpenForId(null);
    }

    const sortedWorkouts = useMemo(() => workouts, [workouts]);

    return (
        <AppLayout title="Workouts">
            <div className="workoutsPage">
                <div className="workoutsHeader">
                    <h1 className="pageTitle">Workouts</h1>
                    <button className="primaryBtn" onClick={handleStartNew}>
                        Start new workout
                    </button>
                </div>

                {!hasWorkouts ? (
                  <div className="emptyState">
                    <h2>No workouts found</h2>
                    <p>Create your first workout to start tracking your training.</p>
                    <button className="primaryBtn" onClick={handleStartNew}>
                        Start new workout
                    </button>
                  </div>  
                ) : (
                    <div className="workoutList">
                        {sortedWorkouts.map((w) => (
                            <div key={w.id} className="workoutRow">
                                <button className="workoutName" onClick={() => handleEdit(w.id)}>
                                    {w.name}
                                </button>

                                <div className="menuWrap">
                                    <button
                                        className="menuBtn"
                                        onClick={() =>
                                            setMenuOpenForId((cur) => (cur === w.id ? null : w.id))
                                        }
                                        aria-label="Open menu"
                                    >
                                        open menu
                                    </button>

                                    {menuOpenForId === w.id && (
                                        <div clasName="menu">
                                            <button className="menuItem" onClick={() => handleEdit(w.id)}>
                                                Edit
                                            </button>
                                            <button
                                            className="menuItem menItemDanger"
                                            onClick={() => handleDelte(w.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>    
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )} 
            </div>
        </AppLayout>
    );
}