import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-tickets.css";
import TicketChatPanel from "./TicketChatPanel";
import { fetchUserTickets, fetchUserTicketDetail } from "../services/tickets";

export default function UserTickets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(5);

  const normalizeStatus = (s) => {
    const v = String(s || "").toUpperCase();
    if (v === "IN_REVIEW") return "review";
    if (v === "IN_PROGRESS") return "progress";
    if (v === "RESOLVED" || v === "CLOSED") return "done";
    return "open";
  };

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
    const raw = t.created_at ?? t.createdAt ?? t.date;
    return formatJakarta(raw);
  };

  const resolvedLabel = (t) => {
    const raw = t.resolved_at ?? t.resolution_date ?? t.closed_at;
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
      setLoading(true);
      setErrorMsg("");

      const statusParam =
        statusFilter === "all"
          ? undefined
          : statusFilter === "open"
          ? "OPEN"
          : statusFilter === "review"
          ? "IN_REVIEW"
          : statusFilter === "progress"
          ? "IN_PROGRESS"
          : "RESOLVED";

      const res = await fetchUserTickets({ page, status: statusParam });
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets(1);
  }, []);

  useEffect(() => {
    loadTickets(1);
  }, [statusFilter]);

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();
    const id = String(t.code_ticket ?? t.id_ticket ?? "").toLowerCase();
    const title = String(t.title ?? t.subject ?? "").toLowerCase();
    const category = String(t.category ?? t.category_name ?? "").toLowerCase();
    const desc = String(t.description ?? "").toLowerCase();

    return (
      id.includes(q) ||
      title.includes(q) ||
      category.includes(q) ||
      desc.includes(q)
    );
  });

  const priorityClass = (p) => `ut-pill ut-pri-${String(p || "").toLowerCase()}`;
  const statusClass = (s) => `ut-pill ut-st-${normalizeStatus(s)}`;

  const statusLabel = (s) => {
    const st = normalizeStatus(s);
    if (st === "review") return "Ditinjau";
    if (st === "progress") return "Sedang Diproses";
    if (st === "done") return "Selesai";
    return "Terbuka";
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const openTicketModal = async (ticketOrId) => {
    const isId = typeof ticketOrId === "string" || typeof ticketOrId === "number";
    const idTicket = isId ? ticketOrId : getRealId(ticketOrId);

    if (!idTicket) return;

    if (!isId) setSelectedTicket(ticketOrId);

    try {
      setDetailLoading(true);
      const res = await fetchUserTicketDetail(idTicket);
      const detail = res?.data ?? res;

      const found = tickets.find((x) => String(getRealId(x)) === String(idTicket));
      const merged = { ...(found || {}), ...(isId ? {} : ticketOrId), ...detail };

      setSelectedTicket(merged);

      navigate("/user/tickets", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    navigate("/user/tickets", { replace: true });
  };

  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId) return;

    const idStr = String(openId).trim();
    if (!idStr) return;

    openTicketModal(idStr);
  }, [searchParams]);

  const attachments = getAttachments(selectedTicket)
    .map(normalizeAttachment)
    .filter(Boolean);

  return (
    <div className="user-page">
      <UserSidebar
        active="my-tickets"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="user-main">
        <div className="ut-mobilebar">
          <button
            className="ut-hamburger"
            onClick={openSidebar}
            aria-label="Buka menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="ut-mobilebar-title">
            <div className="ut-mobilebar-main">Tiket Saya</div>
            <div className="ut-mobilebar-sub">Kelola tiket bantuan Anda</div>
          </div>
        </div>

        <header className="ut-header">
          <h1 className="ut-header-title">Tiket Saya</h1>
          <p className="ut-header-sub">Lihat dan kelola semua tiket bantuan Anda.</p>
        </header>

        <section className="ut-controls">
          <input
            className="ut-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tiket..."
          />

          <select
            className="ut-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="open">Terbuka</option>
            <option value="review">Ditinjau</option>
            <option value="progress">Sedang Diproses</option>
            <option value="done">Selesai</option>
          </select>
        </section>

        {!!errorMsg && <div className="ut-error">{errorMsg}</div>}

        <section className="ut-card">
          <div className="ut-card-header">
            <div>
              <h2 className="ut-card-title">Semua Tiket</h2>
              <p className="ut-card-sub">{filtered.length} tiket ditemukan</p>
            </div>
          </div>

          <div className="ut-table-wrap">
            <table className="ut-table">
              <thead>
                <tr>
                  <th>ID Tiket</th>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Prioritas</th>
                  <th>Status</th>
                  <th>Selesai</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="ut-empty">
                      Memuat tiket...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="ut-empty">
                      Tidak ada tiket ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const key = t.id_ticket ?? t.id ?? t.code_ticket ?? Math.random();
                    const ticketId = t.code_ticket ?? t.id_ticket ?? "-";
                    const title = t.title ?? t.subject ?? "-";
                    const category = t.category ?? t.category_name ?? "-";
                    const priority = t.priority ?? "LOW";

                    return (
                      <tr key={key}>
                        <td className="ut-nowrap">{ticketId}</td>
                        <td className="ut-title-cell">{title}</td>
                        <td className="ut-nowrap">{category}</td>
                        <td>
                          <span className={priorityClass(priority)}>
                            {String(priority).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={statusClass(t.status)}>
                            {statusLabel(t.status)}
                          </span>
                        </td>
                        <td className="ut-nowrap">{resolvedLabel(t)}</td>
                        <td className="ut-nowrap">{createdLabel(t)}</td>
                        <td>
                          <button
                            className="ut-view-btn"
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
                <strong>
                  {selectedTicket.category ?? selectedTicket.category_name ?? "-"}
                </strong>
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
                  <span className={statusClass(selectedTicket.status)}>
                    {statusLabel(selectedTicket.status)}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Selesai</span>
                <strong>{resolvedLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Dibuat</span>
                <strong>{createdLabel(selectedTicket)}</strong>
              </div>

              <div className="modal-desc">
                <div className="modal-desc-title">Deskripsi</div>
                <p>{selectedTicket.description ?? "-"}</p>
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
