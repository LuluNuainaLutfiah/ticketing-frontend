import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import UserTopbar from "../components/user/UserTopbar";
import "../styles/user-dashboard.css";
import { fetchUserTickets, fetchUserTicketDetail } from "../services/tickets";
import TicketChatPanel from "./TicketChatPanel";

export default function UserDashboard() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(5);

  const closeModal = () => setSelectedTicket(null);

  const normalizeStatus = (s) => {
    const v = String(s || "").toUpperCase();
    if (v === "IN_REVIEW") return "review";
    if (v === "IN_PROGRESS") return "progress";
    if (v === "RESOLVED" || v === "CLOSED") return "done";
    return "open";
  };

  const getId = (t) => t?.code_ticket ?? t?.id_ticket ?? t?.id ?? "-";
  const getTitle = (t) => t?.title ?? t?.subject ?? "-";

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

  const createdLabel = (t) => {
    const raw = t?.created_at ?? t?.createdAt ?? t?.date;
    return formatJakarta(raw);
  };

  const resolvedLabel = (t) => {
    const raw = t?.resolved_at ?? t?.resolution_date ?? t?.closed_at;
    return formatJakarta(raw);
  };

  const updatedLabel = (t) => {
    const raw = t?.updated_at ?? t?.updatedAt ?? t?.last_update;
    return formatJakarta(raw);
  };

  const getRealId = (t) => t?.id_ticket ?? t?.id ?? t?.ticket_id ?? null;

  const getAttachments = (t) => {
    if (!t) return [];
    const allFiles = Array.isArray(t.attachments)
      ? t.attachments
      : Array.isArray(t.files)
      ? t.files
      : [];
    return allFiles.filter((file) => !file.id_message);
  };

  const normalizeAttachment = (a) => {
    if (!a) return null;

    if (typeof a === "string") {
      return { url: a, name: a.split("/").pop() || "Lampiran" };
    }

    const url =
      a.url ||
      a.file_url ||
      a.attachment_url ||
      a.path ||
      a.file_path ||
      a.storage_path;

    const name =
      a.name ||
      a.original_name ||
      a.filename ||
      a.file_name ||
      (url ? url.split("/").pop() : "Lampiran");

    return { url: url || "", name };
  };

  const buildStorageUrlIfNeeded = (urlOrPath) => {
    if (!urlOrPath) return "";
    if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;

    const base =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";

    const root = base.replace(/\/api\/?$/, "");
    const cleanPath = String(urlOrPath).replace(/^\/+/, "");

    return cleanPath.startsWith("storage/")
      ? `${root}/${cleanPath}`
      : `${root}/storage/${cleanPath}`;
  };

  const parsePaginator = (res) => {
    const payload = res || {};
    const pager = payload?.data || {};
    const list = Array.isArray(pager?.data) ? pager.data : [];
    const cp = Number(pager?.current_page ?? 1);
    const lp = Number(pager?.last_page ?? 5);
    return { list, current_page: cp, last_page: lp };
  };

  const loadTickets = async (page = 1) => {
    try {
      setLoadingTickets(true);
      setErrorMsg("");
      const res = await fetchUserTickets({
        page,
        status:
          status === "all"
            ? undefined
            : status === "open"
            ? "OPEN"
            : status === "review"
            ? "IN_REVIEW"
            : status === "progress"
            ? "IN_PROGRESS"
            : "RESOLVED",
      });

      const pager = parsePaginator(res);
      setTickets(pager.list);
      setCurrentPage(pager.current_page);
      setLastPage(pager.last_page);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengambil data tiket dari server."
      );
      setTickets([]);
      setCurrentPage(1);
      setLastPage(5);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets(1);
  }, []);

  useEffect(() => {
    loadTickets(1);
  }, [status]);

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();
    const id = String(t?.code_ticket ?? t?.id_ticket ?? "").toLowerCase();
    const title = String(t?.title ?? t?.subject ?? "").toLowerCase();
    const category = String(t?.category ?? t?.category_name ?? "").toLowerCase();
    const matchText = id.includes(q) || title.includes(q) || category.includes(q);
    return matchText;
  });

  const stats = {
    open: tickets.filter((t) => normalizeStatus(t.status) === "open").length,
    review: tickets.filter((t) => normalizeStatus(t.status) === "review").length,
    progress: tickets.filter((t) => normalizeStatus(t.status) === "progress")
      .length,
    done: tickets.filter((t) => normalizeStatus(t.status) === "done").length,
  };

  const priorityClass = (priority) =>
    `pill pri-${String(priority || "").toLowerCase()}`;

  const statusPillClass = (st) => `pill st-${normalizeStatus(st)}`;

  const statusLabel = (s) => {
    const st = normalizeStatus(s);
    if (st === "review") return "Ditinjau";
    if (st === "progress") return "Sedang Diproses";
    if (st === "done") return "Selesai";
    return "Terbuka";
  };

  const doneTickets = useMemo(() => {
    return tickets
      .filter((t) => normalizeStatus(t.status) === "done")
      .sort((a, b) => {
        const da = new Date(
          a?.resolved_at ??
            a?.resolution_date ??
            a?.closed_at ??
            a?.updated_at ??
            0
        ).getTime();
        const db = new Date(
          b?.resolved_at ??
            b?.resolution_date ??
            b?.closed_at ??
            b?.updated_at ??
            0
        ).getTime();
        return db - da;
      });
  }, [tickets]);

  const notifCount = doneTickets.length;

  const notifItems = useMemo(() => {
    return doneTickets.slice(0, 8).map((t) => ({
      id: getId(t),
      title: getTitle(t),
      resolvedAt: resolvedLabel(t),
      ticket: t,
    }));
  }, [doneTickets]);

  const openTicketModal = async (ticket) => {
    setSelectedTicket(ticket);

    const idTicket = getRealId(ticket);
    if (!idTicket) return;

    try {
      setDetailLoading(true);
      const res = await fetchUserTicketDetail(idTicket);
      const detail = res?.data ?? res;
      const merged = { ...ticket, ...detail };
      setSelectedTicket(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const onClickNotifItem = (item) => {
    openTicketModal(item.ticket);
    setNotifOpen(false);
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const attachments = getAttachments(selectedTicket)
    .map(normalizeAttachment)
    .filter(Boolean);

  return (
    <div className="user-page">
      <UserSidebar
        active="dashboard"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="user-main">
        <div className="user-mobilebar">
          <button
            className="user-hamburger"
            onClick={openSidebar}
            aria-label="Buka menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="user-mobilebar-title">
            <div className="user-mobilebar-main">Dashboard</div>
            <div className="user-mobilebar-sub">Ringkasan tiket Anda</div>
          </div>
        </div>

        <UserTopbar
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          user={user}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          notifCount={notifCount}
          notifItems={notifItems}
          onClickNotifItem={onClickNotifItem}
        />

        {!!errorMsg && <div className="user-error">{errorMsg}</div>}

        <div className="user-stats">
          <div className="user-stat-card">
            <div className="user-stat-icon icon-open">📩</div>
            <div className="user-stat-title">Tiket Terbuka</div>
            <div className="user-stat-sub">Menunggu respons</div>
            <div className="user-stat-foot">{stats.open} tiket</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-progress">⏳</div>
            <div className="user-stat-title">Sedang Diproses</div>
            <div className="user-stat-sub">Sedang ditangani</div>
            <div className="user-stat-foot">{stats.progress} tiket</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-done">✅</div>
            <div className="user-stat-title">Selesai</div>
            <div className="user-stat-sub">Tiket telah selesai</div>
            <div className="user-stat-foot">{stats.done} tiket</div>
          </div>
        </div>

        <section className="needhelp">
          <div className="needhelp-text">
            <div className="needhelp-title">Butuh Bantuan?</div>
            <div className="needhelp-sub">
              Buat tiket bantuan baru dan tim kami akan membantu Anda
            </div>
            <button
              className="needhelp-btn"
              onClick={() => navigate("/user/tickets/create")}
            >
              + Buat Tiket Baru
            </button>
          </div>
          <div className="needhelp-icon">🎫</div>
        </section>

        <section className="recent-card">
          <div className="recent-header">
            <div>
              <div className="recent-title">Tiket Terbaru</div>
              <div className="recent-sub">Permintaan bantuan terbaru Anda</div>
            </div>
            <button
              className="recent-viewall"
              onClick={() => navigate("/user/tickets")}
            >
              Lihat Semua
            </button>
          </div>

          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>ID Tiket</th>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Prioritas</th>
                  <th>Status</th>
                  <th>Pembaruan Terakhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loadingTickets ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      Memuat tiket...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      Tidak ada tiket ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const id = getId(t);
                    const title = getTitle(t);
                    const category = t?.category ?? t?.category_name ?? "-";
                    const priority = t?.priority ?? "LOW";
                    const updated = updatedLabel(t);

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{title}</td>
                        <td>{category}</td>
                        <td>
                          <span className={priorityClass(priority)}>
                            {String(priority).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={statusPillClass(t.status)}>
                            {statusLabel(t.status)}
                          </span>
                        </td>
                        <td>{updated}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => openTicketModal(t)}
                          >
                            Lihat
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div
            className="pagination"
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "14px",
              justifyContent: "center",
            }}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => loadTickets(num)}
                disabled={num > lastPage}
                style={{
                  padding: "8px 14px",
                  backgroundColor: currentPage === num ? "#28a745" : "#fff",
                  color: currentPage === num ? "#fff" : "#333",
                  border: "1px solid #ddd",
                  cursor: num > lastPage ? "not-allowed" : "pointer",
                  borderRadius: "4px",
                  opacity: num > lastPage ? 0.5 : 1,
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        <section className="info-grid">
          <div className="info-card">
            <div className="info-icon info-blue">💬</div>
            <div className="info-title">FAQ</div>
            <div className="info-sub">Temukan jawaban dari pertanyaan umum</div>
            <button
              className="info-link-btn"
              onClick={() => navigate("/user/faq")}
            >
              Lihat FAQ →
            </button>
          </div>

          <div className="info-card">
            <div className="info-icon info-green">🗓️</div>
            <div className="info-title">Jam Layanan</div>
            <div className="info-sub">Senin - Jumat: 08.00 - 15.00</div>
            <button
              className="info-link-btn"
              onClick={() => navigate("/user/service-hours")}
            >
              Lihat Jadwal →
            </button>
          </div>

          <div className="info-card">
            <div className="info-icon info-purple">📘</div>
            <div className="info-title">Cara Kerja</div>
            <div className="info-sub">
              Pahami bagaimana tiket Anda diproses langkah demi langkah
            </div>
            <button
              className="info-link-btn"
              onClick={() => navigate("/user/how-it-works")}
            >
              Lihat Panduan →
            </button>
          </div>
        </section>
      </main>

      {selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-title">Detail Tiket</div>
            <div className="modal-sub">
              ID:{" "}
              {selectedTicket.code_ticket ??
                selectedTicket.id_ticket ??
                selectedTicket.ticket_id}
            </div>

            <div className="modal-body">
              <div className="modal-row">
                <span>Judul</span>
                <strong>{selectedTicket.title ?? selectedTicket.subject ?? "-"}</strong>
              </div>

              <div className="modal-row">
                <span>Kategori</span>
                <strong>{selectedTicket.category ?? "-"}</strong>
              </div>

              <div className="modal-row">
                <span>Prioritas</span>
                <strong>
                  <span className={priorityClass(selectedTicket.priority ?? "LOW")}>
                    {String(selectedTicket.priority ?? "LOW").toUpperCase()}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Status</span>
                <strong>
                  <span className={statusPillClass(selectedTicket.status)}>
                    {statusLabel(selectedTicket.status)}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Selesai</span>
                <strong>{resolvedLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Dibuat Pada</span>
                <strong>{createdLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Pembaruan Terakhir</span>
                <strong>{updatedLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-desc">
                <div className="modal-desc-title">Deskripsi</div>
                <p>{selectedTicket.description || "-"}</p>
              </div>

              <div className="modal-desc">
                <div className="modal-desc-title">Lampiran</div>

                {detailLoading ? (
                  <p>Memuat lampiran...</p>
                ) : attachments.length === 0 ? (
                  <p>-</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {attachments.map((att, i) => {
                      const href = buildStorageUrlIfNeeded(att.url);
                      return (
                        <li key={i}>
                          <a href={href} target="_blank" rel="noreferrer">
                            {att.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="modal-chat-wrapper">
                <TicketChatPanel ticket={selectedTicket} user={user} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
