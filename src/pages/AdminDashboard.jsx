import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin.css";
import { fetchAdminTickets, fetchAdminActivities } from "../services/tickets";

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

  const normalizeStatus = (s) => {
    const val = String(s || "").toLowerCase();
    if (["in_progress", "on_progress", "progress"].includes(val)) return "progress";
    if (["resolved", "closed", "done"].includes(val)) return "done";
    if (["pending"].includes(val)) return "pending";
    return "open";
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingTickets(true);
        const data = await fetchAdminTickets();
        const list = Array.isArray(data?.data) ? data.data : data;
        setTickets(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err.response?.data?.message || "Gagal ambil data tickets dari server."
        );
      } finally {
        setLoadingTickets(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingActivities(true);
        const data = await fetchAdminActivities();
        const list = Array.isArray(data?.data) ? data.data : data;
        setActivities(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, []);

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();
    return (
      String(t.id ?? "").toLowerCase().includes(q) ||
      String(t.title ?? t.subject ?? "").toLowerCase().includes(q) ||
      String(t.assignee?.name ?? t.assignee ?? "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => normalizeStatus(t.status) === "pending").length,
    progress: tickets.filter((t) => normalizeStatus(t.status) === "progress").length,
    done: tickets.filter((t) => normalizeStatus(t.status) === "done").length,
  };

  return (
    <div className="admin-page">
      <AdminSidebar active="overview" />

      <div className="admin-main">
        <AdminNavbar query={query} setQuery={setQuery} user={user} />

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
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const st = normalizeStatus(t.status);
                    const priority = String(t.priority || "Low");
                    const assignee =
                      t.assignee?.name ?? t.assignee ?? t.assigned_to ?? "Unassigned";

                    return (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.title ?? t.subject ?? "-"}</td>
                        <td>
                          <span className={`priority ${priority.toLowerCase()}`}>
                            {priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${st}`}>
                            {st === "open" && "Open"}
                            {st === "pending" && "Pending"}
                            {st === "progress" && "In Progress"}
                            {st === "done" && "Resolved"}
                          </span>
                        </td>
                        <td>{assignee}</td>
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
            )}
          </div>

          {/* RIGHT ACTIVITY */}
          <div className="admin-activity-card">
            <div className="admin-activity-title">Recent Activity</div>
            <div className="admin-activity-sub">Latest system updates</div>

            {loadingActivities ? (
              <div className="loading-text">Loading activity...</div>
            ) : (
              <ul className="activity-list">
                {activities.map((a, i) => (
                  <li key={i} className="activity-item">
                    <span className="activity-dot" />
                    <div>
                      <div className="activity-text">
                        {a.activity ?? a.message ?? "-"}
                      </div>
                      <div className="activity-time">
                        {a.time ?? a.created_at ?? "-"}
                      </div>
                    </div>
                  </li>
                ))}

                {activities.length === 0 && (
                  <div className="empty-activity">Belum ada activity.</div>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* NOTE: tabel bawah "Tickets by Category" sengaja tidak dibuat */}
      </div>
    </div>
  );
}
