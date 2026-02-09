import "./ExerciseBrowserPanel.css";

export default function ExerciseBrowserPanel({ title, children }) {
    return (
        <aside className="exPanel">
            <h2 className="exPanelTitle">{title}</h2>
            {children}
        </aside>
    );
}