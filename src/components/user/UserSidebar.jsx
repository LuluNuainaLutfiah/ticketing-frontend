import { Link, useNavigate } from "react-router-dom";

export default function UserSidebar({ active = "dashboard" }) {
  const navigate = useNavigate();
  const item = (key) => `user-nav-item ${active === key ? "active" : ""}`;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="user-sidebar">
      <div className="user-brand">
        <div className="user-brand-logo" />
        <div className="user-brand-text">
          <div className="user-brand-title">IT Helpdesk</div>
          <div className="user-brand-sub">technical support portal</div>
        </div>
      </div>

      <nav className="user-nav">
        <Link to="/user" className={item("dashboard")}>
          <span className="dot dot-green" />
          Dashboard
        </Link>

        <Link to="/user/tickets" className={item("tickets")}>
          <span className="dot dot-gray" />
          My Tickets
        </Link>

        <Link to="/user/create" className={item("create")}>
          <span className="dot dot-gray" />
          Create Ticket
        </Link>

        <Link to="/user/profile" className={item("profile")}>
          <span className="dot dot-gray" />
          Profile
        </Link>
      </nav>

      <button className="user-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
