import "./ExerciseBrowserPanel.css";

export default function ExerciseBrowserPanel({
    title = "Browse Exercises",
    searchValue,
    onSearchChange,
    children,
}) {
    return (
        <aside className="exPanel">
            <h2 className="exPanelTitle">{title}</h2>

            <input
                className="exPanelSearch"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search exercise"
            />

            <div className="exPanelList">{children}</div>
        </aside>
    );
}