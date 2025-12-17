import { useMemo, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-faq.css";

export default function UserFAQ() {
  const [q, setQ] = useState("");

  const faqs = useMemo(
    () => [
      {
        q: "Bagaimana cara membuat ticket?",
        a: "Masuk ke menu Create Ticket, isi judul, kategori, prioritas, dan deskripsi, lalu Submit.",
      },
      {
        q: "Kenapa chat ticket saya terkunci?",
        a: "Chat bisa terkunci tergantung status ticket (misal menunggu admin/RESOLVED) sesuai aturan sistem.",
      },
      {
        q: "File apa saja yang bisa diupload?",
        a: "Umumnya PNG, JPG, dan PDF (maksimal sesuai limit sistem kamu).",
      },
      {
        q: "Berapa lama respon support?",
        a: "Tergantung antrean dan prioritas. Prioritas HIGH biasanya lebih cepat diproses.",
      },
    ],
    []
  );

  const filtered = faqs.filter((x) =>
    (x.q + " " + x.a).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="user-page">
      <UserSidebar active="" />

      <main className="user-main faq-main">
        <div className="faq-header">
          <div>
            <h1 className="faq-title">FAQ</h1>
            <p className="faq-sub">Jawaban cepat untuk pertanyaan umum.</p>
          </div>

          <div className="faq-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari pertanyaan..."
            />
          </div>
        </div>

        <div className="faq-card">
          {filtered.length === 0 ? (
            <div className="faq-empty">Tidak ada hasil.</div>
          ) : (
            filtered.map((item, idx) => (
              <details className="faq-item" key={idx}>
                <summary className="faq-q">{item.q}</summary>
                <div className="faq-a">{item.a}</div>
              </details>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
