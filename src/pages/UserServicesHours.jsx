import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-service-hours.css";

export default function UserServiceHours({ open = false, onClose, mode = "page" }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "modal") return;
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, open, onClose]);

  const content = (
    <div className="sh-wrap">
      <div className="sh-head">
        <div>
          <h1 className="sh-title">Jam Layanan</h1>
          <p className="sh-sub">Waktu operasional layanan dukungan IT.</p>
        </div>
      </div>

      <div className="sh-card">
        <div className="sh-row">
          <span>Senin - Jumat</span>
          <strong>08.00 - 15.00</strong>
        </div>
        <div className="sh-row">
          <span>Sabtu</span>
          <strong>Tutup</strong>
        </div>
        <div className="sh-row">
          <span>Minggu</span>
          <strong>Tutup</strong>
        </div>

        <div className="sh-note">
          Catatan: Untuk prioritas <b>HIGH</b>, silakan buat <b>tiket</b> dengan deskripsi yang lengkap agar dapat diproses lebih cepat.
        </div>
      </div>
    </div>
  );

  if (mode === "modal") {
    if (!open) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card sh-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>

          <div className="sh-modal-icon">🗓️</div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="user-page">
      <UserSidebar active="" />

      <main className="user-main sh-main">
        {content}

        <div className="ush-back">
          <button onClick={() => navigate("/user")}>← Kembali ke Menu</button>
        </div>
      </main>
    </div>
  );
}
