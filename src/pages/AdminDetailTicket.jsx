import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import { fetchAdminTicketDetail } from "../services/tickets";
import TicketChatPanel from "../pages/TicketChatPanel";

export default function AdminTicketDetail() {
  const { id } = useParams(); 
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await fetchAdminTicketDetail(id);
        setTicket(res.data || res);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err?.response?.data?.message || "Gagal mengambil detail ticket (admin)."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="admin-page">
      <AdminSidebar active="tickets" />

      <main className="admin-main">
        {loading ? (
          <div>Memuat tiket...</div>
        ) : errorMsg ? (
          <div className="tickets-error">{errorMsg}</div>
        ) : !ticket ? (
          <div>Tiket tidak ditemukan.</div>
        ) : (
          <div className="admin-ticket-detail-layout">
            <section className="admin-ticket-detail-card">
              <h1>{ticket.title}</h1>
              <p className="ticket-detail-meta">
                ID: {ticket.code_ticket} • Status: {ticket.status} •
                Prioritas: {ticket.priority}
              </p>
              <p className="ticket-detail-desc">{ticket.description}</p>
            </section>

            <section className="admin-ticket-detail-chat-card">
              <TicketChatPanel ticket={ticket} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
