import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  Timer,
  CheckCircle2,
  Ticket,
  MessageCircleQuestion,
  CalendarClock,
  BookOpenText,
} from "lucide-react";
import UserSidebar from "../components/user/UserSidebar";
import UserTopbar from "../components/user/UserTopbar";
import "../styles/user-dashboard.css";
import { fetchUserTickets, fetchUserTicketDetail } from "../services/tickets";
import TicketChatPanel from "./TicketChatPanel";
import UserFAQ from "./UserFAQ";
import UserServiceHours from "./UserServicesHours";
import UserHowItWorks from "./UserHowItWorks";

const TZ = "Asia/Jakarta";

function safeParseUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

function normalizeStatus(value) {
  const v = String(value || "").toUpperCase();
  if (v === "IN_REVIEW") return "review";
  if (v === "IN_PROGRESS") return "progress";
  if (v === "RESOLVED" || v === "CLOSED") return "done";
  return "open";
}

function statusLabel(value) {
  const st = normalizeStatus(value);
  if (st === "review") return "Ditinjau";
  if (st === "progress") return "Sedang Diproses";
  if (st === "done") return "Selesai";
  return "Terbuka";
}

function mapStatusParam(st) {
  if (st === "open") return "OPEN";
  if (st === "review") return "IN_REVIEW";
  if (st === "progress") return "IN_PROGRESS";
  if (st === "done") return "RESOLVED";
  return undefined;
}

function extractList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  return [];
}

function ticketId(t) {
  return t?.code_ticket ?? t?.id_ticket ?? t?.id ?? "-";
}

function ticketTitle(t) {
  return t?.title ?? t?.subject ?? "-";
}

function ticketRealId(t) {
  return t?.id_ticket ?? t?.id ?? t?.ticket_id ?? null;
}

function formatJakarta(raw) {
  if (!raw) return "-";
  let s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) s = s.replace(" ", "T");
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);
  if (!hasTz) s += "Z";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(raw);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function createdLabel(t) {
  return formatJakarta(t?.created_at ?? t?.createdAt ?? t?.date);
}

function resolvedLabel(t) {
  return formatJakarta(t?.resolved_at ?? t?.resolution_date ?? t?.closed_at);
}

function updatedLabel(t) {
  return formatJakarta(t?.updated_at ?? t?.updatedAt ?? t?.last_update);
}

function getAttachments(t) {
  if (!t) return [];
  const list = Array.isArray(t.attachments)
    ? t.attachments
    : Array.isArray(t.files)
    ? t.files
    : [];
  return list.filter((f) => !f?.id_message);
}

function normalizeAttachment(a) {
  if (!a) return null;
  if (typeof a === "string") {
    const name = a.split("/").pop() || "Lampiran";
    return { url: a, name };
  }
  const url =
    a.url ||
    a.file_url ||
    a.attachment_url ||
    a.path ||
    a.file_path ||
    a.storage_path ||
    "";
  const name =
    a.name ||
    a.original_name ||
    a.filename ||
    a.file_name ||
    (url ? url.split("/").pop() : "Lampiran");
  return { url, name };
}

function buildStorageUrlIfNeeded(urlOrPath) {
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
}

function pillPriority(priority) {
  return `pill pri-${String(priority || "").toLowerCase()}`;
}

