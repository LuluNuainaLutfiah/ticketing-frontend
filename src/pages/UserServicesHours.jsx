import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-service-hours.css";

export default function UserServiceHours() {
  const navigate = useNavigate();

  return (
    <div className="user-page">
      <UserSidebar active="" />

      <main className="user-main sh-main">
        <div className="sh-wrap">
          <h1 className="sh-title">Jam Layanan</h1>
          <p className="sh-sub">Waktu operasional layanan dukungan IT.</p>

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
              Catatan: Untuk prioritas <b>HIGH</b>, silakan buat <b>tiket</b>
              dengan deskripsi yang lengkap agar dapat diproses lebih cepat.
            </div>
          </div>
        </div>

        <div className="ush-back">
          <button onClick={() => navigate("/user")}>
            ← Kembali ke Menu
          </button>
        </div>
      </main>
    </div>
  );
}
