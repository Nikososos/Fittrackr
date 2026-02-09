import "./ExerciseFilters.css"

export default function ExerciseFilters({
    muscleGroupValue,
    onMuscleGroupChange,
    muscleGroupOptions = ["ALL"],
    searchValue,
    onSearchChange,
    showMuscleGroup = true,
}) {
    return (
        <div className="exFilters">
            {showMuscleGroup && (
                <select
                    className="exSelect"
                    value={muscleGroupValue}
                    onChange={(e) => onMuscleGroupChange(e.target.value)}
                >
                    {muscleGroupOptions.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
            )}

            <input
                className="exSearch"
                value={searchValue}
                onChange={(e) = onSearchChange(e.target.value)}
                placeholder="Search exercise"
            />
        </div>
    );
}