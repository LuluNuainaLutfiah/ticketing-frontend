import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function UserSidebar({ active = "dashboard", mobileOpen = false, onClose }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  const itemClass = (key) => `user-menu-item ${active === key ? "active" : ""}`;

  const go = (path) => {
    navigate(path);
    onClose?.();
  };

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <aside className="user-sidebar user-sidebar-desktop">
        <div className="user-sidebar-brand">
          <img src={logo} className="user-sidebar-logo" alt="Logo IT Helpdesk" />
          <div className="user-sidebar-brandtext">
            <div className="user-brand-main">IT Helpdesk</div>
            <div className="user-brand-sub">Portal Dukungan Teknis</div>
          </div>
        </div>

        <nav className="user-menu">
          <div className={itemClass("dashboard")} onClick={() => go("/user")}>
            Dashboard
          </div>
          <div className={itemClass("my-tickets")} onClick={() => go("/user/tickets")}>
            Tiket Saya
          </div>
          <div className={itemClass("create-ticket")} onClick={() => go("/user/tickets/create")}>
            Buat Tiket
          </div>
          <div className={itemClass("profile")} onClick={() => go("/user/profile")}>
            Profil
          </div>
        </nav>

        <button className="user-logout" onClick={() => setShowConfirm(true)}>
          Logout
        </button>
      </aside>

      <div
        className={`user-sidebar-overlay ${mobileOpen ? "show" : ""}`}
        onClick={() => onClose?.()}
      />

      <aside className={`user-sidebar user-sidebar-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="user-sidebar-drawer-head">
          <div className="user-sidebar-brand">
            <img src={logo} className="user-sidebar-logo" alt="Logo IT Helpdesk" />
            <div className="user-sidebar-brandtext">
              <div className="user-brand-main">IT Helpdesk</div>
              <div className="user-brand-sub">Portal Dukungan Teknis</div>
            </div>
          </div>

          <button className="user-drawer-close" onClick={() => onClose?.()} aria-label="Tutup menu">
            ✕
          </button>
        </div>

        <nav className="user-menu">
          <div className={itemClass("dashboard")} onClick={() => go("/user")}>
            Dashboard
          </div>
          <div className={itemClass("my-tickets")} onClick={() => go("/user/tickets")}>
            Tiket Saya
          </div>
          <div className={itemClass("create-ticket")} onClick={() => go("/user/tickets/create")}>
            Buat Tiket
          </div>
          <div className={itemClass("profile")} onClick={() => go("/user/profile")}>
            Profil
          </div>
        </nav>

        <button className="user-logout" onClick={() => setShowConfirm(true)}>
          Logout
        </button>
      </aside>

      {showConfirm && (
        <div className="logout-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="logout-title">Konfirmasi Logout</h3>
            <p className="logout-text">Apakah Anda yakin ingin keluar dari aplikasi?</p>

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
