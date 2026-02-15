import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getUsers, patchUser } from "../../api/usersApi";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { token, userId } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token || !userId) return;

    async function load() {
      try {
        setError("");
        setIsLoading(true);

        const res = await getUsers({ token });
        const list = Array.isArray(res) ? res : res?.data || [];
        const me = list.find((u) => String(u.id) === String(userId));

        if (!me) throw new Error("Could not load your user profile.");

        setDisplayName(me.displayName ?? me.display_name ?? "");
        setEmail(me.email ?? "");
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to load settings.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [token, userId]);

  async function handleSaveDisplayName() {
    try {
      setSuccess("");
      setError("");

      const name = displayName.trim();
      if (name.length < 2) {
        setError("Display name must be at least 2 characters.");
        return;
      }

      setSavingName(true);
      await patchUser({
        token,
        id: userId,
        patch: { displayName: name },
      });

      setSuccess("Display name updated.");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not update display name.");
    } finally {
      setSavingName(false);
    }
  }

  return (
    <AppLayout title="Settings">
      <div className="settingsPage">

        {isLoading && <p>Loading...</p>}
        {error && <div className="errorbanner">{error}</div>}
        {success && <div className="successbanner">{success}</div>}

        {!isLoading && (
          <>
            <section className="settingsCard">
              <h2>Profile</h2>

              <div className="field">
                <label>Email</label>
                <input value={email} disabled />
              </div>

              <div className="field">
                <label>Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <button
                className="primaryBtn"
                type="button"
                onClick={handleSaveDisplayName}
                disabled={savingName}
              >
                {savingName ? "Saving..." : "Save display name"}
              </button>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}