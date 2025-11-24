import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-dashboard.css"; // biar style nyambung

export default function UserTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // sementara dummy data dulu (nanti ganti API)
  const tickets = useMemo(
    () => [
      {
        id: "TKT-001",
        title: "Cannot access email",
        category: "Email",
        priority: "High",
        status: "progress",
        description: "Saya tidak bisa login ke email kampus sejak pagi.",
        created_at: "2025-11-09 09:00 AM",
        updated_at: "2025-11-10 10:30 AM",
        assignee: "Mike Johnson",
      },
      {
        id: "TKT-002",
        title: "WiFi connection issue",
        category: "Network",
        priority: "Medium",
        status: "open",
        description: "Wifi putus-nyambung di gedung A.",
        created_at: "2025-11-10 01:10 PM",
        updated_at: "2025-11-10 02:45 PM",
        assignee: "Unassigned",
      },
    ],
    []
  );

  const ticket = tickets.find((t) => String(t.id) === String(id));

  const normalizeStatus = (s) => {
    const v = String(s).toLowerCase();
    if (v === "progress" || v === "in_progress") return "progress";
    if (v === "done" || v === "resolved" || v === "closed") return "done";
    return "open";
  };

  if (!ticket) {
    return (
      <div className="user-page">
        <UserSidebar active="tickets" />
        <main className="user-main">
          <div className="recent-card">
            <h3>Ticket tidak ditemukan</h3>
            <button className="view-btn" onClick={() => navigate(-1)}>
              Kembali
            </button>
          </div>
        </main>
      </div>
    );
  }

  const st = normalizeStatus(ticket.status);

  return (
    <div className="user-page">
      <UserSidebar active="tickets" />

      <main className="user-main">
        <div className="recent-card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div className="recent-title">Ticket Detail</div>
              <div className="recent-sub">ID: {ticket.id}</div>
            </div>
            <button className="view-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>

        <div className="recent-card">
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <strong>Title:</strong> {ticket.title}
            </div>
            <div>
              <strong>Category:</strong> {ticket.category}
            </div>
            <div>
              <strong>Priority:</strong>{" "}
              <span className={`pill pri-${ticket.priority.toLowerCase()}`}>
                {ticket.priority}
              </span>
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span className={`pill st-${st}`}>
                {st === "open" && "Open"}
                {st === "progress" && "In Progress"}
                {st === "done" && "Resolved"}
              </span>
            </div>
            <div>
              <strong>Assignee:</strong> {ticket.assignee}
            </div>
            <div>
              <strong>Created At:</strong> {ticket.created_at}
            </div>
            <div>
              <strong>Last Update:</strong> {ticket.updated_at}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

            <div>
              <strong>Description:</strong>
              <p style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
                {ticket.description}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
