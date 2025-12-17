// src/pages/AdminActivity.jsx
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-activity.css";
import api from "../services/api"; // ✅ pakai axios instance lu (sesuaikan path kalau beda)

export default function AdminActivity() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ pagination state (server-side)
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 10;

  const loadActivities = async ({ silent = false, targetPage = page } = {}) => {
    try {
      if (!silent) setLoading(true);
      setErrorMsg("");

      // ✅ route sesuai contoh lu
      const res = await api.get(
        `/admin/dashboard/recent-activities?page=${targetPage}&per_page=${perPage}`
      );

      // backend lu: { message, data: paginator }
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

  // load setiap page berubah
  useEffect(() => {
    loadActivities({ silent: false, targetPage: page });

    // auto refresh 10 detik (tetep di page yang sama)
    const interval = setInterval(() => {
      loadActivities({ silent: true, targetPage: page });
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // helpers
  const getMessage = (a) => a?.details || a?.action || a?.activity || "-";

  const getActor = (a) =>
    a?.user?.name ||
    a?.user_name ||
    (a?.performed_by ? `User #${a.performed_by}` : "System");

  const getTime = (a) => {
    const raw =
      a?.action_time || a?.time || a?.created_at || a?.timestamp || a?.datetime;

    if (!raw) return "-";

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);

    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTicketRef = (a) =>
    a?.ticket?.code_ticket || a?.ticket?.title || a?.ticket_code || "-";

  // ✅ next/prev logic (sesuai yang lu tulis)
  const canPrev = page > 1;
  const canNext = page < lastPage;

  const onNext = () => canNext && setPage((p) => p + 1);
  const onPrev = () => canPrev && setPage((p) => p - 1);

  // tombol angka 5 biji biar cakep
  const pageNumbers = useMemo(() => {
    const total = lastPage || 1;
    const curr = page || 1;
    const maxBtns = 3;

    let start = Math.max(1, curr - 2);
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
          {/* HEADER */}
          <header className="activity-header">
            <h1 className="activity-header-title">Activity Log</h1>
            <p className="activity-header-sub">
              Track system activity and changes
            </p>
          </header>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <section className="activity-card">
            <div className="activity-card-head">
              <div>
                <div className="activity-card-title">System Activity Log</div>
                <div className="activity-card-sub">
                  Recent updates & logs from system
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
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="activity-loading">Loading activity...</div>
            ) : rows.length === 0 ? (
              <div className="activity-empty">Tidak ada activity log.</div>
            ) : (
              <>
                {/* TABLE */}
                <div className="activity-table-wrap">
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Actor</th>
                        <th>Message</th>
                        <th>Ticket</th>
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

                {/* PAGINATION */}
                <div className="activity-pagination">
                  <div className="pg-info">
                    Page <strong>{page}</strong> of <strong>{lastPage}</strong>
                  </div>

                  <button className="pg-btn" onClick={onPrev} disabled={!canPrev}>
                    ← Prev
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

                  <button className="pg-btn" onClick={onNext} disabled={!canNext}>
                    Next →
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
