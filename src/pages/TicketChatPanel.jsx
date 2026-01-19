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

  // Memastikan aturan lock chat sesuai dengan logic backend
  const chatLockedInfo = useMemo(() => {
    if (!ticketId) return "Tiket tidak ditemukan.";

    if (status === "OPEN" && !isAdmin) {
      return "Menunggu admin membuka tiket. Chat sementara dikunci.";
    }

    if (status === "IN_REVIEW" && !isAdmin) {
      return "Tiket sedang ditinjau admin. Chat sementara dikunci.";
    }

    if (status === "RESOLVED" && !isAdmin) {
      return "Tiket sudah selesai. Chat tidak bisa digunakan lagi.";
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

        const res = await fetchTicketMessages(ticketId);
        // Pastikan mengambil data dari res.data karena Laravel Resource/JSON
        const list = Array.isArray(res?.data) ? res.data : (res || []);

        if (!cancelled) setMessages(list);
      } catch (err) {
        console.error(err);
        if (!cancelled && !silent) {
          setErrorMsg(err?.response?.data?.message || "Gagal mengambil pesan.");
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

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canSend || sending) return;

    if (!text.trim() && files.length === 0) {
      setErrorMsg("Pesan atau file tidak boleh kosong.");
      return;
    }

    try {
      setSending(true);
      setErrorMsg("");

      const fd = new FormData();
      if (text.trim()) fd.append("message_body", text.trim());
      files.forEach((file) => fd.append("files[]", file));

      const res = await sendTicketMessage(ticketId, fd);
      const newMsg = res.data || res;

      setMessages((prev) => [...prev, newMsg]);
      setText("");
      setFiles([]);
      
      // Jika admin yang chat pertama kali di status OPEN, 
      // bisa tambahkan window.location.reload() jika ingin status di header langsung update
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  // Helper URL File
  const getBackendRoot = () => {
    const base = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
    return base.replace(/\/api\/?$/, "");
  };

  const buildFileUrl = (att) => {
    const root = getBackendRoot();
    const path = String(att?.file_path || "").replace(/^\/+/, "");
    return `${root}/storage/${path}`;
  };

  const openAttachment = async (att) => {
    try {
      const token = localStorage.getItem("token");
      const url = buildFileUrl(att);

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("File tidak dapat diakses.");

      const contentType = res.headers.get("content-type") || "";
      const rawBlob = await res.blob();

      if (contentType.includes("text/html")) {
        throw new Error("Gagal memuat file (404 Not Found).");
      }

      const blobUrl = URL.createObjectURL(rawBlob);
      const isPreviewable = /image|pdf/i.test(contentType) || 
                            /\.(pdf|jpg|jpeg|png|webp)$/i.test(att.file_name);

      if (isPreviewable) {
        window.open(blobUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = att.file_name;
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="ticket-chat">
      <div className="ticket-chat-header">
        <h3>Diskusi Tiket</h3>
        <p className="ticket-chat-sub">Diskusi solusi antara Anda dan Admin IT.</p>
      </div>

      {errorMsg && <div className="ticket-chat-error">{errorMsg}</div>}

      <div className="ticket-chat-body" ref={bodyRef}>
        {loading ? (
          <div className="ticket-chat-empty">Memuat chat...</div>
        ) : messages.length === 0 ? (
          <div className="ticket-chat-empty">Belum ada pesan.</div>
        ) : (
          messages.map((msg) => {
            const isMe = (msg.id_sender ?? msg.sender?.id) === currentUser.id;
            const senderName = msg.sender?.name || (msg.sender?.role === 'admin' ? "Admin" : "User");
            
            return (
              <div key={msg.id_message} className={`chat-row ${isMe ? "chat-row-right" : "chat-row-left"}`}>
                <div className="chat-avatar">{senderName[0]?.toUpperCase()}</div>
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="chat-sender">{senderName}</span>
                    <span className="chat-time">{new Date(msg.sent_at).toLocaleString("id-ID", { timeStyle: 'short', dateStyle: 'short' })}</span>
                  </div>
                  {msg.message_body && <div className="chat-text">{msg.message_body}</div>}
                  
                  {msg.attachments?.map((att) => (
                    <button key={att.id_attachment} onClick={() => openAttachment(att)} className="chat-attachment-link">
                      📎 {att.file_name}
                    </button>
                  ))}
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
          placeholder={canSend ? "Tulis pesan..." : "Chat dikunci"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!canSend || sending}
        />
        <div className="ticket-chat-form-bottom">
          <label className="ticket-chat-file">
            📎 <input type="file" multiple onChange={handleFileChange} disabled={!canSend || sending} hidden />
          </label>
          {files.length > 0 && <span className="ticket-chat-file-names">{files.length} file</span>}
          <button type="submit" className="ticket-chat-send-btn" disabled={!canSend || sending || (!text.trim() && files.length === 0)}>
            {sending ? "..." : "Kirim"}
          </button>
        </div>
      </form>
    </div>
  );
}