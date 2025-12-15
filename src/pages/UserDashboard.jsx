// src/pages/UserDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import UserTopbar from "../components/user/UserTopbar";
import "../styles/user-dashboard.css";
import { fetchUserTickets } from "../services/tickets";
import TicketChatPanel from "./TicketChatPanel";

export default function UserDashboard() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const closeModal = () => setSelectedTicket(null);

  // =========================
  // NORMALISASI STATUS
  // DB: OPEN / IN_PROGRESS / RESOLVED
  // UI: open / progress / done
  // =========================
  const normalizeStatus = (s) => {
    const v = String(s || "").toUpperCase();
    if (v === "IN_PROGRESS") return "progress";
    if (v === "RESOLVED") return "done";
    return "open";
  };

  // =========================
  // FORMAT TANGGAL CREATED
  // =========================
  const createdLabel = (t) => {
    const raw = t.created_at ?? t.createdAt ?? t.date;
    if (!raw) return "-";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // FORMAT TANGGAL RESOLVED
  // =========================
  const resolvedLabel = (t) => {
    const raw = t.resolved_at ?? t.resolution_date;
    if (!raw) return "-";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // AMBIL DATA TICKET
  // =========================
  useEffect(() => {
    (async () => {
      try {
        setLoadingTickets(true);
        setErrorMsg("");

        const data = await fetchUserTickets();
        const list = Array.isArray(data?.data) ? data.data : data;

        setTickets(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err?.response?.data?.message ||
            "Gagal mengambil data tiket dari server."
        );
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    })();
  }, []);

  // =========================
  // FILTER UNTUK RECENT TABLE
  // =========================
  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();

    const id = String(t.code_ticket ?? t.id_ticket ?? "").toLowerCase();
    const title = String(t.title ?? t.subject ?? "").toLowerCase();
    const category = String(t.category ?? t.category_name ?? "").toLowerCase();

    const matchText =
      id.includes(q) || title.includes(q) || category.includes(q);

    const st = normalizeStatus(t.status);
    const matchStatus = status === "all" ? true : st === status;

    return matchText && matchStatus;
  });

  // =========================
  // STATS UNTUK KOTAK ATAS
  // =========================
  const stats = {
    open: tickets.filter((t) => normalizeStatus(t.status) === "open").length,
    progress: tickets.filter((t) => normalizeStatus(t.status) === "progress")
      .length,
    done: tickets.filter((t) => normalizeStatus(t.status) === "done").length,
  };

  const priorityClass = (priority) =>
    `pill pri-${String(priority || "").toLowerCase()}`;

  const statusPillClass = (st) =>
    `pill st-${normalizeStatus(st)}`;

  const statusLabel = (s) => {
    const st = normalizeStatus(s);
    if (st === "progress") return "In Progress";
    if (st === "done") return "Resolved";
    return "Open";
  };

  return (
    <div className="user-page">
      <UserSidebar active="dashboard" />

      <main className="user-main">
        <UserTopbar
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          user={user}
        />

        {!!errorMsg && <div className="user-error">{errorMsg}</div>}

        {/* STAT CARDS */}
        <div className="user-stats">
          <div className="user-stat-card">
            <div className="user-stat-icon icon-open">📩</div>
            <div className="user-stat-title">Open Tickets</div>
            <div className="user-stat-sub">Waiting for response</div>
            <div className="user-stat-foot">{stats.open} tickets</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-progress">⏳</div>
            <div className="user-stat-title">In Progress</div>
            <div className="user-stat-sub">Being worked on</div>
            <div className="user-stat-foot">{stats.progress} tickets</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-done">✅</div>
            <div className="user-stat-title">Resolved</div>
            <div className="user-stat-sub">Completed tickets</div>
            <div className="user-stat-foot">{stats.done} tickets</div>
          </div>
        </div>

        {/* NEED HELP BANNER */}
        <section className="needhelp">
          <div className="needhelp-text">
            <div className="needhelp-title">Need Help?</div>
            <div className="needhelp-sub">
              Create a new support ticket and our team will assist you
            </div>
            <button
              className="needhelp-btn"
              onClick={() => (window.location.href = "/user/tickets/create")}
            >
              + Create New Ticket
            </button>
          </div>
          <div className="needhelp-icon">🎫</div>
        </section>

        {/* RECENT TICKETS TABLE */}
        <section className="recent-card">
          <div className="recent-header">
            <div>
              <div className="recent-title">Recent Tickets</div>
              <div className="recent-sub">Your latest support requests</div>
            </div>
            <button
              className="recent-viewall"
              onClick={() => (window.location.href = "/user/tickets")}
            >
              View All
            </button>
          </div>

          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingTickets ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      Loading tickets...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const id = t.code_ticket ?? t.id_ticket ?? "-";
                    const title = t.title ?? t.subject ?? "-";
                    const category = t.category ?? t.category_name ?? "-";
                    const priority = t.priority ?? "LOW";
                    const updated =
                      t.updated_at ?? t.updatedAt ?? t.last_update ?? "-";

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{title}</td>
                        <td>{category}</td>
                        <td>
                          <span className={priorityClass(priority)}>
                            {String(priority).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={statusPillClass(t.status)}>
                            {statusLabel(t.status)}
                          </span>
                        </td>
                        <td>{updated}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => setSelectedTicket(t)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* INFO CARDS */}
        <section className="info-grid">
          <div className="info-card">
            <div className="info-icon info-blue">💬</div>
            <div className="info-title">FAQ</div>
            <div className="info-sub">Find answers to common questions</div>
            <a className="info-link" href="#">
              Browse FAQ →
            </a>
          </div>

          <div className="info-card">
            <div className="info-icon info-green">🗓️</div>
            <div className="info-title">Service Hours</div>
            <div className="info-sub">Monday - Friday: 8 AM - 6 PM</div>
            <a className="info-link" href="#">
              View Schedule →
            </a>
          </div>

          <div className="info-card">
            <div className="info-icon info-purple">🟣</div>
            <div className="info-title">Live Chat</div>
            <div className="info-sub">Chat with support team</div>
            <a className="info-link" href="#">
              Start Chat →
            </a>
          </div>
        </section>
      </main>

      {/* ===== MODAL VIEW TICKET + CHAT ===== */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-title">Ticket Detail</div>
            <div className="modal-sub">
              ID:{" "}
              {selectedTicket.code_ticket ??
                selectedTicket.id_ticket ??
                selectedTicket.ticket_id}
            </div>

            <div className="modal-body">
              <div className="modal-row">
                <span>Title</span>
                <strong>{selectedTicket.title ?? selectedTicket.subject}</strong>
              </div>

              <div className="modal-row">
                <span>Category</span>
                <strong>{selectedTicket.category ?? "-"}</strong>
              </div>

              <div className="modal-row">
                <span>Priority</span>
                <strong>
                  <span
                    className={priorityClass(
                      selectedTicket.priority ?? "LOW"
                    )}
                  >
                    {String(selectedTicket.priority ?? "LOW").toUpperCase()}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Status</span>
                <strong>
                  <span className={statusPillClass(selectedTicket.status)}>
                    {statusLabel(selectedTicket.status)}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Resolved</span>
                <strong>{resolvedLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Created At</span>
                <strong>{createdLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Last Update</span>
                <strong>
                  {selectedTicket.updated_at ??
                    selectedTicket.updatedAt ??
                    selectedTicket.last_update ??
                    "-"}
                </strong>
              </div>

              <div className="modal-desc">
                <div className="modal-desc-title">Description</div>
                <p>{selectedTicket.description || "-"}</p>
              </div>

              {/* ==== CHAT PANEL DI DALAM MODAL ==== */}
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
