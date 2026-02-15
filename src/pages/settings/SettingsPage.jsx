import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getUsers, deleteUser } from "../../api/usersApi";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { token, userId, logout } = useAuth();

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !userId) return;

    async function load() {
      try {
        setError("");
        setIsLoading(true);

        const res = await getUsers({ token });
        const list = Array.isArray(res) ? res : res?.data || [];

        setUsers(list);

        const current = list.find((u) => String(u.id) === String(userId)) || null;
        setMe(current);
      } catch (e) {
        console.error(e);
        setError("Could not load user data.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [token, userId]);

  const isAdmin = Boolean(me?.roles?.includes("admin"));

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const email = String(u.email || "").toLowerCase();
      const id = String(u.id || "");
      const roles = Array.isArray(u.roles) ? u.roles.join(",").toLowerCase() : "";
      return email.includes(q) || id.includes(q) || roles.includes(q);
    });
  }, [users, search]);

  async function handleDeleteUser(targetUser) {
    // Safety: don’t delete yourself
    if (String(targetUser.id) === String(userId)) {
      alert("You cannot delete your own admin account.");
      return;
    }

    // Optional safety: don’t delete other admins
    if (targetUser.roles?.includes("admin")) {
      alert("You cannot delete another admin account.");
      return;
    }

    const ok = window.confirm(`Delete user "${targetUser.email}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setDeletingId(String(targetUser.id));
      await deleteUser({ token, id: targetUser.id });

      setUsers((prev) => prev.filter((u) => String(u.id) !== String(targetUser.id)));
    } catch (e) {
      console.error(e);
      alert("Could not delete user (are you logged in as admin?)");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppLayout title="Settings">
      <div className="settingsPage">
        <h2>Account</h2>

        {error && <div className="errorBanner">{error}</div>}
        {isLoading && <div>Loading...</div>}

        {!isLoading && !error && (
          <>
            {/* Member view */}
            {!isAdmin && (
              <div className="settingsCard">
                <div className="settingsRow">
                  <span className="settingsLabel">Email:</span>
                  <span className="settingsValue">{me?.email || "-"}</span>
                </div>

                <button className="logoutBtn" onClick={logout}>
                  Logout
                </button>
              </div>
            )}

            {/* Admin view */}
            {isAdmin && (
              <div className="settingsCard">
                <div className="settingsRow">
                  <span className="settingsLabel">Logged in as:</span>
                  <span className="settingsValue">{me?.email || "-"}</span>
                </div>

                <div className="adminSection">
                  <h3 className="adminTitle">All user accounts</h3>

                  <input
                    className="adminSearch"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by email, id, or role..."
                  />

                  <div className="userList">
                    {filteredUsers.map((u) => {
                      const isMe = String(u.id) === String(userId);
                      const isAdminUser = Boolean(u.roles?.includes("admin"));

                      return (
                        <div key={u.id} className="userRow">
                          <div className="userMain">
                            <div className="userEmail">
                              {u.email} {isMe ? "(you)" : ""}
                            </div>
                            <div className="userMeta">
                              ID: {u.id} • Roles: {(u.roles || []).join(", ")}
                            </div>
                          </div>

                          <div className="userActions">
                            <button
                              className="dangerBtn"
                              type="button"
                              disabled={isMe || isAdminUser || deletingId === String(u.id)}
                              onClick={() => handleDeleteUser(u)}
                              title={
                                isMe
                                  ? "You cannot delete yourself"
                                  : isAdminUser
                                  ? "You cannot delete an admin"
                                  : "Delete user"
                              }
                            >
                              {deletingId === String(u.id) ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button className="logoutBtn" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}