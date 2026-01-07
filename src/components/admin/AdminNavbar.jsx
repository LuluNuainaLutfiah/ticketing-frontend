import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminNavbar({
  query,
  setQuery,
  user,
  notifItems = [],
  onToggleSidebar,
}) {
  const navigate = useNavigate();

  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);

  const notifCount = useMemo(() => notifItems.length, [notifItems]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) setOpenNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (raw) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-navbar-title">
          <div className="admin-navbar-title-main">Dashboard</div>
          <div className="admin-navbar-title-sub">
            Pantau dan kelola operasional dukungan IT
          </div>
        </div>
      </div>

      <div className="admin-navbar-right">
        <button
          type="button"
          className="admin-hamburger"
          onClick={() => onToggleSidebar?.()}
          aria-label="Buka menu"
        >
          ☰
        </button>

        <div className="admin-search-wrap">
          <input
            className="admin-search-input"
            placeholder="Cari tiket..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="admin-notif" ref={notifRef}>
          <button
            type="button"
            className="admin-notif-btn"
            onClick={() => setOpenNotif((p) => !p)}
            aria-label="Notifikasi"
          >
            <span className="admin-notif-bell">🔔</span>
            {notifCount > 0 && (
              <span className="admin-notif-badge">{notifCount}</span>
            )}
          </button>

          {openNotif && (
            <div className="admin-notif-panel">
              <div className="admin-notif-panel-head">
                <div className="admin-notif-panel-title">Notifikasi</div>
                <div className="admin-notif-panel-sub">
                  {notifCount} tiket masih TERBUKA
                </div>
              </div>

              <div className="admin-notif-panel-list">
                {notifCount === 0 ? (
                  <div className="admin-notif-empty">Tidak ada notifikasi 🎉</div>
                ) : (
                  notifItems.slice(0, 8).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="admin-notif-item"
                      onClick={() => {
                        setOpenNotif(false);
                        navigate("/admin/tickets");
                      }}
                    >
                      <div className="admin-notif-item-top">
                        <div className="admin-notif-id">{n.id}</div>
                        <div
                          className={`admin-notif-pri pri-${String(
                            n.priority || ""
                          ).toLowerCase()}`}
                        >
                          {n.priority}
                        </div>
                      </div>
                      <div className="admin-notif-msg">{n.title}</div>
                      <div className="admin-notif-time">
                        {formatTime(n.createdAt || n.created_at)}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                className="admin-notif-panel-foot"
                onClick={() => {
                  setOpenNotif(false);
                  navigate("/admin/tickets");
                }}
              >
                Lihat semua tiket →
              </button>
            </div>
          )}
        </div>

        <div className="admin-user-mini">
          <div className="admin-user-avatar">
            {(user?.name || "A")[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
