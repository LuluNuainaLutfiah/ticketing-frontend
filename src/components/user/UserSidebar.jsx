import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function UserSidebar({ active = "dashboard" }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const itemClass = (key) =>
    `user-menu-item ${active === key ? "active" : ""}`;

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <aside className="user-sidebar">
        <div className="user-sidebar-brand">
          <img src={logo} className="user-sidebar-logo" alt="Logo" />

          <div className="user-sidebar-brandtext">
            <div className="user-brand-main">IT Helpdesk</div>
            <div className="user-brand-sub">technical support portal</div>
          </div>
        </div>

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

        <button className="user-logout" onClick={() => setShowConfirm(true)}>
          Logout
        </button>
      </aside>

      {showConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3 className="logout-title">Konfirmasi Logout</h3>
            <p className="logout-text">
              Apakah Anda yakin ingin keluar dari aplikasi?
            </p>

            <div className="logout-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Batal
              </button>

              <button className="btn-logout" onClick={doLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
