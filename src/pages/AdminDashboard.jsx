// src/pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin.css";
import { fetchAdminTickets } from "../services/tickets";
import { fetchAdminActivities } from "../services/activity";

export default function AdminDashboard() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ notif dropdown state
  const [notifOpen, setNotifOpen] = useState(false);

  // ===============================
  // Normalisasi status dari DB
  // ===============================
  const normalizeStatus = (s) => {
    const val = String(s || "").toUpperCase();
    if (val === "IN_PROGRESS") return "progress";
    if (val === "CLOSED" || val === "RESOLVED") return "done";
    return "open";
  };

  // Helper ticket
  const getId = (t) => t.code_ticket ?? t.id_ticket ?? t.id ?? "-";
  const getTitle = (t) => t.title ?? t.subject ?? "-";
  const getCompletedAt = (t) => t.resolved_at ?? "-";

  const getPriority = (t) => {
    const raw = String(t.priority ?? "LOW").toUpperCase(); // LOW / MEDIUM / HIGH
    return raw.charAt(0) + raw.slice(1).toLowerCase();
  };

  const createdAtLabel = (t) => {
    const raw = t.created_at ?? t.createdAt ?? t.date;
    if (!raw) return "-";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===============================
  // ACTIVITY helpers
  // ===============================
  const getMessage = (a) =>
    a?.details || a?.action || a?.activity || a?.message || "-";

  const getActor = (a) =>
    a?.user?.name ||
    a?.user_name ||
    (a?.performed_by ? `User #${a.performed_by}` : "System");

  const getTime = (a) => {
    const raw =
      a?.action_time || a?.time || a?.created_at || a?.timestamp || a?.datetime;

    if (!raw) return "-";

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);

    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===============================
  // FETCH TICKETS
  // ===============================
  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      setErrorMsg("");

      const data = await fetchAdminTickets();
      const list = Array.isArray(data?.data) ? data.data : data;
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message || "Gagal ambil data tickets dari server."
      );
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // (opsional) polling biar notif kebaca tanpa refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadTickets();
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===============================
  // FETCH ACTIVITY
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        setLoadingActivities(true);

        const res = await fetchAdminActivities();

        let list = [];
        if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res?.recent_activities)) {
          list = res.recent_activities;
        } else if (Array.isArray(res)) {
          list = res;
        } else {
          list = [];
        }

        setActivities(list.slice(0, 6));
      } catch (err) {
        console.error(err);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, []);

  // ===============================
  // FILTER table
  // ===============================
  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();

    const id = String(getId(t)).toLowerCase();
    const title = String(getTitle(t)).toLowerCase();
    const completedAt = String(getCompletedAt(t)).toLowerCase();

    return id.includes(q) || title.includes(q) || completedAt.includes(q);
  });

  // ===============================
  // ✅ NOTIF: ticket OPEN (belum dibuka admin)
  // ===============================
  const openTickets = tickets
    .filter((t) => normalizeStatus(t.status) === "open")
    // sort terbaru dulu biar notif enak
    .sort((a, b) => {
      const da = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
      const db = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
      return db - da;
    })
    // batasin biar dropdown ga kepanjangan
    .slice(0, 8);

  const openCount = tickets.filter((t) => normalizeStatus(t.status) === "open").length;

  // ===============================
  // STATS
  // ===============================
  const stats = {
    total: tickets.length,
    pending: openCount,
    progress: tickets.filter((t) => normalizeStatus(t.status) === "progress")
      .length,
    done: tickets.filter((t) => normalizeStatus(t.status) === "done").length,
  };

  return (
    <div className="admin-page">
      <AdminSidebar active="overview" />

      <div className="admin-main">
        {/* ✅ pass notif data ke navbar */}
        <AdminNavbar
          query={query}
          setQuery={setQuery}
          user={user}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          notifCount={openCount}
          notifItems={openTickets.map((t) => ({
            id: getId(t),
            title: getTitle(t),
            priority: getPriority(t),
            createdAt: createdAtLabel(t),
          }))}
        />

        {!!errorMsg && <div className="auth-error">{errorMsg}</div>}

        {/* STATS ROW */}
        <div className="admin-stats admin-stats-4">
          <div className="stat-card">
            <div className="stat-icon icon-total">📌</div>
            <div className="stat-title">Total Tickets</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-note">+12% from last month</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-pending">⌛</div>
            <div className="stat-title">Pending</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-note">Requires attention</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-progress">⚡</div>
            <div className="stat-title">In Progress</div>
            <div className="stat-value">{stats.progress}</div>
            <div className="stat-note">Being worked on</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-done">✅</div>
            <div className="stat-title">Resolved</div>
            <div className="stat-value">{stats.done}</div>
            <div className="stat-note">+8% resolution rate</div>
          </div>
        </div>

        {/* GRID: RECENT TICKETS + ACTIVITY */}
        <div className="admin-grid">
          {/* LEFT TABLE */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <div>
                <div className="admin-table-title">Recent Tickets</div>
                <div className="admin-table-sub">Latest support requests</div>
              </div>
            </div>

            {loadingTickets ? (
              <div className="loading-text">Loading tickets...</div>
            ) : (
              <div className="table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, idx) => {
                      const st = normalizeStatus(t.status);
                      const priority = getPriority(t);
                      const id = getId(t);
                      const completedAt = getCompletedAt(t);

                      return (
                        <tr key={id || idx}>
                          <td>{id}</td>
                          <td>{getTitle(t)}</td>
                          <td>
                            <span className={`priority ${priority.toLowerCase()}`}>
                              {priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${st}`}>
                              {st === "open" && "Open"}
                              {st === "progress" && "In Progress"}
                              {st === "done" && "Resolved"}
                            </span>
                          </td>
                          <td>{completedAt}</td>
                        </tr>
                      );
                    })}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-row">
                          Tidak ada ticket ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT ACTIVITY */}
          <div className="admin-activity-card">
            <div className="admin-activity-title">Recent Activity</div>
            <div className="admin-activity-sub">Latest system updates</div>

            {loadingActivities ? (
              <div className="loading-text">Loading activity...</div>
            ) : (
              <div className="activity-scroll">
                <ul className="activity-list">
                  {activities.map((a, i) => {
                    const message = getMessage(a);
                    const actor = getActor(a);
                    const time = getTime(a);

                    return (
                      <li key={a?.id_log ?? i} className="activity-item">
                        <span className="activity-dot" />
                        <div>
                          <div className="activity-text">{message}</div>
                          <div className="activity-time">
                            by {actor} • {time}
                          </div>

                          {a?.ticket && (
                            <div className="activity-time">
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

                  {activities.length === 0 && (
                    <div className="empty-activity">Belum ada activity.</div>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
