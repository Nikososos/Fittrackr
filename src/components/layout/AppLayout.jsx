import Sidebar from "./Sidebar";
import "./AppLayout.css";

export default function AppLayout({ title, children }) {
    return (
        <div className="appShell">
            <Sidebar />
            <main className="appMain">
                {title && <h1 className="PageTitle">{title}</h1>}
                <div className="pageContent">{children}</div>
            </main>
        </div>
    );
}