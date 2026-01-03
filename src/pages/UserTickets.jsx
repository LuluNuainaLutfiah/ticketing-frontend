// src/pages/UserTickets.jsx
import { useEffect, useMemo, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-tickets.css";
import TicketChatPanel from "./TicketChatPanel";
import { fetchUserTickets } from "../services/tickets";

export default function UserTickets() {
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

  // NORMALISASI STATUS DARI DB → "open" / "progress" / "done"
  const normalizeStatus = (s) => {
    const v = String(s || "").toUpperCase();
    if (v === "IN_PROGRESS") return "progress";
    if (v === "RESOLVED") return "done";
    return "open";
  };

  // GET DATA API
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
          err?.response?.data?.message ||
            "Gagal mengambil data tiket dari server."
        );
        setTickets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // FORMAT TANGGAL CREATED
  const createdLabel = (t) => {
    const raw = t.created_at ?? t.createdAt ?? t.date;
    if (!raw) return "-";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;

    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // FORMAT TANGGAL RESOLVED
  const resolvedLabel = (t) => {
    const raw = t.resolved_at ?? t.resolution_date;
    if (!raw) return "-";

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;

    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // FILTER: search + status
  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();

    const id = String(t.code_ticket ?? t.id_ticket ?? "").toLowerCase();
    const title = String(t.title ?? "").toLowerCase();
    const category = String(t.category ?? "").toLowerCase();
    const desc = String(t.description ?? "").toLowerCase();

    const matchText =
      id.includes(q) ||
      title.includes(q) ||
      category.includes(q) ||
      desc.includes(q);

    const st = normalizeStatus(t.status);
    const matchStatus = statusFilter === "all" ? true : st === statusFilter;

    return matchText && matchStatus;
  });

  const priorityClass = (p) =>
    `ut-priority ut-priority-${String(p || "").toLowerCase()}`;

  const statusClass = (s) => `ut-status ut-status-${normalizeStatus(s)}`;

  const statusLabel = (s) => {
    const st = normalizeStatus(s);
    if (st === "progress") return "Sedang Diproses";
    if (st === "done") return "Selesai";
    return "Terbuka";
  };

  return (
    <div className="user-page">
      <UserSidebar active="my-tickets" />

      <main className="user-main ut-no-topbar">
        {/* HEADER */}
        <header className="ut-header">
          <h1 className="ut-header-title">Tiket Saya</h1>
          <p className="ut-header-sub">
            Lihat dan kelola semua tiket bantuan Anda.
          </p>
        </header>

        {!!errorMsg && <div className="ut-error">{errorMsg}</div>}

        {/* CARD TABLE */}
        <section className="ut-card">
          <div className="ut-card-header">
            <div>
              <h2 className="ut-card-title">Semua Tiket</h2>
              <p className="ut-card-sub">
                {filtered.length} tiket ditemukan
              </p>
            </div>

            <button
              className="ut-new-btn"
              onClick={() => (window.location.href = "/user/tickets/create")}
            >
              + Buat Tiket Baru
            </button>
          </div>

          <div className="ut-table-wrapper">
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
                    const key = t.id_ticket ?? t.id ?? t.code_ticket;
                    const ticketId = t.code_ticket ?? "-";
                    const title = t.title ?? "-";
                    const category = t.category ?? "-";
                    const priority = t.priority ?? "LOW";

                    return (
                      <tr key={key}>
                        <td>{ticketId}</td>
                        <td className="ut-title-cell">{title}</td>
                        <td>{category}</td>
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
                        <td>{resolvedLabel(t)}</td>
                        <td>{createdLabel(t)}</td>
                        <td>
                          <button
                            className="ut-view-btn"
                            onClick={() => setSelectedTicket(t)}
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
        </section>
      </main>

      {/* MODAL DETAIL + CHAT */}
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
                <strong>{selectedTicket.title ?? "-"}</strong>
              </div>

              <div className="modal-row">
                <span>Kategori</span>
                <strong>{selectedTicket.category ?? "-"}</strong>
              </div>

              <div className="modal-row">
                <span>Prioritas</span>
                <strong>
                  <span className={priorityClass(selectedTicket.priority)}>
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
                <TicketChatPanel ticket={selectedTicket} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
