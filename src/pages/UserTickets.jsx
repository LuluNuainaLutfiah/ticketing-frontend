import { useEffect, useMemo, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-tickets.css";
import { fetchUserTickets } from "../services/tickets";

export default function UserTickets() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const closeModal = () => setSelectedTicket(null);

  const normalizeStatus = (s) => {
    const v = String(s || "").toLowerCase();
    if (v === "progress" || v === "in_progress") return "progress";
    if (["done", "resolved", "closed"].includes(v)) return "done";
    return "open";
  };

  // GET DATA API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    })();
  }, []);

  // FILTER
  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();

    const id = String(t.id ?? t.ticket_id ?? "").toLowerCase();
    const title = String(t.title ?? t.subject ?? "").toLowerCase();
    const category = String(t.category ?? t.category_name ?? "").toLowerCase();

    const matchText = id.includes(q) || title.includes(q) || category.includes(q);

    const st = normalizeStatus(t.status);
    const matchStatus = statusFilter === "all" ? true : st === statusFilter;

    return matchText && matchStatus;
  });

  const priorityClass = (p) =>
    `ut-priority ut-priority-${String(p || "").toLowerCase()}`;

  const statusClass = (s) =>
    `ut-status ut-status-${normalizeStatus(s)}`;

  const statusLabel = (s) => {
    const st = normalizeStatus(s);
    if (st === "progress") return "In Progress";
    if (st === "done") return "Closed";
    return "Open";
  };

  const createdLabel = (t) =>
    t.created_at ?? t.createdAt ?? t.date ?? "-";

  return (
    <div className="user-page">
      <UserSidebar active="my-tickets" />

      <main className="user-main ut-no-topbar">

        {/* HEADER */}
        <header className="ut-header">
          <h1 className="ut-header-title">My Tickets</h1>
          <p className="ut-header-sub">
            View and manage all your support tickets.
          </p>
        </header>

        {!!errorMsg && <div className="ut-error">{errorMsg}</div>}

        {/* CARD TABLE */}
        <section className="ut-card">
          <div className="ut-card-header">
            <div>
              <h2 className="ut-card-title">All Tickets</h2>
              <p className="ut-card-sub">
                {filtered.length} tickets found
              </p>
            </div>

            <button className="ut-new-btn">
              + New Ticket
            </button>
          </div>

          <div className="ut-table-wrapper">
            <table className="ut-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="ut-empty">
                      Loading tickets...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="ut-empty">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const id = t.id ?? t.ticket_id ?? "-";
                    const title = t.title ?? t.subject ?? "-";
                    const category = t.category ?? t.category_name ?? "-";
                    const priority = t.priority ?? "Low";
                    const assignee =
                      t.assignee?.name ?? t.assignee ?? "Unassigned";

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td className="ut-title-cell">{title}</td>
                        <td>{category}</td>
                        <td>
                          <span className={priorityClass(priority)}>
                            {priority}
                          </span>
                        </td>
                        <td>
                          <span className={statusClass(t.status)}>
                            {statusLabel(t.status)}
                          </span>
                        </td>
                        <td>{assignee}</td>
                        <td>{createdLabel(t)}</td>
                        <td>
                          <button
                            className="ut-view-btn"
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
      </main>

      {/* Modal tetap sama */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-title">Ticket Detail</div>
            <div className="modal-sub">
              ID: {selectedTicket.id ?? selectedTicket.ticket_id}
            </div>

            <div className="modal-body">
              <div className="modal-row">
                <span>Title</span>
                <strong>
                  {selectedTicket.title ?? selectedTicket.subject}
                </strong>
              </div>

              <div className="modal-row">
                <span>Category</span>
                <strong>{selectedTicket.category}</strong>
              </div>

              <div className="modal-row">
                <span>Priority</span>
                <strong>
                  <span className={priorityClass(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Status</span>
                <strong>
                  <span className={statusClass(selectedTicket.status)}>
                    {statusLabel(selectedTicket.status)}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Assignee</span>
                <strong>
                  {selectedTicket.assignee ?? "Unassigned"}
                </strong>
              </div>

              <div className="modal-row">
                <span>Created</span>
                <strong>{createdLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-desc">
                <div className="modal-desc-title">Description</div>
                <p>{selectedTicket.description ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
