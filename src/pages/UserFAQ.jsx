import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-faq.css";

const FAQ_ITEMS = [
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
];

export default function UserFAQ({ open = false, onClose, mode = "page" }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FAQ_ITEMS;

    return FAQ_ITEMS.filter((item) =>
      `${item.q} ${item.a}`.toLowerCase().includes(s)
    );
  }, [q]);

  useEffect(() => {
    if (mode !== "modal" || !open) return;

    setQ("");

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, open, onClose]);

  const content = (
    <>
      <div className={mode === "modal" ? "modal-title" : "faq-title"}>FAQ</div>
      <div className={mode === "modal" ? "modal-sub" : "faq-sub"}>
        Jawaban cepat untuk pertanyaan umum.
      </div>

      <div className={mode === "modal" ? "faq-modal-search" : "faq-search"}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari pertanyaan..."
        />
      </div>

      <div className={mode === "modal" ? "faq-modal-list" : "faq-card"}>
        {filtered.length === 0 ? (
          <div className="faq-empty">Tidak ada hasil.</div>
        ) : (
          filtered.map((item) => (
            <details className={mode === "modal" ? "faq-item fancy" : "faq-item"} key={item.q}>
              <summary className={mode === "modal" ? "faq-q fancy" : "faq-q"}>
                {mode === "modal" ? (
                  <span className="faq-q-left">
                    <span className="faq-q-icon">❓</span>
                    <span className="faq-q-text">{item.q}</span>
                  </span>
                ) : (
                  item.q
                )}

                {mode === "modal" && (
                  <span className="faq-q-right">
                    <span className="faq-badge">FAQ</span>
                    <span className="faq-chevron">▾</span>
                  </span>
                )}
              </summary>

              <div className={mode === "modal" ? "faq-a fancy" : "faq-a"}>{item.a}</div>
            </details>
          ))
        )}
      </div>
    </>
  );

  if (mode === "modal") {
    if (!open) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card faq-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="user-page">
      <UserSidebar active="" />

      <main className="user-main faq-main">
        <div className="faq-header">{content}</div>

        <div className="faq-back">
          <button onClick={() => navigate("/user")}>← Kembali ke Menu</button>
        </div>
      </main>
    </div>
  );
}