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
        <Link to="/admin" className={itemClass("overview")}>
          Ringkasan
        </Link>

        <Link to="/admin/tickets" className={itemClass("tickets")}>
          Tiket
        </Link>

        <Link to="/admin/activity" className={itemClass("activity")}>
          Log Aktivitas
        </Link>
      </nav>

      {/* Logout */}
      <button className="admin-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
