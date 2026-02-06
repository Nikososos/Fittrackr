import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
    { to: "/", label: "Home" },
    { to: "/exercises", label: "Excercises" },
    { to: "/workouts", label: "Workouts" },
    { to: "/progress", label: "Progress" },
    { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brandMark" aria-hidden="true"/>
                <span className="brandText">FitTrackr</span>
            </div>

            <nav className="nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => 
                            isActive ? "navLink navLinkActive" : "navLink"
                        }
                        end={item.to === "/"}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}