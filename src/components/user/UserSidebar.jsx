import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function UserSidebar({ active = "dashboard" }) {
  const navigate = useNavigate();

  const itemClass = (key) =>
    `user-menu-item ${active === key ? "active" : ""}`;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="user-sidebar">
      
      {/* BRAND */}
      <div className="user-sidebar-brand">
        <img src={logo} className="user-sidebar-logo" alt="Logo" />

        <div className="user-sidebar-brandtext">
          <div className="user-brand-main">IT Helpdesk</div>
          <div className="user-brand-sub">technical support portal</div>
        </div>
      </div>

      {/* MENU LIST */}
      <nav className="user-menu">

        <div
          className={itemClass("dashboard")}
          onClick={() => navigate("/user")}
        >
          Dashboard
        </div>

        <div
          className={itemClass("my-tickets")}
          onClick={() => navigate("/user/tickets")}
        >
          My Tickets
        </div>

        <div
          className={itemClass("create-ticket")}
          onClick={() => navigate("/user/tickets/create")}
        >
          Create Ticket
        </div>

        <div
          className={itemClass("profile")}
          onClick={() => navigate("/user/profile")}
        >
          Profile
        </div>

      </nav>

      <button className="user-logout" onClick={logout}>
        Logout
      </button>

    </aside>
  );
}
