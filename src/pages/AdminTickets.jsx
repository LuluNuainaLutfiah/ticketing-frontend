// src/pages/AdminTickets.jsx
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-tickets.css";
import { fetchAdminTickets } from "../services/tickets";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ============================
  // Normalisasi status dari DB
  // DB: OPEN / IN_PROGRESS / CLOSED
  // UI: open / in_progress / closed
  // ============================
  const normalizeStatus = (s) => {
    const val = String(s || "").toUpperCase();

    if (val === "IN_PROGRESS") return "in_progress";
    if (val === "CLOSED") return "closed";
    // termasuk OPEN atau apapun yg tidak dikenali -> open
    return "open";
  };

  // Ambil data ticket dari server (admin endpoint)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    })();
  }, []);

  // Hitung statistik per status
  const counts = useMemo(() => {
    const normalized = tickets.map((t) => normalizeStatus(t.status));
    return {
      open: normalized.filter((s) => s === "open").length,
      in_progress: normalized.filter((s) => s === "in_progress").length,
      closed: normalized.filter((s) => s === "closed").length,
    };
  }, [tickets]);

  // ============================
  // Helper sesuai struktur tabel `ticketing`
  // ============================
  const getId = (t) =>
    t.code_ticket ?? t.id_ticket ?? t.id ?? "-";

  const getTitle = (t) => t.title ?? "-";

  const getCategory = (t) => t.category ?? "-";

  const getPriority = (t) => String(t.priority ?? "LOW");

  const getCreated = (t) => {
    const raw = t.created_at ?? t.createdAt ?? t.date;
    if (!raw) return "-";
    // kalau mau tetap raw dari DB, cukup: return raw;
    try {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return raw;
      return d.toLocaleString(); // bebas mau diubah formatnya
    } catch {
      return raw;
    }
  };

  // Data setelah filter status + search
  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase();

    return tickets
      .map((t) => ({ ...t, _status: normalizeStatus(t.status) }))
      .filter((t) => {
        const okStatus =
          statusFilter === "all" ? true : t._status === statusFilter;

        const id = String(getId(t)).toLowerCase();
        const title = String(getTitle(t)).toLowerCase();
        const category = String(getCategory(t)).toLowerCase();
        const priority = String(getPriority(t)).toLowerCase();

        const okSearch =
          id.includes(q) ||
          title.includes(q) ||
          category.includes(q) ||
          priority.includes(q);

        return okStatus && okSearch;
      });
  }, [tickets, statusFilter, search]);

  // Badge priority
  const priorityClass = (p) => {
    const val = String(p || "").toLowerCase();
    if (val === "high") return "priority-badge high";
    if (val === "medium") return "priority-badge medium";
    return "priority-badge low";
  };

  // Badge status
  const statusClass = (s) => {
    if (s === "open") return "status-badge open";
    if (s === "in_progress") return "status-badge in-progress";
    if (s === "closed") return "status-badge closed";
    return "status-badge";
  };

  const statusLabel = (s) => {
    if (s === "in_progress") return "In Progress";
    if (s === "closed") return "Closed";
    return "Open";
  };

  return (
    <div className="admin-page tickets-layout">
      {/* Sidebar kiri */}
      <AdminSidebar active="tickets" />

      {/* Konten kanan */}
      <main className="admin-main">
        <div className="tickets-page">
          {/* HEADER */}
          <div className="tickets-header">
            <div>
              <h1 className="tickets-title">All Tickets</h1>
              <p className="tickets-subtitle">
                View and manage all support tickets
              </p>
            </div>

            <div className="tickets-header-right">
              <div className="tickets-search">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {errorMsg && <div className="tickets-error">{errorMsg}</div>}

          {/* CARD + TABLE */}
          <div className="tickets-card">
            <div className="tickets-card-header">
              <div>
                <h2>All Support Tickets</h2>
                <p>Manage and track all tickets</p>
              </div>

              <div className="tickets-filters">
                <button
                  className={
                    "filter-chip" +
                    (statusFilter === "open" ? " active open" : "")
                  }
                  onClick={() => setStatusFilter("open")}
                >
                  <span className="dot open" />
                  Open ({counts.open})
                </button>

                <button
                  className={
                    "filter-chip" +
                    (statusFilter === "in_progress"
                      ? " active in-progress"
                      : "")
                  }
                  onClick={() => setStatusFilter("in_progress")}
                >
                  <span className="dot in-progress" />
                  In Progress ({counts.in_progress})
                </button>

                <button
                  className={
                    "filter-chip" +
                    (statusFilter === "closed" ? " active closed" : "")
                  }
                  onClick={() => setStatusFilter("closed")}
                >
                  <span className="dot closed" />
                  Closed ({counts.closed})
                </button>

                <button
                  className={
                    "filter-chip" + (statusFilter === "all" ? " active" : "")
                  }
                  onClick={() => setStatusFilter("all")}
                >
                  All ({tickets.length})
                </button>
              </div>
            </div>

            {/* TABLE */}
            {loading ? (
              <div className="tickets-loading">Loading tickets...</div>
            ) : (
              <div className="tickets-table-wrapper">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-row">
                          Tidak ada tiket yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t, idx) => {
                        const id = getId(t);
                        const title = getTitle(t);
                        const cat = getCategory(t);
                        const priority = getPriority(t);
                        const st = normalizeStatus(t.status);
                        const created = getCreated(t);

                        return (
                          <tr key={id || idx}>
                            <td>{id}</td>
                            <td className="ticket-title-cell">
                              {/* nanti bisa diarahkan ke halaman detail */}
                              <button className="link-button">{title}</button>
                            </td>
                            <td>{cat}</td>
                            <td>
                              <span className={priorityClass(priority)}>
                                {priority}
                              </span>
                            </td>
                            <td>
                              <span className={statusClass(st)}>
                                {statusLabel(st)}
                              </span>
                            </td>
                            <td>{created}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
