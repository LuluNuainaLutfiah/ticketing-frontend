// src/pages/TicketChatPanel.jsx
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
    if (!ticketId) return "Ticket tidak ditemukan.";

    if (status === "OPEN" && !isAdmin) {
      return "Menunggu admin membuka ticket. Chat sementara dikunci.";
    }

    if (status === "IN_REVIEW" && !isAdmin) {
      return "Ticket sedang ditinjau admin. Chat sementara dikunci.";
    }

    if (status === "RESOLVED" && !isAdmin) {
      return "Ticket sudah selesai. Chat tidak bisa digunakan lagi.";
    }

    return null;
  }, [status, isAdmin, ticketId]);

  const canSend = !chatLockedInfo;

  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadMessages = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setErrorMsg("");

        const data = await fetchTicketMessages(ticketId);
        const list = Array.isArray(data?.data) ? data.data : data;

        if (!cancelled) setMessages(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setErrorMsg(
            err?.response?.data?.message ||
              "Gagal mengambil pesan chat dari server."
          );
        }
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
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const resetForm = () => {
    setText("");
    setFiles([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!ticketId) return;

    if (!text.trim()) {
      setErrorMsg("Harus sertakan keterangan pesan.");
      return;
    }

    try {
      setSending(true);
      setErrorMsg("");

      const fd = new FormData();
      fd.append("message_body", text.trim());
      files.forEach((file) => fd.append("files[]", file));

      const res = await sendTicketMessage(ticketId, fd);
      const newMsg = res.data || res;

      setMessages((prev) => [...prev, newMsg]);
      resetForm();
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengirim pesan. Coba lagi."
      );
    } finally {
      setSending(false);
    }
  };

  const bubbleSide = (msg) => {
    const senderId = msg.id_sender ?? msg.sender?.id;
    if (!senderId) return "left";
    return senderId === currentUser.id ? "right" : "left";
  };

  const senderLabel = (msg) => {
    const sender = msg.sender;
    if (!sender) return "User";
    if (sender.role === "admin") return sender.name || "Admin";
    return sender.name || "User";
  };

  const buildFileUrl = (att) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const root = base.replace(/\/api\/?$/, "");
    return `${root}/storage/${att.file_path}`;
  };

  return (
    <div className="ticket-chat">
      <div className="ticket-chat-header">
        <h3>Diskusi Ticket</h3>
        <p className="ticket-chat-sub">
          Chat antara kamu dan admin IT untuk ticket ini.
        </p>
      </div>

      {errorMsg && <div className="ticket-chat-error">{errorMsg}</div>}

      <div className="ticket-chat-body" ref={bodyRef}>
        {loading ? (
          <div className="ticket-chat-empty">Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="ticket-chat-empty">
            Belum ada pesan. Mulai percakapan dengan mengetik pesan di bawah.
          </div>
        ) : (
          messages.map((msg) => {
            const side = bubbleSide(msg);
            const sender = senderLabel(msg);
            const time = msg.sent_at
              ? new Date(msg.sent_at).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "";

            return (
              <div key={msg.id_message} className={`chat-row chat-row-${side}`}>
                <div className="chat-avatar">
                  {sender[0]?.toUpperCase() || "?"}
                </div>
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="chat-sender">{sender}</span>
                    <span className="chat-time">{time}</span>
                  </div>

                  {msg.message_body && (
                    <div className="chat-text">{msg.message_body}</div>
                  )}

                  {Array.isArray(msg.attachments) &&
                    msg.attachments.length > 0 && (
                      <div className="chat-attachments">
                        {msg.attachments.map((att) => (
                          <a
                            key={att.id_attachment}
                            href={buildFileUrl(att)}
                            target="_blank"
                            rel="noreferrer"
                            className="chat-attachment-link"
                          >
                            📎 {att.file_name}
                          </a>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {chatLockedInfo && <div className="ticket-chat-locked">{chatLockedInfo}</div>}

      <form className="ticket-chat-form" onSubmit={handleSend}>
        <textarea
          className="ticket-chat-input"
          rows={2}
          placeholder={
            canSend ? "Tulis pesan ke admin..." : "Chat dinonaktifkan untuk ticket ini."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!canSend || sending}
        />

        <div className="ticket-chat-form-bottom">
          <label className="ticket-chat-file">
            📎
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={!canSend || sending}
            />
          </label>

          {files.length > 0 && (
            <span className="ticket-chat-file-names">
              {files.length} file dipilih
            </span>
          )}

          <button
            type="submit"
            className="ticket-chat-send-btn"
            disabled={!canSend || sending || (!text.trim() && files.length === 0)}
          >
            {sending ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </form>
    </div>
  );
}
