import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-activity.css";
import api from "../services/api";

export default function AdminActivity() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 10;

  const loadActivities = async ({ silent = false, targetPage = page } = {}) => {
    try {
      if (!silent) setLoading(true);
      setErrorMsg("");

      const res = await api.get(
        `/admin/dashboard/recent-activities?page=${targetPage}&per_page=${perPage}`
      );

      const paginator = res?.data?.data;
      const list = Array.isArray(paginator?.data) ? paginator.data : [];

      setRows(list);
      setPage(paginator?.current_page ?? targetPage);
      setLastPage(paginator?.last_page ?? 1);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message ||
          "Gagal mengambil log aktivitas dari server."
      );
      setRows([]);
      setLastPage(1);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities({ silent: false, targetPage: page });

    const interval = setInterval(() => {
      loadActivities({ silent: true, targetPage: page });
    }, 10000);

    return () => clearInterval(interval);
  }, [page]);

  const getMessage = (a) => a?.details || a?.action || a?.activity || "-";

  const getActor = (a) =>
    a?.user?.name ||
    a?.user_name ||
    (a?.performed_by ? `Pengguna #${a.performed_by}` : "Sistem");

    
  const getTime = (a) => {
    const raw =
      a?.action_time || a?.time || a?.created_at || a?.timestamp || a?.datetime;

    if (!raw) return "-";

    let s = String(raw).trim();

    // "YYYY-MM-DD HH:mm:ss" → ISO
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) {
      s = s.replace(" ", "T");
    }

    // Kalau tidak ada timezone, anggap UTC
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

  const getTicketRef = (a) =>
    a?.ticket?.code_ticket || a?.ticket?.title || a?.ticket_code || "-";

  const canPrev = page > 1;
  const canNext = page < lastPage;

  const onNext = () => canNext && setPage((p) => p + 1);
  const onPrev = () => canPrev && setPage((p) => p - 1);

  const pageNumbers = useMemo(() => {
    const total = lastPage || 1;
    const curr = page || 1;
    const maxBtns = 3;

    let start = Math.max(1, curr - 1);
    let end = Math.min(total, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);

    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, lastPage]);

  return (
    <div className="admin-page activity-layout">
      <AdminSidebar active="activity" />

      <main className="admin-main">
        <div className="activity-wrapper">
          <header className="activity-header">
            <h1 className="activity-header-title">Log Aktivitas</h1>
            <p className="activity-header-sub">
              Pantau aktivitas dan perubahan pada sistem
            </p>
          </header>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <section className="activity-card">
            <div className="activity-card-head">
              <div>
                <div className="activity-card-title">Log Aktivitas Sistem</div>
                <div className="activity-card-sub">
                  Pembaruan dan catatan terbaru dari sistem
                </div>
              </div>

              <div className="activity-actions">
                <button
                  type="button"
                  className="activity-refresh-btn"
                  onClick={() =>
                    loadActivities({ silent: false, targetPage: page })
                  }
                  disabled={loading}
                >
                  {loading ? "Memuat ulang..." : "Muat Ulang"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="activity-loading">Memuat aktivitas...</div>
            ) : rows.length === 0 ? (
              <div className="activity-empty">Tidak ada log aktivitas.</div>
            ) : (
              <>
                <div className="activity-table-wrap">
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Pelaku</th>
                        <th>Pesan</th>
                        <th>Tiket</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((a, idx) => (
                        <tr key={a?.id_log ?? idx}>
                          <td className="td-muted">{getTime(a)}</td>
                          <td>{getActor(a)}</td>
                          <td className="td-message">{getMessage(a)}</td>
                          <td className="td-ticket">{getTicketRef(a)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="activity-pagination">
                  <div className="pg-info">
                    Halaman <strong>{page}</strong> dari{" "}
                    <strong>{lastPage}</strong>
                  </div>

                  <button
                    className="pg-btn"
                    onClick={onPrev}
                    disabled={!canPrev}
                  >
                    ← Sebelumnya
                  </button>

                  <div className="pg-pages">
                    {pageNumbers.map((n) => (
                      <button
                        key={n}
                        className={"pg-page" + (n === page ? " active" : "")}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pg-btn"
                    onClick={onNext}
                    disabled={!canNext}
                  >
                    Berikutnya →
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
