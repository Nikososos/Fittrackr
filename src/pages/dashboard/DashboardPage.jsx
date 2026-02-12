import AppLayout from "../../components/layout/AppLayout"
import WorkoutsPage from "../workouts/WorkoutsPage";
import "./DashboardPage.css"

export default function DashboardPage() {
    return (
        <AppLayout title="Home">
            <div className="dashboardGrid">
                <button className="startWorkoutBtn" onClick={WorkoutsPage}>
                    Start new Workout
                </button>

                <div className="statsRow">
                    <div className="statCard">
                        <span className="statLabel">Date last Workout:</span>
                        <span className="statValue">18 December 2025</span>
                    </div>

                    <div className="statCard">
                        <span className="statLabel">
                            Total workouts this year:
                        </span>
                        <span className="statValue">167</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}