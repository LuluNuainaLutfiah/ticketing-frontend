// src/pages/AdminTickets.jsx
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-tickets.css";
import {
  fetchAdminTickets,
  adminUpdateTicketStatus,
  sendTicketMessage,
} from "../services/tickets";
import TicketChatPanel from "./TicketChatPanel";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const closeModal = () => setSelectedTicket(null);

  // ============================
  // NORMALISASI STATUS
  // DB: OPEN / IN_REVIEW / IN_PROGRESS / RESOLVED
  // UI: open / in_review / in_progress / closed
  // ============================
  const normalizeStatus = (s) => {
    const val = String(s || "").toUpperCase();
    if (val === "IN_REVIEW") return "in_review";
    if (val === "IN_PROGRESS") return "in_progress";
    if (val === "RESOLVED" || val === "CLOSED") return "closed";
    return "open";
  };

  // helper get id (untuk key & compare)
  const getRealId = (t) => t?.id_ticket ?? t?.id ?? t?.ticket_id ?? null;

  // AMBIL DATA TICKET ADMIN
  const loadTickets = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // HITUNG JUMLAH PER STATUS
  const counts = useMemo(() => {
    const normalized = tickets.map((t) => normalizeStatus(t.status));
    return {
      open: normalized.filter((s) => s === "open").length,
      in_review: normalized.filter((s) => s === "in_review").length,
      in_progress: normalized.filter((s) => s === "in_progress").length,
      closed: normalized.filter((s) => s === "closed").length,
    };
  }, [tickets]);

  // HELPER FIELD
  const getId = (t) => t.code_ticket ?? t.id_ticket ?? t.id ?? "-";
  const getTitle = (t) => t.title ?? "-";
  const getCategory = (t) => t.category ?? "-";
  const getPriority = (t) => String(t.priority ?? "LOW");

  const getCreated = (t) => {
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

  const getResolved = (t) => {
    const raw = t.resolved_at ?? t.resolution_date;
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

  // FILTER: STATUS + SEARCH
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

  // BADGE PRIORITY
  const priorityClass = (p) => {
    const val = String(p || "").toLowerCase();
    if (val === "high") return "priority-badge high";
    if (val === "medium") return "priority-badge medium";
    return "priority-badge low";
  };

  // BADGE STATUS
  const statusClass = (s) => {
    if (s === "open") return "status-badge open";
    if (s === "in_review") return "status-badge in-review";
    if (s === "in_progress") return "status-badge in-progress";
    if (s === "closed") return "status-badge closed";
    return "status-badge";
  };

  const statusLabel = (s) => {
    if (s === "in_review") return "In Review";
    if (s === "in_progress") return "In Progress";
    if (s === "closed") return "Resolved";
    return "Open";
  };

  // ============================
  // Toggle chat modal (Chat button)
  // ============================
  const toggleChat = (ticket) => {
    setSelectedTicket((prev) => {
      const prevId = getRealId(prev);
      const nextId = getRealId(ticket);
      return prevId && nextId && prevId === nextId ? null : ticket;
    });
  };

  // ============================
  // UPDATE STATUS BY ADMIN (generic)
  // ============================
  const handleUpdateStatus = async (ticket, newStatus) => {
    const idTicket = getRealId(ticket);
    if (!idTicket) {
      alert("ID tiket tidak ditemukan.");
      return null;
    }

    try {
      setUpdatingId(idTicket);

      // NOTE: service lu kemungkinan expects (id, statusString) atau (id, {status})
      // Karena lu pakai adminUpdateTicketStatus(id, newStatus) sebelumnya, kita pertahankan.
      const result = await adminUpdateTicketStatus(idTicket, newStatus);

      // response bisa { message, data: ticket } atau langsung ticket
      const updatedTicket = result?.data ?? result;

      // pastikan idTicket tetap sama
      const merged = { ...ticket, ...updatedTicket };

      // update list tickets realtime
      setTickets((prev) =>
        prev.map((t) => (getRealId(t) === idTicket ? merged : t))
      );

      // kalau modal sedang buka ticket yang sama, update isi modalnya
      setSelectedTicket((prev) => {
        if (!prev) return prev;
        return getRealId(prev) === idTicket ? merged : prev;
      });

      return merged;
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal mengubah status tiket.");
      return null;
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================
  // ✅ REVISI: OPEN -> IN_REVIEW + kirim pesan otomatis
  // ============================
  const handleSetInReview = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "OPEN") return;

    // 1) update status ke IN_REVIEW
    const updated = await handleUpdateStatus(ticket, "IN_REVIEW");
    if (!updated) return;

    // 2) kirim pesan otomatis ke user
    try {
      const idTicket = getRealId(updated);
      const fd = new FormData();

      // sesuaikan field sesuai backend lu
      fd.append("message_body", "Tiket anda sedang ditinjau");

      await sendTicketMessage(idTicket, fd);
      // sesuai alur lu: di tahap review ga usah auto buka chat
    } catch (err) {
      console.error(err);
      // status sudah berubah, kalau pesan gagal ya biarin aja / optional alert
      // alert("Status berubah, tapi pesan otomatis gagal terkirim.");
    }
  };

  // ============================
  // ✅ REVISI: Start Progress -> IN_PROGRESS + buka modal chat
  // ============================
  const handleStartProgress = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "IN_REVIEW") return;

    const updated = await handleUpdateStatus(ticket, "IN_PROGRESS");
    if (updated) {
      // auto buka chat pas progress dimulai
      setSelectedTicket(updated);
    }
  };

  // ============================
  // RESOLVE / REOPEN
  // ============================
  const handleResolve = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "IN_PROGRESS") return;

    const updated = await handleUpdateStatus(ticket, "RESOLVED");
    if (updated) {
      // optional: tutup modal setelah resolve
      // closeModal();
    }
  };

  const handleReopen = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "RESOLVED" && st !== "CLOSED") return;

    await handleUpdateStatus(ticket, "OPEN");
  };

  // RENDER TOMBOL AKSI PER BARIS
  const renderActionButtons = (t) => {
    const st = normalizeStatus(t.status);
    const idTicket = getRealId(t);
    const isLoading = updatingId && idTicket && updatingId === idTicket;

    if (st === "open") {
      return (
        <button
          className="action-btn blue"
          disabled={isLoading}
          onClick={() => handleSetInReview(t)}
        >
          {isLoading ? "Saving..." : "Review"}
        </button>
      );
    }

    if (st === "in_review") {
      return (
        <button
          className="action-btn blue"
          disabled={isLoading}
          onClick={() => handleStartProgress(t)}
        >
          {isLoading ? "Saving..." : "Start Progress"}
        </button>
      );
    }

    if (st === "in_progress") {
      return (
        <div className="action-stack">
          <button
            className="action-btn purple"
            disabled={isLoading}
            onClick={() => toggleChat(t)}
            title="Open/close chat"
          >
            Chat
          </button>

          <button
            className="action-btn green"
            disabled={isLoading}
            onClick={() => handleResolve(t)}
          >
            {isLoading ? "Saving..." : "Mark as Resolved"}
          </button>
        </div>
      );
    }

    if (st === "closed") {
      return (
        <button
          className="action-btn gray"
          disabled={isLoading}
          onClick={() => handleReopen(t)}
        >
          {isLoading ? "Saving..." : "Reopen"}
        </button>
      );
    }

    return "-";
  };

  return (
    <div className="admin-page tickets-layout">
      <AdminSidebar active="tickets" />

      <main className="admin-main">
        <div className="tickets-page">
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

          {errorMsg && <div className="tickets-error">{errorMsg}</div>}

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
                    (statusFilter === "in_review" ? " active in-review" : "")
                  }
                  onClick={() => setStatusFilter("in_review")}
                >
                  <span className="dot in-review" />
                  In Review ({counts.in_review})
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-row">
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
                            <td className="ticket-title-cell">{title}</td>
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
                            <td>{renderActionButtons(t)}</td>
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

      {/* MODAL DETAIL + CHAT */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-title">Ticket Detail</div>
            <div className="modal-sub">ID: {getId(selectedTicket)}</div>

            <div className="modal-body">
              <div className="modal-row">
                <span>Title</span>
                <strong>{getTitle(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Category</span>
                <strong>{getCategory(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Priority</span>
                <strong>
                  <span className={priorityClass(getPriority(selectedTicket))}>
                    {getPriority(selectedTicket)}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Status</span>
                <strong>
                  <span
                    className={statusClass(normalizeStatus(selectedTicket.status))}
                  >
                    {statusLabel(normalizeStatus(selectedTicket.status))}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Resolved</span>
                <strong>{getResolved(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Created</span>
                <strong>{getCreated(selectedTicket)}</strong>
              </div>

              <div className="modal-desc">
                <div className="modal-desc-title">Description</div>
                <p>{selectedTicket.description ?? "-"}</p>
              </div>

              <div className="modal-chat-wrapper">
                <TicketChatPanel ticket={selectedTicket} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
