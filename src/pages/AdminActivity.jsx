import { useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-activity.css";
import { fetchAdminActivities } from "../services/activity";

export default function AdminActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil data dari backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetchAdminActivities();

        let raw =
          res?.data?.activity_log ??
          res?.activity_log ??
          res?.data ??
          res ??
          [];

        // hanya ambil array
        if (!Array.isArray(raw)) {
          raw = [];
        }

        setActivity(raw);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err?.response?.data?.message ||
            "Gagal mengambil log aktivitas dari server."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Normalisasi field supaya aman
  const getMessage = (a) =>
    a.message ?? a.activity ?? a.description ?? a.log ?? "-";

  const getActor = (a) =>
    a.user_name ?? a.user ?? a.actor ?? a.by ?? a.created_by ?? "System";

  const getTime = (a) =>
    a.time ?? a.created_at ?? a.timestamp ?? a.datetime ?? "";

  const getAvatar = (name) => (String(name).trim()[0] || "A").toUpperCase();

  return (
    <div className="admin-page activity-layout">
      <AdminSidebar active="activity" />

      <main className="admin-main">
        <div className="activity-wrapper">
          {/* HEADER */}
          <header className="activity-header">
            <h1 className="activity-header-title">Activity Log</h1>
            <p className="activity-header-sub">
              Track system activity and changes
            </p>
          </header>

          {/* Error handling */}
          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          {/* CARD */}
          <section className="activity-card">
            <div className="activity-card-title">System Activity Log</div>
            <div className="activity-card-sub">
              Recent updates & logs from system
            </div>

            {loading ? (
              <div className="activity-loading">Loading activity...</div>
            ) : (
              <ul className="activity-list">
                {activity.map((a, idx) => {
                  const message = getMessage(a);
                  const actor = getActor(a);
                  const time = getTime(a);

                  return (
                    <li key={a.id ?? idx} className="activity-item">
                      <div className="activity-avatar">{getAvatar(actor)}</div>

                      <div>
                        <div className="activity-text">{message}</div>
                        <div className="activity-meta">
                          <span>by {actor}</span>
                          {time && (
                            <>
                              <span className="dot">•</span>
                              <span>{time}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}

                {!activity.length && !errorMsg && (
                  <div className="activity-empty">Tidak ada activity log.</div>
                )}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
