import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-tickets.css";
import TicketChatPanel from "./TicketChatPanel";
import { fetchUserTickets } from "../services/tickets";

export default function UserTickets() {
  const navigate = useNavigate();

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
  const closeModal = () => setSelectedTicket(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await fetchUserTickets();
        const list = Array.isArray(data?.data) ? data.data : data;
        setTickets(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err?.response?.data?.message || "Gagal mengambil data tiket dari server."
        );
        setTickets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();
    const id = String(t.code_ticket ?? t.id_ticket ?? "").toLowerCase();
    const title = String(t.title ?? t.subject ?? "").toLowerCase();
    const category = String(t.category ?? t.category_name ?? "").toLowerCase();
    const desc = String(t.description ?? "").toLowerCase();

    const matchText =
      id.includes(q) || title.includes(q) || category.includes(q) || desc.includes(q);

    const st = normalizeStatus(t.status);
    const matchStatus = statusFilter === "all" ? true : st === statusFilter;

    return matchText && matchStatus;
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

  return (
    <div className="user-page">
      <UserSidebar active="my-tickets" mobileOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="user-main">
        <div className="ut-mobilebar">
          <button className="ut-hamburger" onClick={openSidebar} aria-label="Buka menu">
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

          <button className="ut-new-btn" onClick={() => navigate("/user/tickets/create")}>
            + Buat Tiket Baru
          </button>
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
                          <span className={statusClass(t.status)}>{statusLabel(t.status)}</span>
                        </td>
                        <td className="ut-nowrap">{resolvedLabel(t)}</td>
                        <td className="ut-nowrap">{createdLabel(t)}</td>
                        <td>
                          <button className="ut-view-btn" onClick={() => setSelectedTicket(t)}>
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
                <strong>{selectedTicket.category ?? selectedTicket.category_name ?? "-"}</strong>
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
