import { useMemo, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import UserTopbar from "../components/user/UserTopbar";
import "../styles/user-dashboard.css";

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

  // modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const closeModal = () => setSelectedTicket(null);

  // Dummy tickets (nanti ganti dari API Laravel)
  const tickets = [
    {
      id: "TKT-001",
      title: "Cannot access email",
      category: "Email",
      priority: "High",
      status: "progress",
      updated_at: "2025-11-10 10:30 AM",
      created_at: "2025-11-09 09:00 AM",
      assignee: "Mike Johnson",
      description: "Saya tidak bisa login ke email kampus sejak pagi.",
    },
    {
      id: "TKT-002",
      title: "WiFi connection issue",
      category: "Network",
      priority: "Medium",
      status: "open",
      updated_at: "2025-11-10 02:45 PM",
      created_at: "2025-11-10 01:10 PM",
      assignee: "Unassigned",
      description: "Wifi putus-nyambung di gedung A.",
    },
    {
      id: "TKT-003",
      title: "Software installation request",
      category: "Software",
      priority: "Low",
      status: "done",
      updated_at: "2025-11-08 04:20 PM",
      created_at: "2025-11-08 09:00 AM",
      assignee: "Sarah Davis",
      description: "Mohon instal software SPSS di lab komputer.",
    },
    {
      id: "TKT-004",
      title: "VPN access not working",
      category: "Network",
      priority: "High",
      status: "progress",
      updated_at: "2025-11-09 03:00 PM",
      created_at: "2025-11-09 10:00 AM",
      assignee: "Mike Johnson",
      description: "VPN tidak bisa connect dari rumah.",
    },
  ];

  const normalizeStatus = (s) => {
    const v = String(s || "").toLowerCase();
    if (v === "progress" || v === "in_progress") return "progress";
    if (v === "done" || v === "resolved" || v === "closed") return "done";
    return "open";
  };

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();
    const matchText =
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);

    const st = normalizeStatus(t.status);
    const matchStatus = status === "all" ? true : st === status;
    return matchText && matchStatus;
  });

  const stats = {
    open: tickets.filter((t) => normalizeStatus(t.status) === "open").length,
    progress: tickets.filter((t) => normalizeStatus(t.status) === "progress").length,
    done: tickets.filter((t) => normalizeStatus(t.status) === "done").length,
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
        />

        {/* STAT CARDS */}
        <div className="user-stats">
          <div className="user-stat-card">
            <div className="user-stat-icon icon-open">📩</div>
            <div className="user-stat-title">Open Tickets</div>
            <div className="user-stat-sub">Waiting for response</div>
            <div className="user-stat-foot">Average response: 2.4 hours</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-progress">⏳</div>
            <div className="user-stat-title">In Progress</div>
            <div className="user-stat-sub">Being worked on</div>
            <div className="user-stat-foot">Latest update: 30 min ago</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-done">✅</div>
            <div className="user-stat-title">Resolved</div>
            <div className="user-stat-sub">Completed tickets</div>
            <div className="user-stat-foot">This month: 1 tickets</div>
          </div>
        </div>

        {/* NEED HELP BANNER */}
        <section className="needhelp">
          <div className="needhelp-text">
            <div className="needhelp-title">Need Help?</div>
            <div className="needhelp-sub">
              Create a new support ticket and our team will assist you
            </div>
            <button className="needhelp-btn">+ Create New Ticket</button>
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
            <button className="recent-viewall">View All</button>
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
                {filtered.map((t) => {
                  const st = normalizeStatus(t.status);
                  return (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.title}</td>
                      <td>{t.category}</td>
                      <td>
                        <span className={`pill pri-${t.priority.toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`pill st-${st}`}>
                          {st === "open" && "Open"}
                          {st === "progress" && "In Progress"}
                          {st === "done" && "Resolved"}
                        </span>
                      </td>
                      <td>{t.updated_at}</td>
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
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      No tickets found.
                    </td>
                  </tr>
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
            <a className="info-link" href="#">Browse FAQ →</a>
          </div>

          <div className="info-card">
            <div className="info-icon info-green">🗓️</div>
            <div className="info-title">Service Hours</div>
            <div className="info-sub">Monday - Friday: 8 AM - 6 PM</div>
            <a className="info-link" href="#">View Schedule →</a>
          </div>

          <div className="info-card">
            <div className="info-icon info-purple">🟣</div>
            <div className="info-title">Live Chat</div>
            <div className="info-sub">Chat with support team</div>
            <a className="info-link" href="#">Start Chat →</a>
          </div>
        </section>
      </main>

      {/* ===== MODAL VIEW TICKET ===== */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-title">Ticket Detail</div>
            <div className="modal-sub">ID: {selectedTicket.id}</div>

            <div className="modal-body">
              <div className="modal-row">
                <span>Title</span>
                <strong>{selectedTicket.title}</strong>
              </div>
              <div className="modal-row">
                <span>Category</span>
                <strong>{selectedTicket.category}</strong>
              </div>
              <div className="modal-row">
                <span>Priority</span>
                <strong>
                  <span className={`pill pri-${selectedTicket.priority.toLowerCase()}`}>
                    {selectedTicket.priority}
                  </span>
                </strong>
              </div>
              <div className="modal-row">
                <span>Status</span>
                <strong>
                  <span className={`pill st-${normalizeStatus(selectedTicket.status)}`}>
                    {normalizeStatus(selectedTicket.status)}
                  </span>
                </strong>
              </div>
              <div className="modal-row">
                <span>Assignee</span>
                <strong>{selectedTicket.assignee || "-"}</strong>
              </div>
              <div className="modal-row">
                <span>Created At</span>
                <strong>{selectedTicket.created_at || "-"}</strong>
              </div>
              <div className="modal-row">
                <span>Last Update</span>
                <strong>{selectedTicket.updated_at || "-"}</strong>
              </div>

              <div className="modal-desc">
                <div className="modal-desc-title">Description</div>
                <p>{selectedTicket.description || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