function pillStatus(st) {
  return `pill st-${normalizeStatus(st)}`;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => safeParseUser(), []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [tickets, setTickets] = useState([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [openFaq, setOpenFaq] = useState(false);
  const [openServiceHours, setOpenServiceHours] = useState(false);
  const [openHowItWorks, setOpenHowItWorks] = useState(false);

  const closeModal = () => setSelectedTicket(null);

  const loadTickets = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent && !hasLoadedOnce) setErrorMsg("");
        const res = await fetchUserTickets({
          page: 1,
          perPage: 10,
          status: status === "all" ? undefined : mapStatusParam(status),
        });

        const list = extractList(res).slice(0, 10);
        setTickets(list);
        setErrorMsg("");
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Gagal mengambil data tiket dari server.";
        if (!silent || !hasLoadedOnce) setErrorMsg(msg);
      } finally {
        setHasLoadedOnce(true);
      }
    },
    [status, hasLoadedOnce]
  );

  useEffect(() => {
    loadTickets({ silent: false });
  }, []);

  useEffect(() => {
    if (!hasLoadedOnce) return;
    loadTickets({ silent: true });
  }, [status]);

  const pollRef = useRef(null);
  useEffect(() => {
    if (!hasLoadedOnce) return;

    const tick = () => loadTickets({ silent: true });
    pollRef.current = setInterval(tick, 30000);

    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [hasLoadedOnce, loadTickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter((t) => {
      const id = String(t?.code_ticket ?? t?.id_ticket ?? "").toLowerCase();
      const title = String(t?.title ?? t?.subject ?? "").toLowerCase();
      const category = String(t?.category ?? t?.category_name ?? "").toLowerCase();
      return id.includes(q) || title.includes(q) || category.includes(q);
    });
  }, [tickets, query]);

  const stats = useMemo(() => {
    const s = { open: 0, review: 0, progress: 0, done: 0 };
    for (const t of tickets) {
      const k = normalizeStatus(t?.status);
      s[k] += 1;
    }
    return s;
  }, [tickets]);

  const doneTickets = useMemo(() => {
    return tickets
      .filter((t) => normalizeStatus(t.status) === "done")
      .sort((a, b) => {
        const da = new Date(
          a?.resolved_at ?? a?.resolution_date ?? a?.closed_at ?? a?.updated_at ?? 0
        ).getTime();
        const db = new Date(
          b?.resolved_at ?? b?.resolution_date ?? b?.closed_at ?? b?.updated_at ?? 0
        ).getTime();
        return db - da;
      });
  }, [tickets]);

  const notifCount = doneTickets.length;

  const notifItems = useMemo(() => {
    return doneTickets.slice(0, 8).map((t) => ({
      id: ticketId(t),
      title: ticketTitle(t),
      resolvedAt: resolvedLabel(t),
      ticket: t,
    }));
  }, [doneTickets]);

  const openTicketModal = useCallback(async (ticket) => {
    setSelectedTicket(ticket);

    const idTicket = ticketRealId(ticket);
    if (!idTicket) return;

    try {
      setDetailLoading(true);
      const res = await fetchUserTicketDetail(idTicket);
      const detail = res?.data ?? res;
      setSelectedTicket((prev) => ({ ...(prev || ticket), ...detail }));
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const onClickNotifItem = useCallback(
    (item) => {
      const idTicket = ticketRealId(item.ticket);
      setNotifOpen(false);
      if (!idTicket) return;
      navigate(`/user/tickets?open=${encodeURIComponent(idTicket)}`);
    },
    [navigate]
  );

  const attachments = useMemo(() => {
    return getAttachments(selectedTicket).map(normalizeAttachment).filter(Boolean);
  }, [selectedTicket]);

  return (
    <div className="user-page">
      <UserSidebar
        active="dashboard"
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="user-main">
        <div className="user-mobilebar">
          <button
            className="user-hamburger"
            onClick={() => setSidebarOpen(true)}
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
            <div className="user-stat-icon icon-open">
              <Inbox size={18} strokeWidth={1.9} />
            </div>
            <div className="user-stat-title">Tiket Terbuka</div>
            <div className="user-stat-sub">Menunggu respons</div>
            <div className="user-stat-foot">{stats.open} tiket</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-progress">
              <Timer size={18} strokeWidth={1.9} />
            </div>
            <div className="user-stat-title">Sedang Diproses</div>
            <div className="user-stat-sub">Sedang ditangani</div>
            <div className="user-stat-foot">{stats.progress} tiket</div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon icon-done">
              <CheckCircle2 size={18} strokeWidth={1.9} />
            </div>
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
              Buat Tiket Baru
            </button>
          </div>
          <div className="needhelp-icon">
            <Ticket size={22} strokeWidth={1.9} />
          </div>
        </section>

        <section className="recent-card">
          <div className="recent-header">
            <div>
              <div className="recent-title">Tiket Terbaru</div>
              <div className="recent-sub">Permintaan bantuan terbaru Anda</div>
            </div>
            <button className="recent-viewall" onClick={() => navigate("/user/tickets")}>
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
                {!hasLoadedOnce ? (
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
                  filtered.slice(0, 10).map((t) => {
                    const id = ticketId(t);
                    const title = ticketTitle(t);
                    const category = t?.category ?? t?.category_name ?? "-";
                    const priority = t?.priority ?? "LOW";
                    const updated = updatedLabel(t);

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{title}</td>
                        <td>{category}</td>
                        <td>
                          <span className={pillPriority(priority)}>
                            {String(priority).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={pillStatus(t.status)}>
                            {statusLabel(t.status)}
                          </span>
                        </td>
                        <td>{updated}</td>
                        <td>
                          <button className="view-btn" onClick={() => openTicketModal(t)}>
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
        </section>

       <section className="info-grid">
  <button
    type="button"
    className="info-card info-card-clickable"
    onClick={() => setOpenFaq(true)}
    aria-label="Buka FAQ"
  >
    <div className="info-icon info-blue">
      <MessageCircleQuestion size={18} strokeWidth={1.9} />
    </div>
    <div className="info-title">FAQ</div>
    <div className="info-sub">Temukan jawaban dari pertanyaan umum</div>
    <div className="info-link-btn">Lihat FAQ</div>
  </button>

  <button
    type="button"
    className="info-card info-card-clickable"
    onClick={() => setOpenServiceHours(true)}
    aria-label="Buka Jam Layanan"
  >
    <div className="info-icon info-green">
      <CalendarClock size={18} strokeWidth={1.9} />
    </div>
    <div className="info-title">Jam Layanan</div>
    <div className="info-sub">Senin - Jumat: 08.00 - 15.00</div>
    <div className="info-link-btn">Lihat Jadwal</div>
  </button>

  <button
    type="button"
    className="info-card info-card-clickable"
    onClick={() => setOpenHowItWorks(true)}
    aria-label="Buka Cara Kerja"
  >
    <div className="info-icon info-purple">
      <BookOpenText size={18} strokeWidth={1.9} />
    </div>
    <div className="info-title">Cara Kerja</div>
    <div className="info-sub">Pahami bagaimana tiket diproses langkah demi langkah</div>
    <div className="info-link-btn">Lihat Panduan</div>
  </button>
</section>
      </main>

      <UserFAQ mode="modal" open={openFaq} onClose={() => setOpenFaq(false)} />
      <UserServiceHours
        mode="modal"
        open={openServiceHours}
        onClose={() => setOpenServiceHours(false)}
      />
      <UserHowItWorks
        mode="modal"
        open={openHowItWorks}
        onClose={() => setOpenHowItWorks(false)}
      />

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
                  <span className={pillPriority(selectedTicket.priority ?? "LOW")}>
                    {String(selectedTicket.priority ?? "LOW").toUpperCase()}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Status</span>
                <strong>
                  <span className={pillStatus(selectedTicket.status)}>
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