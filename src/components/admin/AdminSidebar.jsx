import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function AdminSidebar({ active = "overview" }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const itemClass = (key) =>
    `admin-menu-item ${active === key ? "active" : ""}`;

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
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
          <div className={itemClass("overview")} onClick={() => navigate("/admin")}>
            Ringkasan
          </div>

          <div className={itemClass("tickets")} onClick={() => navigate("/admin/tickets")}>
            Tiket
          </div>

          <div className={itemClass("activity")} onClick={() => navigate("/admin/activity")}>
            Log Aktivitas
          </div>
        </nav>

        {/* Logout */}
        <button className="admin-logout" onClick={() => setShowConfirm(true)}>
          Logout
        </button>
      </aside>

      {/* ====================== */}
      {/* MODAL CONFIRM LOGOUT */}
      {/* ====================== */}
      {showConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">

            <h3 className="logout-title">Konfirmasi Logout</h3>
            <p className="logout-text">
              Apakah Anda yakin ingin logout dari akun admin?
            </p>

            <div className="logout-actions">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
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
