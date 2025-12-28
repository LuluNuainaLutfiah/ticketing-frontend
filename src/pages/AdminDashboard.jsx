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

  const [notifOpen, setNotifOpen] = useState(false);

  const normalizeStatus = (s) => {
    const val = String(s || "").toUpperCase();
    if (val === "IN_PROGRESS") return "progress";
    if (val === "CLOSED" || val === "RESOLVED") return "done";
    return "open";
  };

  const getId = (t) => t.code_ticket ?? t.id_ticket ?? t.id ?? "-";
  const getTitle = (t) => t.title ?? t.subject ?? "-";
  const getCompletedAt = (t) => t.resolved_at ?? "-";

  const getPriority = (t) => {
    const raw = String(t.priority ?? "LOW").toUpperCase();
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

  const getMessage = (a) =>
    a?.details || a?.action || a?.activity || a?.message || "-";

  const getActor = (a) =>
    a?.user?.name ||
    a?.user_name ||
    (a?.performed_by ? `Pengguna #${a.performed_by}` : "Sistem");

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
        err?.response?.data?.message ||
          "Gagal mengambil data tiket dari server."
      );
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadTickets();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingActivities(true);

        const res = await fetchAdminActivities({ page: 1, perPage: 10 });
        const paginator = res?.data;
        const list = Array.isArray(paginator?.data) ? paginator.data : [];

        setActivities(list.slice(0, 6));
      } catch (err) {
        console.error(err);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, []);

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();

    const id = String(getId(t)).toLowerCase();
    const title = String(getTitle(t)).toLowerCase();
    const completedAt = String(getCompletedAt(t)).toLowerCase();

    return id.includes(q) || title.includes(q) || completedAt.includes(q);
  });

  const openTickets = tickets
    .filter((t) => normalizeStatus(t.status) === "open")
    .sort((a, b) => {
      const da = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
      const db = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
      return db - da;
    })
    .slice(0, 8);

  const openCount = tickets.filter(
    (t) => normalizeStatus(t.status) === "open"
  ).length;

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

        <div className="admin-stats admin-stats-4">
          <div className="stat-card">
            <div className="stat-icon icon-total">📌</div>
            <div className="stat-title">Total Tiket</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-note">+12% dari bulan lalu</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-pending">⌛</div>
            <div className="stat-title">Menunggu</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-note">Perlu ditindaklanjuti</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-progress">⚡</div>
            <div className="stat-title">Sedang Diproses</div>
            <div className="stat-value">{stats.progress}</div>
            <div className="stat-note">Sedang dikerjakan</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-done">✅</div>
            <div className="stat-title">Selesai</div>
            <div className="stat-value">{stats.done}</div>
            <div className="stat-note">+8% tingkat penyelesaian</div>
          </div>
        </div>

        <div className="admin-grid">
          <div className="admin-table-card">
            <div className="admin-table-header">
              <div>
                <div className="admin-table-title">Tiket Terbaru</div>
                <div className="admin-table-sub">
                  Permintaan bantuan terbaru
                </div>
              </div>
            </div>

            {loadingTickets ? (
              <div className="loading-text">Memuat data tiket...</div>
            ) : (
              <div className="table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Judul</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Tanggal Selesai</th>
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
                              {st === "open" && "Terbuka"}
                              {st === "progress" && "Diproses"}
                              {st === "done" && "Selesai"}
                            </span>
                          </td>
                          <td>{completedAt}</td>
                        </tr>
                      );
                    })}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-row">
                          Tidak ada tiket ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-activity-card">
            <div className="admin-activity-title">Aktivitas Terbaru</div>
            <div className="admin-activity-sub">
              Pembaruan sistem terbaru
            </div>

            {loadingActivities ? (
              <div className="loading-text">Memuat aktivitas...</div>
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
                            oleh {actor} • {time}
                          </div>

                          {a?.ticket && (
                            <div className="activity-time">
                              Tiket:{" "}
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
                    <div className="empty-activity">
                      Belum ada aktivitas.
                    </div>
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
