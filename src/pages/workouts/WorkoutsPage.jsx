import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { createWorkout, deleteWorkout, getWorkouts } from "../../api/workoutsApi";
import "./WorkoutsPage.css";

function normalizeWorkout(apiItem) {
  const id = apiItem.id ?? apiItem.workout_id;
  const userId = apiItem.userId ?? apiItem.user_id;

  return {
    id: String(id),
    userId: userId ?? null,
    title: apiItem.title ?? "Untitled workout",
  };
}

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const { token, userId } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [menuOpenForId, setMenuOpenForId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        setError("");
        setIsLoading(true);

        const data = await getWorkouts({ token, userId });
        const list = Array.isArray(data) ? data : data?.data || [];
        setWorkouts(list.map(normalizeWorkout));
      } catch (e) {
        console.error(e);
        setError("Could not load workouts from backend");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [token, userId]);

  const visibleWorkouts = useMemo(
    () => workouts.filter((w) => String(w.userId) === String(userId)),
    [workouts, userId]
  );

  async function handleStartNew() {
    try {
      setError("");

      const payload = {
        userId: Number(userId),
        title: "New workout",
      };

      const created = await createWorkout({ token, workout: payload });
      const newWorkout = normalizeWorkout(created);

      setWorkouts((prev) => [newWorkout, ...prev]);
      navigate(`/workouts/${newWorkout.id}`);
    } catch (e) {
      console.error(e);
      setError("Could not create workout");
    }
  }

  function handleEdit(id) {
    navigate(`/workouts/${id}`);
  }

  async function handleDelete(id) {
    try {
      await deleteWorkout({ token, id });
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      setMenuOpenForId(null);
    } catch (e) {
      console.error(e);
      setError("Could not delete workout");
    }
  }

  return (
    <AppLayout title="Workouts">
      <div className="workoutsPage">
        <div className="workoutsHeader">
          <h1 className="pageTitle">Workouts</h1>
          <button className="primaryBtn" onClick={handleStartNew}>
            Start new workout
          </button>
        </div>

        {error && <div className="errorbanner">{error}</div>}
        {isLoading && <p>Loading workouts...</p>}

        {!isLoading && visibleWorkouts.length === 0 ? (
          <div className="emptyState">
            <h2>No workouts found</h2>
            <p>Create your first workout to start tracking your training.</p>
            <button className="primaryBtn" onClick={handleStartNew}>
              Start new workout
            </button>
          </div>
        ) : (
          <div className="workoutList">
            {visibleWorkouts.map((w) => (
              <div key={w.id} className="workoutRow">
                <button className="workoutName" onClick={() => handleEdit(w.id)}>
                  {w.title}
                </button>

                <div className="menuWrap">
                  <button
                    className="menuBtn"
                    onClick={() => setMenuOpenForId((cur) => (cur === w.id ? null : w.id))}
                    aria-label="Open menu"
                  >
                    ⋮
                  </button>

                  {menuOpenForId === w.id && (
                    <div className="menu">
                      <button className="menuItem" onClick={() => handleEdit(w.id)}>
                        Edit
                      </button>
                      <button
                        className="menuItem menuItemDanger"
                        onClick={() => handleDelete(w.id)}
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