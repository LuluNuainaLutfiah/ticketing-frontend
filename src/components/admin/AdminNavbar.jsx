import { useState } from "react";

export default function AdminNavbar({ query, setQuery, user }) {
  const [openNotif] = useState(false);

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-navbar-title">
          <div className="admin-navbar-title-main">Overview</div>
          <div className="admin-navbar-title-sub">
            Monitor and manage IT support operations
          </div>
        </div>
      </div>

      <div className="admin-navbar-right">
        <div className="admin-search-wrap">
          <input
            className="admin-search-input"
            placeholder="Search tickets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="admin-notif">
          <span className="admin-notif-bell">🔔</span>
          <span className="admin-notif-badge">3</span>
          {openNotif && <div className="admin-notif-panel">No notif</div>}
        </div>

        <div className="admin-user-mini">
          <div className="admin-user-avatar">
            {(user?.name || "A")[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
