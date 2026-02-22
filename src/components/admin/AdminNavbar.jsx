import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Search } from "lucide-react";

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

  const closeNotif = useCallback(() => setOpenNotif(false), []);
  const toggleNotif = useCallback(() => setOpenNotif((v) => !v), []);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!notifRef.current) return;
      if (notifRef.current.contains(e.target)) return;
      closeNotif();
    };

    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [closeNotif]);

  const formatTime = (raw) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  };

  const goTickets = () => {
    closeNotif();
    navigate("/admin/tickets");
  };

  const openTicket = (id) => {
    closeNotif();
    navigate(`/admin/tickets?open=${encodeURIComponent(id)}`);
  };

  const initials = useMemo(() => {
    const name = String(user?.name || "Admin").trim();
    const parts = name.split(" ").filter(Boolean);
    const first = parts[0]?.[0] || "A";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }, [user]);

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
          <Menu size={18} strokeWidth={2} />
        </button>

        <div className="admin-search-wrap">
          <span className="admin-search-icon" aria-hidden="true">
          </span>

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
            onClick={toggleNotif}
            aria-label="Notifikasi tiket"
            title="Notifikasi"
          >
            <Bell size={18} strokeWidth={2} />
            {notifCount > 0 && (
              <span className="admin-notif-badge">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>

          {openNotif && (
            <div className="admin-notif-panel">
              <div className="admin-notif-panel-head">
                <div className="admin-notif-panel-title">Notifikasi</div>
                <div className="admin-notif-panel-sub">
                  {notifCount} tiket butuh perhatian
                </div>
              </div>

              <div className="admin-notif-panel-list">
                {notifCount === 0 ? (
                  <div className="admin-notif-empty">
                    Tidak ada notifikasi.
                  </div>
                ) : (
                  notifItems.slice(0, 8).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="admin-notif-item"
                      onClick={() => openTicket(n.id)}
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
                onClick={goTickets}
              >
                Lihat semua tiket
              </button>
            </div>
          )}
        </div>

        <div className="admin-user-mini" title={user?.name || "Admin"}>
          <div className="admin-user-avatar">{initials}</div>
        </div>
      </div>
    </header>
  );
}