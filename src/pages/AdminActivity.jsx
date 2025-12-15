// src/pages/AdminActivity.jsx
import { useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-activity.css";
import { fetchAdminActivities } from "../services/activity";

export default function AdminActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetchAdminActivities();
        // kemungkinan bentuk response:
        // { message: "...", data: [ ... ] }
        // atau { data: { recent_activities: [ ... ] } } kalau kamu ubah nanti

        let list = [];

        if (Array.isArray(res?.data)) {
          // case: { data: [ ... ] }
          list = res.data;
        } else if (Array.isArray(res?.recent_activities)) {
          // kalau controller nanti balikin: { recent_activities: [ ... ] }
          list = res.recent_activities;
        } else if (Array.isArray(res)) {
          // case: langsung array
          list = res;
        } else {
          list = [];
        }

        setActivity(list);
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

  // ====== Normalisasi field dari ActivityLog ======
  // Model: action, details, action_time, performed_by (+ relasi user, ticket)

  const getMessage = (a) => a.details || a.action || "-";

  const getActor = (a) =>
    a.user?.name ||
    a.user_name ||
    (a.performed_by ? `User #${a.performed_by}` : "System");

  const getTime = (a) => {
    const raw =
      a.action_time || a.time || a.created_at || a.timestamp || a.datetime;

    if (!raw) return "";

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;

    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

          {/* Error message */}
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
                    <li key={a.id_log ?? idx} className="activity-item">
                      <div className="activity-avatar">
                        {getAvatar(actor)}
                      </div>

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

                        {/* Optional: info ticket kalau mau */}
                        {a.ticket && (
                          <div className="activity-ticket-ref">
                            Ticket:{" "}
                            <strong>
                              {a.ticket.code_ticket || a.ticket.title}
                            </strong>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}

                {!activity.length && !errorMsg && (
                  <div className="activity-empty">
                    Tidak ada activity log.
                  </div>
                )}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
