import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Clock, Info } from "lucide-react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-service-hours.css";

export default function UserServiceHours({ open = false, onClose, mode = "page" }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "modal" || !open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, open, onClose]);

  const content = (
    <div className="sh-wrap">
      <div className="sh-head">
        <div className="sh-head-left">
          <CalendarClock size={22} strokeWidth={1.9} />
          <div>
            <h1 className="sh-title">Jam Layanan</h1>
            <p className="sh-sub">Waktu operasional layanan dukungan IT.</p>
          </div>
        </div>
      </div>

      <div className="sh-card">
        <div className="sh-row">
          <span className="sh-day">
            <Clock size={16} strokeWidth={2} />
            Senin - Jumat
          </span>
          <strong>08.00 - 15.00</strong>
        </div>

        <div className="sh-row">
          <span className="sh-day">
            <Clock size={16} strokeWidth={2} />
            Sabtu
          </span>
          <strong>Tutup</strong>
        </div>

        <div className="sh-row">
          <span className="sh-day">
            <Clock size={16} strokeWidth={2} />
            Minggu
          </span>
          <strong>Tutup</strong>
        </div>

        <div className="sh-note">
          <Info size={16} strokeWidth={2} />
          <span>
            Untuk prioritas <b>HIGH</b>, silakan buat <b>tiket</b> dengan deskripsi lengkap agar dapat diproses lebih cepat.
          </span>
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
          <button onClick={() => navigate("/user")}>
            ← Kembali ke Menu
          </button>
        </div>
      </main>
    </div>
  );
}