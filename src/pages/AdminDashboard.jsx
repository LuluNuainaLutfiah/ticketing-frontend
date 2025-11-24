import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin.css";

import {
  fetchAdminTickets,
  fetchAdminActivities,
} from "../services/tickets";

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

  // ===== Helper normalisasi status =====
  const normalizeStatus = (s) => {
    const val = String(s || "").toLowerCase();
    if (val === "in_progress" || val === "on_progress" || val === "progress")
      return "progress";
    if (val === "closed" || val === "done" || val === "resolved")
      return "done";
    return "open";
  };

  // ===== ambil tickets =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTickets(true);
        const data = await fetchAdminTickets();

        // Normalisasi response list
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.data?.data)
          ? data.data.data
          : [];

        if (mounted) setTickets(list);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setErrorMsg(
            err.response?.data?.message ||
              "Gagal ambil data tickets dari server."
          );
        }
      } finally {
        if (mounted) setLoadingTickets(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ===== ambil activities =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingActivities(true);
        const data = await fetchAdminActivities();

        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.data?.data)
          ? data.data.data
          : [];

        if (mounted) setActivities(list);
      } catch (err) {
        console.error(err);
        // activity gagal ga perlu blok dashboard
      } finally {
        if (mounted) setLoadingActivities(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ===== pastikan tickets array =====
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  // ===== filtering =====
  const filtered = safeTickets.filter((t) => {
    const idStr = String(t.id ?? "").toLowerCase();
    const titleStr = String(t.title ?? t.subject ?? "").toLowerCase();
    const assigneeStr = String(
      t.assignee?.name ?? t.assignee ?? t.assigned_to ?? ""
    ).toLowerCase();

    const q = query.toLowerCase();
    return (
      idStr.includes(q) || titleStr.includes(q) || assigneeStr.includes(q)
    );
  });

  // ===== stats dari data asli =====
  const stats = {
    total: safeTickets.length,
    open: safeTickets.filter((t) => normalizeStatus(t.status) === "open").length,
    progress: safeTickets.filter((t) => normalizeStatus(t.status) === "progress")
      .length,
    done: safeTickets.filter((t) => normalizeStatus(t.status) === "done").length,
  };

  return (
    <div className="admin-page">
      <AdminNavbar user={user} />

      <div className="admin-wrapper">
        <AdminSidebar active="dashboard" />

        <section className="admin-content">
          <div className="admin-header">
            <h2 className="admin-header-title">Dashboard</h2>
            <p className="admin-header-sub">
              Ringkasan tiket helpdesk terbaru
            </p>
          </div>

          {!!errorMsg && <div className="auth-error">{errorMsg}</div>}

          {/* STAT CARDS */}
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon icon-total">📌</div>
              <div className="stat-title">Total Tickets</div>
              <div className="stat-value">{stats.total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-open">🟥</div>
              <div className="stat-title">Open</div>
              <div className="stat-value">{stats.open}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-progress">🟨</div>
              <div className="stat-title">On Progress</div>
              <div className="stat-value">{stats.progress}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-done">🟩</div>
              <div className="stat-title">Done</div>
              <div className="stat-value">{stats.done}</div>
            </div>
          </div>

          {/* GRID */}
          <div className="admin-grid">
            {/* TABLE */}
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title">Tickets</div>
                <input
                  className="admin-search"
                  placeholder="Search ticket..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {loadingTickets ? (
                <div style={{ padding: 12, fontSize: 12 }}>
                  Loading tickets...
                </div>
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
                      const title = t.title ?? t.subject ?? "-";
                      const priorityRaw = t.priority ?? "low";
                      const priorityClass = String(priorityRaw).toLowerCase();

                      const statusNorm = normalizeStatus(t.status);

                      const assignee =
                        t.assignee?.name ?? t.assignee ?? t.assigned_to ?? "-";

                      return (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{title}</td>
                          <td>
                            <span className={`priority ${priorityClass}`}>
                              {priorityRaw}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${statusNorm}`}>
                              {statusNorm === "open" && "Open"}
                              {statusNorm === "progress" && "On Progress"}
                              {statusNorm === "done" && "Done"}
                            </span>
                          </td>
                          <td>{assignee}</td>
                        </tr>
                      );
                    })}

                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: "center", padding: 14 }}
                        >
                          Tidak ada ticket ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* RECENT ACTIVITY */}
            <div className="admin-activity-card">
              <div className="admin-activity-title">Recent Activity</div>

              {loadingActivities ? (
                <div style={{ padding: 8, fontSize: 11 }}>
                  Loading activity...
                </div>
              ) : (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>By</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((a, i) => (
                      <tr key={i}>
                        <td>{a.activity ?? a.message ?? "-"}</td>
                        <td>{a.by ?? a.user?.name ?? "-"}</td>
                        <td>{a.time ?? a.created_at ?? "-"}</td>
                      </tr>
                    ))}

                    {activities.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          style={{ textAlign: "center", padding: 10 }}
                        >
                          Belum ada activity.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
