export default function AdminSidebar({ active = "dashboard" }) {
  const itemClass = (key) =>
    `admin-menu-item ${active === key ? "active" : ""}`;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo" />
        <div className="admin-sidebar-brandtext">
          <div className="brand-main">IT Helpdesk</div>
          <div className="brand-sub">Universitas</div>
        </div>
      </div>

      <nav className="admin-menu">
        <div className={itemClass("dashboard")}>Dashboard</div>
        <div className={itemClass("tickets")}>Tickets</div>
        <div className={itemClass("users")}>Users</div>
        <div className={itemClass("categories")}>Categories</div>
        <div className={itemClass("settings")}>Settings</div>
      </nav>
    </aside>
  );
}
