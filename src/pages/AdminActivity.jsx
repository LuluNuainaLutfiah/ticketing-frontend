import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-activity.css";
import { fetchAdminActivities } from "../services/activity";

export default function AdminActivity() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const perPage = 10;

  const getMessage = (a) =>
    a?.details || a?.action || a?.activity || a?.message || "-";

  const getActor = (a) =>
    a?.user?.name ||
    a?.user_name ||
    (a?.performed_by ? `Pengguna #${a.performed_by}` : "Sistem");

  const formatJakarta = (raw) => {
    if (!raw) return "-";
    let s = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) s = s.replace(" ", "T");
    const hasTimezone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);
    if (!hasTimezone) s += "Z";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(raw);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  };

  const getTime = (a) =>
    formatJakarta(
      a?.action_time || a?.time || a?.created_at || a?.timestamp || a?.datetime
    );

  const getTicketLabel = (a) => {
    const t = a?.ticket;
    if (!t) return "-";
    return t.code_ticket || t.id_ticket || t.id || t.title || "-";
  };

  const load = async (p = page) => {
    try {
      setLoading(true);
      setErrorMsg("");

      // backend sekarang return: { message, data: paginator }
      const res = await fetchAdminActivities({ page: p, perPage });

      const paginator = res?.data; // laravel paginate object
      const list = Array.isArray(paginator?.data) ? paginator.data : [];

      setItems(list);

      // max 5 page juga sudah dibatasi dari backend, tapi aman set dari last_page
      const last = Number(paginator?.last_page || 1);
      setPageCount(Math.max(1, last));
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengambil aktivitas dari server."
      );
      setItems([]);
      setPageCount(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const disableNext = useMemo(() => {
    return loading || page >= pageCount;
  }, [loading, page, pageCount]);

  return (
    <div className="admin-page activity-layout">
      <AdminSidebar
        active="activity"
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        <div className="activity-wrapper">
          <div className="activity-top">
            <div>
              <h1 className="activity-header-title">Aktivitas</h1>
              <div className="activity-header-sub">
                Riwayat pembaruan dan aktivitas terbaru sistem
              </div>
            </div>

            <div className="activity-top-right">
              <button
                type="button"
                className="activity-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu"
              >
                ☰
              </button>

              <button
                type="button"
                className="activity-refresh-btn"
                onClick={() => load(page)}
                disabled={loading}
              >
                {loading ? "Memuat..." : "Refresh"}
              </button>
            </div>
          </div>

          {errorMsg && <div className="activity-error">{errorMsg}</div>}

          <div className="activity-card">
            <div className="activity-card-head">
              <div>
                <div className="activity-card-title">Aktivitas Terbaru</div>
                <div className="activity-card-sub">
                  Data aktivitas terbaru yang tercatat
                </div>
              </div>

              <div className="activity-actions">
                <div className="activity-count">{items.length} data</div>
              </div>
            </div>

            {loading ? (
              <div className="activity-loading">Memuat aktivitas...</div>
            ) : items.length === 0 ? (
              <div className="activity-empty">Belum ada aktivitas.</div>
            ) : (
              <>
                <div className="activity-table-wrap">
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Pelaku</th>
                        <th>Aktivitas</th>
                        <th>Tiket</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((a, idx) => (
                        <tr key={a?.id_log ?? a?.id ?? `${page}-${idx}`}>
                          <td className="td-muted">{getTime(a)}</td>
                          <td className="td-ticket">{getActor(a)}</td>
                          <td className="td-message">{getMessage(a)}</td>
                          <td className="td-muted">{getTicketLabel(a)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="activity-pagination">
                  <button
                    className="pg-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                  >
                    Prev
                  </button>

                  <div className="pg-info">
                    Halaman {page} / {pageCount}
                  </div>

                  <button
                    className="pg-btn"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={disableNext}
                  >
                    Next
                  </button>
                </div>

                <div className="pg-hint">
                  Maksimal 5 halaman (50 data terbaru).
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
