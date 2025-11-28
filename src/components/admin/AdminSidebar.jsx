import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function AdminSidebar({ active = "overview" }) {
  const navigate = useNavigate();

  const itemClass = (key) =>
    `admin-menu-item ${active === key ? "active" : ""}`;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="admin-sidebar-brand">
        <img src={logo} alt="Logo" className="user-brand" />
        <div className="admin-sidebar-brandtext">
          <div className="brand-main">IT Helpdesk</div>
          <div className="brand-sub">technical support portal</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="admin-menu">
        <div
          className={itemClass("overview")}
          onClick={() => navigate("/admin")}
        >
          Ringkasan
        </div>
        <div
          className={itemClass("tickets")}
          onClick={() => navigate("/admin/tickets")}
        >
          Tiket
        </div>
        <div
          className={itemClass("activity")}
          onClick={() => navigate("/admin/activity")}
        >
          Log Aktivitas
        </div>
      </nav>

      {/* Logout */}
      <button className="admin-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
