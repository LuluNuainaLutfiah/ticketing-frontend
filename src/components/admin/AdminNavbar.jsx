import { useNavigate } from "react-router-dom";

export default function AdminNavbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-navbar-logo" />
        <div className="admin-navbar-title">
          <div className="admin-navbar-title-main">IT Helpdesk</div>
          <div className="admin-navbar-title-sub">Admin Panel</div>
        </div>
      </div>

      <div className="admin-navbar-right">
        <div className="admin-navbar-user">
          <div className="admin-navbar-avatar">
            {(user?.name || "A")[0].toUpperCase()}
          </div>
          <div className="admin-navbar-userinfo">
            <div className="admin-navbar-name">{user?.name || "Admin"}</div>
            <div className="admin-navbar-role">{user?.role || "admin"}</div>
          </div>
        </div>

        <button className="admin-navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
