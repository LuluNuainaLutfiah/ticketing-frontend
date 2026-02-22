import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Ticket,
  CircleDot,
  Timer,
  BadgeCheck,
  Activity,
} from "lucide-react";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";
import "../styles/admin.css";

import { fetchAdminRecentTickets, fetchAdminSummary } from "../services/tickets";
import { fetchAdminActivities } from "../services/activity";

export default function AdminDashboard() {
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");

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

  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data;
    return [];
  };

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetchAdminSummary();
      const payload = res?.data ?? res;
      setSummary(payload?.data ?? payload ?? {});
    } catch {
      setSummary(null);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      setErrorMsg("");
      const res = await fetchAdminRecentTickets();
      const list = extractArray(res);
      setTickets(list.slice(0, 10));
    } catch (err) {
      console.error(err);
      setTickets([]);
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengambil data tiket dari server."
      );
    }
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      const res = await fetchAdminActivities();
      const list = extractArray(res);
      setActivities(list.slice(0, 10));
    } catch (err) {
      console.error(err);
      setActivities([]);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadTickets();
    loadActivities();
  }, [loadSummary, loadTickets, loadActivities]);

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter((t) => {
      const id = String(getId(t)).toLowerCase();
      const title = String(getTitle(t)).toLowerCase();
      const completedAt = String(getCompletedAt(t)).toLowerCase();
      return id.includes(q) || title.includes(q) || completedAt.includes(q);
    });
  }, [tickets, query]);

  const needsActionTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        const st = normalizeStatus(t?.status);
        return st === "open" || st === "review";
      })
      .slice(0, 8);
  }, [tickets]);

  const stats = useMemo(() => {
    return {
      total: summary?.tickets?.total ?? tickets.length,
      pending:
        (summary?.tickets?.open ?? 0) + (summary?.tickets?.in_review ?? 0),
      progress: summary?.tickets?.in_progress ?? 0,
      done: summary?.tickets?.resolved ?? 0,
    };
  }, [summary, tickets]);

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

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon icon-total">
              <Ticket size={18} strokeWidth={2} />
            </div>
            <div className="stat-title">Total Tiket</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-note">Rekap seluruh tiket</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-pending">
              <CircleDot size={18} strokeWidth={2} />
            </div>
            <div className="stat-title">Menunggu</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-note">Open + Ditinjau</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-progress">
              <Timer size={18} strokeWidth={2} />
            </div>
            <div className="stat-title">Diproses</div>
            <div className="stat-value">{stats.progress}</div>
            <div className="stat-note">Sedang dikerjakan</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-done">
              <BadgeCheck size={18} strokeWidth={2} />
            </div>
            <div className="stat-title">Selesai</div>
            <div className="stat-value">{stats.done}</div>
            <div className="stat-note">Resolved / Closed</div>
          </div>
        </div>

        <div className="admin-grid">
          <div className="admin-card admin-table-card">
            <div className="admin-card-head">
              <div>
                <div className="admin-card-title">Tiket Terbaru</div>
                <div className="admin-card-sub">
                  Daftar tiket terbaru (maksimal 10)
                </div>
              </div>
            </div>

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
                            <span className={`priority ${priority.toLowerCase()}`}>
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
          </div>

          <div className="admin-card admin-activity-card">
            <div className="admin-card-head">
              <div>
                <div className="admin-card-title">Aktivitas Terbaru</div>
                <div className="admin-card-sub">Pembaruan sistem terakhir</div>
              </div>

              <div className="admin-card-head-icon" aria-hidden="true">
                <Activity size={18} strokeWidth={2} />
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}