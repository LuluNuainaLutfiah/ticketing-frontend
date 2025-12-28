import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import { fetchUserTicketDetail } from "../services/tickets";
import TicketChatPanel from "../pages/TicketChatPanel";

export default function UserTicketDetail() {
  const { id } = useParams(); // id_ticket
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await fetchUserTicketDetail(id);
        setTicket(res.data || res);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err?.response?.data?.message || "Gagal mengambil detail ticket."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="user-page">
      <UserSidebar />

      <main className="user-main">
        {loading ? (
          <div>Loading ticket...</div>
        ) : errorMsg ? (
          <div className="ut-error">{errorMsg}</div>
        ) : !ticket ? (
          <div>Ticket tidak ditemukan.</div>
        ) : (
          <div className="ticket-detail-layout">
            {/* Info ticket singkat */}
            <section className="ticket-detail-card">
              <h1>{ticket.title}</h1>
              <p className="ticket-detail-meta">
                ID: {ticket.code_ticket} • Status: {ticket.status} •
                Priority: {ticket.priority}
              </p>
              <p className="ticket-detail-desc">{ticket.description}</p>
            </section>

            {/* Chat panel */}
            <section className="ticket-detail-chat-card">
              <TicketChatPanel ticket={ticket} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
