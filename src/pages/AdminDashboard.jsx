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

  // ===============================
  // Normalisasi status dari DB
  // DB: OPEN / IN_PROGRESS / CLOSED / RESOLVED
  // UI (sesuai CSS): open / progress / done
  // ===============================
  const normalizeStatus = (s) => {
    const val = String(s || "").toUpperCase();

    if (val === "IN_PROGRESS") return "progress";
    if (val === "CLOSED" || val === "RESOLVED") return "done";
    return "open"; // termasuk OPEN atau value lain
  };

  // Helper sesuai struktur tabel ticketing
  const getId = (t) => t.code_ticket ?? t.id_ticket ?? t.id ?? "-";
  const getTitle = (t) => t.title ?? t.subject ?? "-";

  // Kolom tanggal selesai diperbaiki
  const getCompletedAt = (t) =>
    t.resolved_at ??
    "-";

  const getPriority = (t) => {
    const raw = String(t.priority ?? "LOW").toUpperCase(); // LOW / MEDIUM / HIGH
    // label cantik: Low / Medium / High
    return raw.charAt(0) + raw.slice(1).toLowerCase();
  };

  // ===============================
  // FETCH TICKETS
  // ===============================
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
          err.response?.data?.message ||
            "Gagal ambil data tickets dari server."
        );
      } finally {
        setLoadingTickets(false);
      }
    })();
  }, []);

  // ===============================
  // FETCH ACTIVITY
  // ===============================
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

  // ===============================
  // FILTER UNTUK TABEL "RECENT TICKETS"
  // ===============================
  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();

    const id = String(getId(t)).toLowerCase();
    const title = String(getTitle(t)).toLowerCase();
    const completedAt = String(getCompletedAt(t)).toLowerCase();

    return (
      id.includes(q) ||
      title.includes(q) ||
      completedAt.includes(q)
    );
  });

  // ===============================
  // STATS KARTU ATAS
  // Pending = OPEN, Progress = IN_PROGRESS, Done = CLOSED/RESOLVED
  // ===============================
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => normalizeStatus(t.status) === "open").length,
    progress: tickets.filter((t) => normalizeStatus(t.status) === "progress")
      .length,
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
          {/* LEFT TABLE: RECENT TICKETS */}
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
                          <span
                            className={`priority ${priority.toLowerCase()}`}
                          >
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
      </div>
    </div>
  );
}
