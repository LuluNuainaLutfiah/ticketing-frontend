import { useEffect, useMemo, useRef, useState } from "react";
import { fetchTicketMessages, sendTicketMessage } from "../services/tickets";

export default function TicketChatPanel({ ticket }) {
  const ticketId = ticket?.id_ticket;

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const isAdmin = currentUser.role === "admin";
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const bodyRef = useRef(null);
  const status = String(ticket?.status || "").toUpperCase();

  const chatLockedInfo = useMemo(() => {
    if (!ticketId) return "Tiket tidak ditemukan.";
    if (status === "OPEN" && !isAdmin)
      return "Menunggu admin membuka tiket. Chat dikunci.";
    if (status === "IN_REVIEW" && !isAdmin)
      return "Tiket sedang ditinjau. Chat dikunci.";
    if (status === "RESOLVED" && !isAdmin)
      return "Tiket selesai. Chat ditutup.";
    return null;
  }, [status, isAdmin, ticketId]);

  const canSend = !chatLockedInfo;

  useEffect(() => {
    if (!ticketId) return;
    let cancelled = false;

    const loadMessages = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await fetchTicketMessages(ticketId);
        // Penting: Laravel Resource biasanya membungkus data dalam properti 'data'
        const list = Array.isArray(res?.data) ? res.data : res || [];
        if (!cancelled) setMessages(list);
      } catch (err) {
        if (!cancelled && !silent) setErrorMsg("Gagal memuat pesan.");
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    };

    loadMessages(false);
    const interval = setInterval(() => loadMessages(true), 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [ticketId]);

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canSend || sending) return;
    if (!text.trim() && files.length === 0) return;

    try {
      setSending(true);
      const fd = new FormData();
      if (text.trim()) fd.append("message_body", text.trim());
      files.forEach((file) => fd.append("files[]", file));

      const res = await sendTicketMessage(ticketId, fd);
      // Tambahkan pesan baru ke state agar langsung muncul
      const newMsg = res.data || res;
      setMessages((prev) => [...prev, newMsg]);
      setText("");
      setFiles([]);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Gagal mengirim.");
    } finally {
      setSending(false);
    }
  };

  // HELPER URL: Memastikan mengarah ke Port 8000
  const getBackendRoot = () => {
    // Gunakan VITE_API_URL atau VITE_API_BASE_URL sesuai .env kamu
    const base =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";
    return base.replace(/\/api\/?$/, "");
  };

  const openAttachment = async (att) => {
    const root = getBackendRoot();
    const cleanPath = String(att?.file_path || "").replace(/^\/+/, "");
    const fullUrl = `${root}/storage/${cleanPath}`;

    try {
      const token = localStorage.getItem("token");
      // Coba fetch dulu untuk file yang butuh proteksi (private)
      const res = await fetch(fullUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error();

      const contentType = res.headers.get("content-type") || "";
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (/image|pdf/i.test(contentType)) {
        window.open(blobUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = att.file_name;
        a.click();
      }
    } catch (e) {
      // FALLBACK: Jika fetch gagal (CORS/SSL), langsung buka URL di tab baru
      console.warn("Fetch failed, falling back to direct link");
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <div className="ticket-chat">
      <div className="ticket-chat-header">
        <h3>Diskusi Tiket</h3>
        <p className="ticket-chat-sub">Komunikasi dengan Admin IT</p>
      </div>

      <div className="ticket-chat-body" ref={bodyRef}>
        {loading && messages.length === 0 ? (
          <div className="ticket-chat-empty">Memuat...</div>
        ) : (
          messages.map((msg) => {
            const sender = msg.sender || {};
            const isMe = (msg.id_sender ?? sender.id) === currentUser.id;
            const name =
              sender.name || (sender.role === "admin" ? "Admin" : "User");

            // Cari bagian rendering chat bubble di TicketChatPanel.jsx
            return (
              <div
                key={msg.id_message}
                className={`chat-row ${isMe ? "chat-row-right" : "chat-row-left"}`}
              >
                <div className="chat-avatar">{name[0]?.toUpperCase()}</div>
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="chat-sender">{name}</span>
                    <span className="chat-time">
                      {new Date(msg.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {msg.message_body && (
                    <div className="chat-text">{msg.message_body}</div>
                  )}

                  {/* UPDATE: Render Lampiran Chat di sini */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div
                      className="chat-attachments-container"
                      style={{ marginTop: "8px" }}
                    >
                      {msg.attachments.map((att) => (
                        <button
                          key={att.id_attachment}
                          onClick={() => openAttachment(att)}
                          className="chat-attachment-link"
                          style={{ display: "block", marginBottom: "4px" }}
                        >
                          📎 {att.file_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {chatLockedInfo && (
        <div className="ticket-chat-locked">{chatLockedInfo}</div>
      )}

      <form className="ticket-chat-form" onSubmit={handleSend}>
        <textarea
          className="ticket-chat-input"
          placeholder={canSend ? "Tulis pesan..." : "Chat terkunci"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!canSend || sending}
        />
        <div className="ticket-chat-form-bottom">
          <label className="ticket-chat-file">
            📎{" "}
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              hidden
              disabled={!canSend || sending}
            />
          </label>
          <button
            type="submit"
            className="ticket-chat-send-btn"
            disabled={!canSend || sending}
          >
            {sending ? "..." : "Kirim"}
          </button>
        </div>
      </form>
    </div>
  );
}
