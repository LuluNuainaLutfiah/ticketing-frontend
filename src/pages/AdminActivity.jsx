import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-activity.css";

const dummyActivities = [
  {
    id: 1,
    message: "Ticket TKT-001 assigned to Mike Johnson",
    by: "Admin",
    time: "5 minutes ago",
  },
  {
    id: 2,
    message: "Ticket TKT-003 marked as closed",
    by: "Sarah Davis",
    time: "15 minutes ago",
  },
  {
    id: 3,
    message: "New ticket TKT-005 created by Charlie Green",
    by: "System",
    time: "1 hour ago",
  },
  {
    id: 4,
    message: "Ticket TKT-002 priority updated to High",
    by: "Admin",
    time: "2 hours ago",
  },
];

export default function AdminActivity() {
  return (
    <div className="admin-page activity-layout">
      {/* Sidebar kiri */}
      <AdminSidebar active="activity" />

      {/* Konten kanan */}
      <main className="admin-main">
        <div className="activity-wrapper">
          {/* Header halaman */}
          <header className="activity-header">
            <h1 className="activity-header-title">Activity Log</h1>
            <p className="activity-header-sub">
              Track system activity and changes
            </p>
          </header>

          {/* Card utama activity */}
          <section className="activity-card">
            <div className="activity-card-title">System Activity Log</div>
            <div className="activity-card-sub">
              Recent system events and changes
            </div>

            <ul className="activity-list">
              {dummyActivities.map((a) => (
                <li key={a.id} className="activity-item">
                  <div className="activity-avatar">A</div>

                  <div>
                    <div className="activity-text">{a.message}</div>
                    <div className="activity-meta">
                      <span>by {a.by}</span>
                      <span className="dot">•</span>
                      <span>{a.time}</span>
                    </div>
                  </div>
                </li>
              ))}

              {dummyActivities.length === 0 && (
                <div className="activity-empty">
                  Belum ada activity yang tercatat.
                </div>
              )}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
