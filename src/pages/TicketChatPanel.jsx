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
  const [isAtBottom, setIsAtBottom] = useState(true);

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
  const hasFiles = files.length > 0;

  const stripLampiranLine = (value) => {
    const s = String(value || "");
    return s.replace(/^Lampiran:\s.*\n?/i, "").trim();
  };

  const cleanMessage = stripLampiranLine(text);
  const readyToSend =
    canSend && !sending && (cleanMessage.length > 0 || hasFiles);

  useEffect(() => {
    if (!ticketId) return;
    let cancelled = false;

    const loadMessages = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await fetchTicketMessages(ticketId);
        const list = Array.isArray(res?.data) ? res.data : res || [];
        if (!cancelled) setMessages(list);
      } catch {
        if (!cancelled && !silent)
          setErrorMsg("Gagal memuat pesan.");
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

    const onScroll = () => {
      const threshold = 80;
      const distance =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setIsAtBottom(distance < threshold);
    };

    el.addEventListener("scroll", onScroll);
    onScroll();

    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (isAtBottom) el.scrollTop = el.scrollHeight;
  }, [messages, isAtBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!readyToSend) return;

    try {
      setSending(true);
      setErrorMsg("");

      const fd = new FormData();
      if (cleanMessage) fd.append("message_body", cleanMessage);
      files.forEach((file) => fd.append("files[]", file));

      const res = await sendTicketMessage(ticketId, fd);
      const newMsg = res.data || res;

      setMessages((prev) => [...prev, newMsg]);
      setText("");
      setFiles([]);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengirim."
      );
    } finally {
      setSending(false);
    }
  };

  const getBackendRoot = () => {
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
    } catch {
      window.open(fullUrl, "_blank");
    }
  };

  const clearSelectedFiles = () => {
    setFiles([]);
    setText((prev) =>
      prev.replace(/^Lampiran:\s.*\n?/i, "")
    );
  };

  return (
    <div className="ticket-chat">
      <div className="ticket-chat-header">
        <h3>Diskusi Tiket</h3>
        <p className="ticket-chat-sub">
          Komunikasi dengan Admin IT
        </p>
      </div>

      <div className="ticket-chat-body" ref={bodyRef}>
        {loading && messages.length === 0 ? (
          <div className="ticket-chat-empty">Memuat...</div>
        ) : (
          messages.map((msg) => {
            const sender = msg.sender || {};
            const isMe =
              (msg.id_sender ?? sender.id) === currentUser.id;
            const name =
              sender.name ||
              (sender.role === "admin" ? "Admin" : "User");

            return (
              <div
                key={msg.id_message}
                className={`chat-row ${
                  isMe ? "chat-row-right" : "chat-row-left"
                }`}
              >
                <div className="chat-avatar">
                  {name[0]?.toUpperCase()}
                </div>

                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="chat-sender">{name}</span>
                    <span className="chat-time">
                      {new Date(msg.sent_at).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </div>

                  {msg.message_body && (
                    <div className="chat-text">
                      {msg.message_body}
                    </div>
                  )}

                  {msg.attachments?.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      {msg.attachments.map((att) => (
                        <button
                          key={att.id_attachment}
                          onClick={() => openAttachment(att)}
                          className="chat-attachment-link"
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

      {canSend && hasFiles && (
        <div className="ticket-chat-file-hint">
          <button
            type="button"
            onClick={clearSelectedFiles}
            className="ticket-chat-clear-file-btn"
          >
            Hapus pilihan file
          </button>
        </div>
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
            📎
            <input
              type="file"
              multiple
              hidden
              disabled={!canSend || sending}
              onChange={(e) =>
                setFiles(Array.from(e.target.files))
              }
            />
          </label>

          <button
            type="submit"
            className="ticket-chat-send-btn"
            disabled={!readyToSend}
          >
            {sending ? "..." : "Kirim"}
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: "red",
            }}
          >
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}
