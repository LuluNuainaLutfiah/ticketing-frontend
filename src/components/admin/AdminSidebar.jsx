import { useNavigate } from "react-router-dom";
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
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo" />
        <img src={logo} alt="Logo" className="user-brand" />
        <div className="admin-sidebar-brandtext">
          <div className="brand-main">IT Helpdesk</div>
          <div className="brand-sub">technical support portal</div>
        </div>
      </div>

      <nav className="admin-menu">
        <div className={itemClass("overview")}>Ringkasan</div>
        <div className={itemClass("tickets")}>Tiket</div>
        <div className={itemClass("activity")}>Log Aktivitas</div>
      </nav>

      <button className="admin-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
