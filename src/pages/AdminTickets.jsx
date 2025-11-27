import React, { useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-tickets.css";

const mockTickets = [
  {
    id: "TKT-001",
    title: "Cannot access email",
    user: "John Doe",
    category: "Email",
    priority: "high",
    status: "in_progress",
    assignee: "Mike Johnson",
    createdAt: "2025-11-09",
  },
  {
    id: "TKT-002",
    title: "WiFi connection issues",
    user: "Jane Smith",
    category: "Network",
    priority: "medium",
    status: "open",
    assignee: "Unassigned",
    createdAt: "2025-11-10",
  },
  {
    id: "TKT-003",
    title: "Software installation request",
    user: "Bob Wilson",
    category: "Software",
    priority: "low",
    status: "closed",
    assignee: "Sarah Davis",
    createdAt: "2025-11-05",
  },
  {
    id: "TKT-004",
    title: "Printer not working",
    user: "Alice Brown",
    category: "Hardware",
    priority: "high",
    status: "open",
    assignee: "Mike Johnson",
    createdAt: "2025-11-11",
  },
  {
    id: "TKT-005",
    title: "Password reset",
    user: "Charlie Green",
    category: "Account",
    priority: "medium",
    status: "in_progress",
    assignee: "Sarah Davis",
    createdAt: "2025-11-10",
  },
];

export default function AdminTickets() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const tickets = mockTickets;

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    }),
    [tickets]
  );

  const filteredTickets = useMemo(
    () =>
      tickets.filter((t) => {
        const okStatus = statusFilter === "all" || t.status === statusFilter;

        const q = search.toLowerCase();
        const okSearch =
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q);

        return okStatus && okSearch;
      }),
    [tickets, statusFilter, search]
  );

  const priorityClass = (p) =>
    p === "high"
      ? "priority-badge high"
      : p === "medium"
      ? "priority-badge medium"
      : "priority-badge low";

  const statusClass = (s) =>
    s === "open"
      ? "status-badge open"
      : s === "in_progress"
      ? "status-badge in-progress"
      : "status-badge closed";

  const statusLabel = (s) =>
    s === "in_progress" ? "In Progress" : s[0].toUpperCase() + s.slice(1);

  return (
    <div className="admin-layout tickets-layout">
      {/* Sidebar kiri */}
      <AdminSidebar active="tickets" />

      {/* Konten kanan */}
      <main className="admin-main">
        <div className="tickets-page">
          {/* Header halaman */}
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

          {/* Card + table */}
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
                    (statusFilter === "in_progress" ? " active in-progress" : "")
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
                      {/* kolom berkurang jadi 6 */}
                      <td colSpan="6" className="empty-row">
                        Tidak ada tiket yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td className="ticket-title-cell">
                          <button className="link-button">{t.title}</button>
                        </td>
                        <td>{t.category}</td>
                        <td>
                          <span className={priorityClass(t.priority)}>
                            {t.priority[0].toUpperCase() + t.priority.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={statusClass(t.status)}>
                            {statusLabel(t.status)}
                          </span>
                        </td>
                        <td>{t.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
