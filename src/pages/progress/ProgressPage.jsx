import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getWorkoutCompletions } from "../../api/workoutcompletionsApi";
import { getWorkouts } from "../../api/workoutsApi";
import { getExercises } from "../../api/exercisesApi";
import AppLayout from "../../components/layout/AppLayout";
import "./ProgressPage.css";

// Turns number in 2 digit string for ISO date formatting
function pad2(n) {
    return String(n).padStart(2, "0");
}
// formats iso date to regular dutch date format
function formatDisplayDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
}

function toISODate(year, monthIndex, day) {
    return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInmonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default function ProgressPage() {
    const today = new Date();
    const { token, userId } = useAuth();

    const [monthDate, setMonthDate] = useState(startOfMonth(today));
    const [selectedISO, setSelectedISO] = useState(() =>
        toISODate(today.getFullYear(), today.getMonth(), today.getDate())
    );

    // Backend data
    const [completions, setCompletions] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [exercises, setExercises] = useState([])

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token || !userId) return;

        async function load() {
            try {
                setError("");
                setIsLoading(true);

                const [cRes, wRes, eRes] = await Promise.all([
                    getWorkoutCompletions({ token, userId }),
                    getWorkouts({ token, userId }),
                    getExercises({ token }),
                ]);

                const cList = Array.isArray(cRes) ? cRes : cRes?.data || [];
                const wList = Array.isArray(wRes) ? wRes : wRes?.data || [];
                const eList = Array.isArray(eRes) ? eRes : eRes?.data || [];

                setCompletions(cList);
                setWorkouts(wList);
                setExercises(eList);
            }   catch (e) {
                console.error(e);
                setError("Could not load progress data from backend");
            }   finally {
                setIsLoading(false);
            }
        }

        load();
    },   [token, userId]);

    // Lookup maps for workouttitle & exercisename
    const workoutTitleById = useMemo(() => {
        const m = new Map();
        workouts.forEach((w) => m.set(String(w.id), w.title));
        return m;
    }, [workouts]);

    const exerciseNameById = useMemo(() => {
        const m = new Map();
        exercises.forEach((ex) => m.set(String(ex.id), ex.name));
        return m;
    },  [exercises]);

    //Build date completion (if multiple workouts per day pick the latest one)
    const completionByDate = useMemo(() => {
        const m = new Map();
        completions.forEach((c) => {
            const iso = String(c.date);
            m.set(iso, c);
        });
        return m;
    }, [completions]);

    // calender
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const monthLabel = monthDate.toLocaleString("en", { month: "long" });

    const totalDays = daysInmonth(monthDate);

    //Sun = 0, Mon=1, Tue=2, etc....
    const firstDay = new Date(year, monthIndex, 1).getDay();
    // For a Mon-first calender shift, Sun->6, Mon->0, Tue->1...
    const mondayFirstOffset = (firstDay + 6) % 7; 

    const calenderCells = useMemo(() => {
        const cells = [];
    
        // Empty cells before 1st of the month
        for (let i = 0; i < mondayFirstOffset; i++) {
            cells.push({ type: "empty", key: `e-${i}` });
        }

        // Days in calender
        for (let day = 1; day <= totalDays; day++) {
            const iso = toISODate(year, monthIndex, day);
            const hasWorkout = completionByDate.has(iso);

            cells.push({
                type: "day",
                key: iso,
                day,
                iso,
                hasWorkout,
            });
        }

        return cells;
    }, [year, monthIndex, totalDays, mondayFirstOffset, completionByDate]);

    // define selection variables to show on frontend
    const selectedCompletion = completionByDate.get(selectedISO) || null;

    const selectedWorkoutName = selectedCompletion
        ? workoutTitleById.get(String(selectedCompletion.workoutId)) || "Workout"
        : null;

    const selectedBestExerciseName =
        selectedCompletion && selectedCompletion.bestExerciseId
            ? exerciseNameById.get(String(selectedCompletion.bestExerciseId)) || "Exercise"
            : null;

    const selectedPersonalBest = 
        selectedCompletion && selectedBestExerciseName
            ? `${selectedBestExerciseName} (${selectedCompletion.bestValue ?? 0}kg)`
            : null;
    // Previous month 
    function prevMonth() {
        setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() -1, 1));
    }
    // Next month 
    function nextMonth() {
        setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }

    return (
        <AppLayout title="Progress">
            <div className="progressPage">

                <div className="progressLayout">
                    {/* Calender */}
                    <section className="calenderCard">
                        <div className="calenderHeader">
                            <button className="iconBtn" onClick={prevMonth} aria-label="Previous month">
                                back
                            </button>

                            <div className="calenderTitle">
                                {monthLabel} {year}
                            </div>

                            <button className="iconBtn" onClick={nextMonth} aria-label="Next month">
                                next
                            </button>
                        </div>

                        <div className="weekdays">
                            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                        </div>

                        
                        <div className="calenderGrid">
                            {calenderCells.map((cell) => {
                                if (cell.type === "empty") {
                                    return <div key={cell.key} className="dayCell dayCellEmpty"/>
                                }

                                const isSelected = cell.iso === selectedISO;
                                const classes = [
                                    "dayCell",
                                    cell.hasWorkout ? "dayCellHasWorkout" : "",
                                    isSelected ? "dayCellSelected" : "",
                                ].join(" ");

                                return (
                                    <button
                                        key={cell.key}
                                        className={classes}
                                        onClick={() => setSelectedISO(cell.iso)}
                                        type="button"
                                    >
                                        <span className="dayNumber">{cell.day}</span>

                                        {cell.hasWorkout && !isSelected && (
                                            <span className="workoutDot"/> //Non selected workout days get blue dot
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="legend">
                            <span className="dot dotWorkout"/>Workout Logged
                            <span className="dot dotSelected"/>Selected day
                        </div>
                    </section>

                    {/* Day summary */} 
                    <section className="summaryCard">
                        <div className="summaryDate">
                            {formatDisplayDate(selectedISO)}
                        </div>

                        {isLoading && <div className="summaryEmpty">Loading...</div>}
                        {error && <div className="errorBanner">{error}</div>}

                        {!isLoading && !error && selectedCompletion ? (
                            <>
                                <div className="summaryRow">
                                    <div className="summaryLabel">Workout Completed:</div>
                                    <div className="summaryValue">{selectedWorkoutName}</div>
                                </div>

                                <div className="summaryRow">
                                    <div className="summaryLabel">Personal best:</div>
                                    <div className="summaryValue">{selectedPersonalBest ?? "-"}</div>
                                </div>
                            </>
                        ) : (
                            !isLoading &&
                            !error && <div className="summaryEmpty">No workout logged for this day</div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}