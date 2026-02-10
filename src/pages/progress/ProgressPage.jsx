import { useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import "./ProgressPage.css"

// Dummy data to work with now, later replace with backend
const PROGRESS_BY_DATE = {
    "2026-02-05": {
        workoutName: "Upperbody",
        personalBest: "Bench Press (70kg)",
    },
    "2026-02-12": {
        workoutName: "Lowerbody",
        personalBest: "Squat (140kg)",
    },
    "2026-02-18": {
        workoutName: "Upperbody",
        personalBest: "Overhead Press (45kg)"
    }
};

// Turns number in 2 digit string for ISO date formatting
function pad2(n) {
    return String(n).padStart(2, "0");
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

    const [monthDate, setMonthDate] = useState(startOfMonth(today));
    const [selectedISO, setSelectedISO] = useState(() => {
        return toISODate(today.getFullYear(), today.getMonth(), today.getDate());
    });

    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const monthLabel = monthDate.toLocaleString("en", { month: "long" });

    const totalDays = daysInmonth(monthDate);

    const firstDay = new Date(year, monthIndex, 1).getDay();

    const calenderCells = useMemo(() => {
        const cells = [];
    

    // Days in calender
    for (let day = 1; day <= totalDays; day++) {
        const iso = toISODate(year, monthIndex, day);
        const hasWorkout = Boolean(PROGRESS_BY_DATE[iso]);

        cells.push({
            type: "day",
            key: iso,
            day,
            iso,
            hasWorkout,
        });
    }

        return cells;
    }, [year, monthIndex, totalDays]);

    const selectedData = PROGRESS_BY_DATE[selectedISO] || null;

    function prevMonth() {
        setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() -1, 1));
    }

    function nextMonth() {
        setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }

    return (
        <AppLayout title="Home">
            <div className="progressPage">
                <h1 className="pageTitle">Progress</h1>

                <div className="progressLayout"></div>
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
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="legend">
                        <span className="dot dotWorkout">Workout Logged</span>
                        <span className="dot dotSelected"> Selected day</span>
                    </div>
                </section>

                {/* Day summary */} 
                <section className="summaryCard">
                    <div className="summaryDate">{selectedISO}</div>

                    {selectedData ? (
                        <>
                            <div className="summaryRow">
                                <div className="summaryLabel">Workout Completed</div>
                                <div className="summaryValue">{selectedData.workoutName}</div>
                            </div>

                            <div className="summaryRow">
                                <div className="summaryLabel">Personal best:</div>
                                <div className="summaryValue">{selectedData.personalBest}</div>
                            </div>
                        </>
                    ) : (
                        <div className="summaryEmpty">
                            No workout logged for this day
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}