import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import "../styles/admin-tickets.css";
import {
  fetchAdminTickets,
  fetchAdminTicketDetail,
  adminUpdateTicketStatus,
  sendTicketMessage,
} from "../services/tickets";
import TicketChatPanel from "./TicketChatPanel";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const closeModal = () => setSelectedTicket(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const normalizeStatus = (s) => {
    const val = String(s || "").toUpperCase();
    if (val === "IN_REVIEW") return "in_review";
    if (val === "IN_PROGRESS") return "in_progress";
    if (val === "RESOLVED" || val === "CLOSED") return "closed";
    return "open";
  };

  const getRealId = (t) => t?.id_ticket ?? t?.id ?? t?.ticket_id ?? null;

  const loadTickets = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await fetchAdminTickets();
      const list = Array.isArray(data?.data) ? data.data : data;

      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengambil data tiket dari server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const counts = useMemo(() => {
    const normalized = tickets.map((t) => normalizeStatus(t.status));
    return {
      open: normalized.filter((s) => s === "open").length,
      in_review: normalized.filter((s) => s === "in_review").length,
      in_progress: normalized.filter((s) => s === "in_progress").length,
      closed: normalized.filter((s) => s === "closed").length,
    };
  }, [tickets]);

  const getId = (t) => t.code_ticket ?? t.id_ticket ?? t.id ?? "-";
  const getTitle = (t) => t.title ?? "-";
  const getCategory = (t) => t.category ?? "-";
  const getPriority = (t) => String(t.priority ?? "LOW");

  const getCreated = (t) => {
    const raw = t.created_at ?? t.createdAt ?? t.date;
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

  const getResolved = (t) => {
    const raw = t.resolved_at ?? t.resolution_date;
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

  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase();

    return tickets
      .map((t) => ({ ...t, _status: normalizeStatus(t.status) }))
      .filter((t) => {
        const okStatus =
          statusFilter === "all" ? true : t._status === statusFilter;

        const id = String(getId(t)).toLowerCase();
        const title = String(getTitle(t)).toLowerCase();
        const category = String(getCategory(t)).toLowerCase();
        const priority = String(getPriority(t)).toLowerCase();

        const okSearch =
          id.includes(q) ||
          title.includes(q) ||
          category.includes(q) ||
          priority.includes(q);

        return okStatus && okSearch;
      });
  }, [tickets, statusFilter, search]);

  const priorityClass = (p) => {
    const val = String(p || "").toLowerCase();
    if (val === "high") return "priority-badge high";
    if (val === "medium") return "priority-badge medium";
    return "priority-badge low";
  };

  const statusClass = (s) => {
    if (s === "open") return "status-badge open";
    if (s === "in_review") return "status-badge in-review";
    if (s === "in_progress") return "status-badge in-progress";
    if (s === "closed") return "status-badge closed";
    return "status-badge";
  };

  const statusLabel = (s) => {
    if (s === "in_review") return "Ditinjau";
    if (s === "in_progress") return "Diproses";
    if (s === "closed") return "Selesai";
    return "Terbuka";
  };

  // ========= Lampiran helpers =========
  const getAttachments = (t) => {
    if (!t) return [];
    if (Array.isArray(t.attachments) && t.attachments.length) return t.attachments;
    if (Array.isArray(t.files) && t.files.length) return t.files;
    if (t.attachment) return [t.attachment];
    if (t.attachment_url) return [t.attachment_url];
    if (t.attachment_path) return [t.attachment_path];
    return [];
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

    const base = import.meta.env.VITE_API_BASE_URL || "";
    const root = base.replace(/\/api\/?$/, "");

    if (urlOrPath.startsWith("/")) return `${root}${urlOrPath}`;
    if (urlOrPath.startsWith("storage/")) return `${root}/${urlOrPath}`;
    return `${root}/storage/${urlOrPath}`;
  };
  // ===================================

  // ✅ FIX UTAMA ADA DI SINI: res dari service sudah "data", jadi pakai res?.data ?? res
  const openTicketModal = async (ticket) => {
    setSelectedTicket(ticket);

    const idTicket = getRealId(ticket);
    if (!idTicket) return;

    try {
      setDetailLoading(true);
      const res = await fetchAdminTicketDetail(idTicket);

      // fetchAdminTicketDetail return res.data dari axios
      // biasanya bentuknya { message, data: {...ticket...} }
      const detail = res?.data ?? res;

      const merged = { ...ticket, ...detail };

      setSelectedTicket(merged);
      setTickets((prev) =>
        prev.map((t) => (getRealId(t) === idTicket ? { ...t, ...detail } : t))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleChat = (ticket) => {
    setSelectedTicket((prev) => {
      const prevId = getRealId(prev);
      const nextId = getRealId(ticket);
      return prevId && nextId && prevId === nextId ? null : ticket;
    });
  };

  const handleUpdateStatus = async (ticket, newStatus) => {
    const idTicket = getRealId(ticket);
    if (!idTicket) {
      alert("ID tiket tidak ditemukan.");
      return null;
    }

    try {
      setUpdatingId(idTicket);

      const result = await adminUpdateTicketStatus(idTicket, newStatus);
      const updatedTicket = result?.data ?? result;
      const merged = { ...ticket, ...updatedTicket };

      setTickets((prev) =>
        prev.map((t) => (getRealId(t) === idTicket ? merged : t))
      );

      setSelectedTicket((prev) => {
        if (!prev) return prev;
        return getRealId(prev) === idTicket ? merged : prev;
      });

      return merged;
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal mengubah status tiket.");
      return null;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetInReview = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "OPEN") return;

    const updated = await handleUpdateStatus(ticket, "IN_REVIEW");
    if (!updated) return;

    try {
      const idTicket = getRealId(updated);
      const fd = new FormData();
      fd.append("message_body", "Tiket Anda sedang ditinjau.");
      await sendTicketMessage(idTicket, fd);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartProgress = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "IN_REVIEW") return;

    const updated = await handleUpdateStatus(ticket, "IN_PROGRESS");
    if (updated) setSelectedTicket(updated);
  };

  const handleResolve = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "IN_PROGRESS") return;

    await handleUpdateStatus(ticket, "RESOLVED");
  };

  const handleReopen = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    if (st !== "RESOLVED" && st !== "CLOSED") return;
    await handleUpdateStatus(ticket, "OPEN");
  };

  const renderActionButtons = (t) => {
    const st = normalizeStatus(t.status);
    const idTicket = getRealId(t);
    const isLoading = updatingId && idTicket && updatingId === idTicket;

    // supaya klik tombol tidak ikut membuka modal row
    const stop = (e) => e.stopPropagation();

    if (st === "open") {
      return (
        <button
          className="action-btn blue"
          disabled={isLoading}
          onClick={(e) => {
            stop(e);
            handleSetInReview(t);
          }}
        >
          {isLoading ? "Menyimpan..." : "Tinjau"}
        </button>
      );
    }

    if (st === "in_review") {
      return (
        <button
          className="action-btn blue"
          disabled={isLoading}
          onClick={(e) => {
            stop(e);
            handleStartProgress(t);
          }}
        >
          {isLoading ? "Menyimpan..." : "Mulai Proses"}
        </button>
      );
    }

    if (st === "in_progress") {
      return (
        <div className="action-stack">
          <button
            className="action-btn purple"
            disabled={isLoading}
            onClick={(e) => {
              stop(e);
              toggleChat(t);
            }}
          >
            Chat
          </button>

          <button
            className="action-btn green"
            disabled={isLoading}
            onClick={(e) => {
              stop(e);
              handleResolve(t);
            }}
          >
            {isLoading ? "Menyimpan..." : "Tandai Selesai"}
          </button>
        </div>
      );
    }

    if (st === "closed") {
      return (
        <button
          className="action-btn gray"
          disabled={isLoading}
          onClick={(e) => {
            stop(e);
            handleReopen(t);
          }}
        >
          {isLoading ? "Menyimpan..." : "Buka Kembali"}
        </button>
      );
    }

    return "-";
  };

  const attachments = getAttachments(selectedTicket)
    .map(normalizeAttachment)
    .filter(Boolean);

  return (
    <div className="admin-page tickets-layout">
      <AdminSidebar
        active="tickets"
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        <div className="tickets-page">
          <div className="tickets-header">
            <div>
              <h1 className="tickets-title">Semua Tiket</h1>
              <p className="tickets-subtitle">Lihat dan kelola seluruh tiket bantuan</p>
            </div>

            <div className="tickets-header-right">
              <button
                type="button"
                className="tickets-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu"
              >
                ☰
              </button>

              <div className="tickets-search">
                <input
                  type="text"
                  placeholder="Cari tiket..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          </div>

          {errorMsg && <div className="tickets-error">{errorMsg}</div>}

          <div className="tickets-card">
            <div className="tickets-card-header">
              <div>
                <h2>Semua Tiket Bantuan</h2>
                <p>Kelola dan pantau seluruh tiket</p>
              </div>

              <div className="tickets-filters">
                <button
                  className={
                    "filter-chip" + (statusFilter === "open" ? " active open" : "")
                  }
                  onClick={() => setStatusFilter("open")}
                >
                  <span className="dot open" />
                  Terbuka ({counts.open})
                </button>

                <button
                  className={
                    "filter-chip" +
                    (statusFilter === "in_review" ? " active in-review" : "")
                  }
                  onClick={() => setStatusFilter("in_review")}
                >
                  <span className="dot in-review" />
                  Ditinjau ({counts.in_review})
                </button>

                <button
                  className={
                    "filter-chip" +
                    (statusFilter === "in_progress" ? " active in-progress" : "")
                  }
                  onClick={() => setStatusFilter("in_progress")}
                >
                  <span className="dot in-progress" />
                  Diproses ({counts.in_progress})
                </button>

                <button
                  className={
                    "filter-chip" + (statusFilter === "closed" ? " active closed" : "")
                  }
                  onClick={() => setStatusFilter("closed")}
                >
                  <span className="dot closed" />
                  Selesai ({counts.closed})
                </button>

                <button
                  className={"filter-chip" + (statusFilter === "all" ? " active" : "")}
                  onClick={() => setStatusFilter("all")}
                >
                  Semua ({tickets.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="tickets-loading">Memuat tiket...</div>
            ) : (
              <div className="tickets-table-wrapper">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>ID Tiket</th>
                      <th>Judul</th>
                      <th>Kategori</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Dibuat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-row">
                          Tidak ada tiket yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t, idx) => {
                        const id = getId(t);
                        const title = getTitle(t);
                        const cat = getCategory(t);
                        const priority = getPriority(t);
                        const st = normalizeStatus(t.status);
                        const created = getCreated(t);

                        return (
                          <tr
                            key={id || idx}
                            onClick={() => openTicketModal(t)}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{id}</td>
                            <td className="ticket-title-cell">{title}</td>
                            <td>{cat}</td>
                            <td>
                              <span className={priorityClass(priority)}>{priority}</span>
                            </td>
                            <td>
                              <span className={statusClass(st)}>{statusLabel(st)}</span>
                            </td>
                            <td>{created}</td>
                            <td>{renderActionButtons(t)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-title">Detail Tiket</div>
            <div className="modal-sub">ID: {getId(selectedTicket)}</div>

            <div className="modal-body">
              <div className="modal-row">
                <span>Judul</span>
                <strong>{getTitle(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Kategori</span>
                <strong>{getCategory(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Prioritas</span>
                <strong>
                  <span className={priorityClass(getPriority(selectedTicket))}>
                    {getPriority(selectedTicket)}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Status</span>
                <strong>
                  <span className={statusClass(normalizeStatus(selectedTicket.status))}>
                    {statusLabel(normalizeStatus(selectedTicket.status))}
                  </span>
                </strong>
              </div>

              <div className="modal-row">
                <span>Selesai</span>
                <strong>{getResolved(selectedTicket)}</strong>
              </div>

              <div className="modal-row">
                <span>Dibuat</span>
                <strong>{getCreated(selectedTicket)}</strong>
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
                <TicketChatPanel ticket={selectedTicket} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
