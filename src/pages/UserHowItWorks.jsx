// src/pages/UserHowItWorks.jsx
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-how-it-works.css";

export default function UserHowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="user-page">
      <UserSidebar active="" />

      <main className="user-main how-main">
        <div className="how-header">
          <div>
            <h1 className="how-title">How It Works</h1>
            <p className="how-sub">
              Panduan singkat proses penanganan ticket IT Helpdesk dari awal
              sampai selesai.
            </p>
          </div>

          <button className="how-back" onClick={() => navigate("/user")}>
            ← Back to Dashboard
          </button>
        </div>

        <section className="how-card">
          <div className="how-steps">
            <div className="how-step">
              <div className="how-badge">1</div>
              <div className="how-step-content">
                <div className="how-step-title">Create Ticket</div>
                <div className="how-step-desc">
                  Buat ticket baru lewat menu <b>Create Ticket</b>. Jelaskan
                  masalah dengan detail dan lampirkan file jika perlu.
                </div>
                <div className="how-step-tip">
                  Tips: Judul singkat + deskripsi lengkap bikin proses lebih
                  cepat.
                </div>
              </div>
            </div>

            <div className="how-step">
              <div className="how-badge">2</div>
              <div className="how-step-content">
                <div className="how-step-title">Admin Review</div>
                <div className="how-step-desc">
                  Tim IT akan membaca ticket kamu dan melakukan pengecekan awal.
                  Status biasanya tetap <b>Open</b> di tahap ini.
                </div>
              </div>
            </div>

            <div className="how-step">
              <div className="how-badge">3</div>
              <div className="how-step-content">
                <div className="how-step-title">In Progress</div>
                <div className="how-step-desc">
                  Ticket akan berubah menjadi <b>In Progress</b> saat sedang
                  ditangani.
                </div>
                <div className="how-step-tip">
                  Komunikasi dilakukan di <b>chat pada ticket</b> (menu View /
                  Detail ticket).
                </div>
              </div>
            </div>

            <div className="how-step">
              <div className="how-badge done">4</div>
              <div className="how-step-content">
                <div className="how-step-title">Resolved</div>
                <div className="how-step-desc">
                  Jika masalah sudah selesai, ticket akan ditandai{" "}
                  <b>Resolved</b>. Kamu masih bisa lihat riwayatnya di My
                  Tickets.
                </div>
              </div>
            </div>
          </div>

          <div className="how-divider" />

          <div className="how-note">
            <div className="how-note-title">Catatan penting</div>
            <ul className="how-note-list">
              <li>
                Jangan bikin ticket duplikat untuk masalah yang sama. Update aja
                lewat chat ticket yang sudah ada.
              </li>
              <li>
                Untuk percepatan, sertakan informasi: lokasi, device, waktu
                kejadian, dan screenshot/error.
              </li>
              <li>
                Jika status masih <b>Open</b>, berarti ticket sudah masuk antrian
                (tinggal tunggu admin).
              </li>
            </ul>

            <div className="how-actions">
              <button
                className="how-btn ghost"
                onClick={() => navigate("/user/tickets")}
              >
                View My Tickets
              </button>
              <button
                className="how-btn primary"
                onClick={() => navigate("/user/tickets/create")}
              >
                + Create New Ticket
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
