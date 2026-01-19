import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";
import "../styles/admin.css";

import { fetchAdminRecentTickets, fetchAdminSummary } from "../services/tickets";
import { fetchAdminActivities } from "../services/activity";

export default function AdminDashboard() {
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);

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

  const getId = (t) => t?.code_ticket ?? t?.id_ticket ?? t?.id ?? "-";
  const getTitle = (t) => t?.title ?? t?.subject ?? "-";

  const getPriority = (t) => {
    const raw = String(t?.priority ?? "LOW").toUpperCase();
    return raw.charAt(0) + raw.slice(1).toLowerCase();
  };

  const formatJakarta = (raw) => {
    if (!raw) return "-";
    let s = String(raw).trim();

    // "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
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

  const getCompletedAt = (t) =>
    formatJakarta(t?.resolved_at ?? t?.resolution_date ?? t?.closed_at);

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

  // parser aman untuk beberapa bentuk response
  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data;
    return [];
  };

  const loadSummary = async () => {
    try {
      const res = await fetchAdminSummary();
      // biasanya: { message, data: {...} }
      const payload = res?.data ?? res;
      setSummary(payload?.data ?? payload ?? {});
    } catch {
      setSummary(null);
    }
  };

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      setErrorMsg("");

      const res = await fetchAdminRecentTickets();
      const list = extractArray(res);

      // ✅ tampilkan maksimal 10 sesuai backend
      setTickets(list.slice(0, 10));
    } catch (err) {
      console.error(err);
      setTickets([]);
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengambil data tiket dari server."
      );
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadActivities = async () => {
    try {
      setLoadingActivities(true);

      const res = await fetchAdminActivities();
      const list = extractArray(res);

      // ✅ tampilkan 10 aktivitas (sesuai permintaan)
      setActivities(list.slice(0, 10));
    } catch (err) {
      console.error(err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadTickets();
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh tiket tiap 15 detik (opsional)
  useEffect(() => {
    const interval = setInterval(() => loadTickets(), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const q = query.toLowerCase();
    const id = String(getId(t)).toLowerCase();
    const title = String(getTitle(t)).toLowerCase();
    const completedAt = String(getCompletedAt(t)).toLowerCase();
    return id.includes(q) || title.includes(q) || completedAt.includes(q);
  });

  const needsActionTickets = tickets
    .filter((t) => {
      const st = normalizeStatus(t?.status);
      return st === "open" || st === "review";
    })
    .slice(0, 8);

  const stats = {
    total: summary?.tickets?.total ?? tickets.length,
    pending:
      (summary?.tickets?.open ?? 0) + (summary?.tickets?.in_review ?? 0),
    progress: summary?.tickets?.in_progress ?? 0,
    done: summary?.tickets?.resolved ?? 0,
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
            createdAt: t?.created_at ?? t?.createdAt,
            status: normalizeStatus(t?.status),
          }))}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {!!errorMsg && <div className="auth-error">{errorMsg}</div>}

        {/* STAT CARDS */}
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
          {/* TIKET TERBARU */}
          <div className="admin-card admin-table-card">
            <div className="admin-card-head">
              <div>
                <div className="admin-card-title">Tiket Terbaru</div>
                <div className="admin-card-sub">
                  Permintaan bantuan terbaru (maksimal 10)
                </div>
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
                      {filteredTickets.slice(0, 10).map((t, idx) => {
                        const st = normalizeStatus(t?.status);
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

                      {filteredTickets.length === 0 && (
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

          {/* AKTIVITAS TERBARU */}
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
                      <li key={a?.id_log ?? a?.id ?? i} className="activity-item">
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
