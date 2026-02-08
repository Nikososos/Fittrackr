import "./ExerciseBrowserItem.css";

export default function ExerciseBrowserItem({ text, right, onClick }) {
    return (
        <button className="exItem" onClick={onClick} type="button">
            <span className="exItemText">{text}</span>
            <span className="exItemRight">{right}</span>
        </button>
    );
}