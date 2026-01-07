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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const normalizeStatus = (s) => {
    const val = String(s || "").toUpperCase();
    if (val === "IN_REVIEW") return "review";
    if (val === "IN_PROGRESS") return "progress";
    if (val === "CLOSED" || val === "RESOLVED") return "done";
    return "open";
  };

  const getId = (t) => t.code_ticket ?? t.id_ticket ?? t.id ?? "-";
  const getTitle = (t) => t.title ?? t.subject ?? "-";

  const getPriority = (t) => {
    const raw = String(t.priority ?? "LOW").toUpperCase();
    return raw.charAt(0) + raw.slice(1).toLowerCase();
  };

  const formatJakarta = (raw) => {
    if (!raw) return "-";
    let s = String(raw).trim();

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) s = s.replace(" ", "T");

    const hasTimezone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);
    if (!hasTimezone) s += "Z";

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(raw);

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  };

  const createdAtLabel = (t) =>
    formatJakarta(t.created_at ?? t.createdAt ?? t.date);

  const getCompletedAt = (t) =>
    formatJakarta(t.resolved_at ?? t.resolution_date ?? t.closed_at);

  const getMessage = (a) =>
    a?.details || a?.action || a?.activity || a?.message || "-";

  const getActor = (a) =>
    a?.user?.name ||
    a?.user_name ||
    (a?.performed_by ? `Pengguna #${a.performed_by}` : "Sistem");

  const getTime = (a) => {
    const raw =
      a?.action_time || a?.time || a?.created_at || a?.timestamp || a?.datetime;
    return formatJakarta(raw);
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
        err?.response?.data?.message || "Gagal mengambil data tiket dari server."
      );
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadTickets(), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const needsActionTickets = tickets
    .filter((t) => {
      const st = normalizeStatus(t.status);
      return st === "open" || st === "review";
    })
    .sort((a, b) => {
      const da = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
      const db = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
      return db - da;
    })
    .slice(0, 8);

  const needsActionCount = needsActionTickets.length;

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => {
      const st = normalizeStatus(t.status);
      return st === "open" || st === "review";
    }).length,
    review: tickets.filter((t) => normalizeStatus(t.status) === "review").length,
    progress: tickets.filter((t) => normalizeStatus(t.status) === "progress")
      .length,
    done: tickets.filter((t) => normalizeStatus(t.status) === "done").length,
  };

  return (
    <div className="admin-page">
      <AdminSidebar
        active="overview"
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <AdminNavbar
          query={query}
          setQuery={setQuery}
          user={user}
          notifItems={needsActionTickets.map((t) => ({
            id: getId(t),
            title: getTitle(t),
            priority: getPriority(t),
            createdAt: t.created_at ?? t.createdAt,
            status: normalizeStatus(t.status),
          }))}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {!!errorMsg && <div className="auth-error">{errorMsg}</div>}

        <div className="admin-stats">
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
            <div className="stat-note">Open + Ditinjau</div>
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
          <div className="admin-card admin-table-card">
            <div className="admin-card-head">
              <div>
                <div className="admin-card-title">Tiket Terbaru</div>
                <div className="admin-card-sub">Permintaan bantuan terbaru</div>
              </div>
            </div>

            {loadingTickets ? (
              <div className="loading-text">Memuat data tiket...</div>
            ) : (
              <div className="table-scroll">
                <div className="table-x">
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
                            <td className="td-title">{getTitle(t)}</td>
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
                                {st === "review" && "Ditinjau"}
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
              </div>
            )}
          </div>

          <div className="admin-card admin-activity-card">
            <div className="admin-card-head">
              <div>
                <div className="admin-card-title">Aktivitas Terbaru</div>
                <div className="admin-card-sub">Pembaruan sistem terbaru</div>
              </div>
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
                        <div className="activity-body">
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
                    <li className="empty-activity">Belum ada aktivitas.</li>
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
