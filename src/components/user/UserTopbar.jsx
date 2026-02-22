import { useEffect, useRef } from "react";
import { Bell, Search, Filter, ChevronDown } from "lucide-react";

export default function UserTopbar({
  query,
  setQuery,
  status,
  setStatus,
  notifOpen,
  setNotifOpen,
  notifCount = 0,
  notifItems = [],
  onClickNotifItem,
}) {
  const notifRef = useRef(null);

  useEffect(() => {
    if (!setNotifOpen) return;

    const onDocClick = (e) => {
      if (!notifRef.current) return;
      if (notifRef.current.contains(e.target)) return;
      setNotifOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [setNotifOpen]);

  return (
    <div className="user-topbar">
      <div>
        <div className="user-topbar-title">Dashboard</div>
        <div className="user-topbar-sub">
          Ringkasan tiket dan aktivitas terbaru Anda.
        </div>
      </div>

      <div className="user-topbar-right">

        {setNotifOpen && (
          <div className="user-notif" ref={notifRef}>
            <button
              type="button"
              className="user-notif-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Notifikasi"
            >
              <Bell size={18} strokeWidth={2} />
              {notifCount > 0 && (
                <span className="user-notif-badge">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="user-notif-dd">
                <div className="user-notif-head">
                  <div className="user-notif-title">Tiket Selesai</div>
                  <div className="user-notif-sub">
                    {notifCount} tiket telah diselesaikan
                  </div>
                </div>

                {notifItems.length === 0 ? (
                  <div className="user-notif-empty">
                    Belum ada tiket selesai.
                  </div>
                ) : (
                  <div className="user-notif-list">
                    {notifItems.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        className="user-notif-item"
                        onClick={() =>
                          onClickNotifItem && onClickNotifItem(it)
                        }
                      >
                        <div className="user-notif-item-title">
                          <strong>{it.id}</strong> — {it.title}
                        </div>
                        {it.resolvedAt && (
                          <div className="user-notif-item-time">
                            Selesai: {it.resolvedAt}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="user-search-wrap">
          <input
            className="user-search"
            placeholder="Cari tiket..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="user-filter-wrap">
          <Filter size={16} strokeWidth={2} className="user-filter-icon" />
          <select
            className="user-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="open">Open</option>
            <option value="progress">Dalam Proses</option>
            <option value="done">Selesai</option>
          </select>
        </div>

      </div>
    </div>
  );
}