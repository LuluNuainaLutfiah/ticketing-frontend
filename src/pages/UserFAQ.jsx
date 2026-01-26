import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-faq.css";

export default function UserFAQ({ open = false, onClose, mode = "page" }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const faqs = useMemo(
    () => [
      {
        q: "Bagaimana cara membuat tiket?",
        a: "Buka menu Buat Tiket, isi judul, kategori, prioritas, dan deskripsi, lalu klik Kirim.",
      },
      {
        q: "Kenapa chat tiket saya terkunci?",
        a: "Chat dapat terkunci tergantung status tiket (misalnya menunggu admin atau tiket sudah selesai/RESOLVED) sesuai aturan sistem.",
      },
      {
        q: "File apa saja yang bisa diunggah?",
        a: "Umumnya PNG, JPG, dan PDF (maksimal sesuai batas ukuran yang ditentukan sistem).",
      },
      {
        q: "Berapa lama respons dari tim support?",
        a: "Tergantung antrean dan prioritas. Tiket berprioritas HIGH biasanya diproses lebih cepat.",
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return faqs;
    return faqs.filter((x) => (x.q + " " + x.a).toLowerCase().includes(s));
  }, [q, faqs]);

  useEffect(() => {
    if (mode !== "modal") return;
    if (!open) return;

    setQ("");

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, open, onClose]);

  if (mode === "modal") {
    if (!open) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-card faq-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>

          <div className="modal-title">FAQ</div>
          <div className="modal-sub">Jawaban cepat untuk pertanyaan umum.</div>

          <div className="faq-modal-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari pertanyaan..."
            />
          </div>

          <div className="faq-modal-list">
            {filtered.length === 0 ? (
              <div className="faq-empty">Tidak ada hasil.</div>
            ) : (
              filtered.map((item, idx) => (
                <details className="faq-item fancy" key={idx}>
                  <summary className="faq-q fancy">
                    <span className="faq-q-left">
                      <span className="faq-q-icon">❓</span>
                      <span className="faq-q-text">{item.q}</span>
                    </span>
                    <span className="faq-q-right">
                      <span className="faq-badge">FAQ</span>
                      <span className="faq-chevron">▾</span>
                    </span>
                  </summary>
                  <div className="faq-a fancy">{item.a}</div>
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

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

        <div className="faq-back">
          <button onClick={() => navigate("/user")}>← Kembali ke Menu</button>
        </div>
      </main>
    </div>
  );
}
