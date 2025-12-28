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
            <h1 className="how-title">Cara Kerja</h1>
            <p className="how-sub">
              Panduan singkat proses penanganan tiket IT Helpdesk dari awal
              sampai selesai.
            </p>
          </div>

          <button className="how-back" onClick={() => navigate("/user")}>
            ← Kembali ke Dashboard
          </button>
        </div>

        <section className="how-card">
          <div className="how-steps">
            <div className="how-step">
              <div className="how-badge">1</div>
              <div className="how-step-content">
                <div className="how-step-title">Buat Tiket</div>
                <div className="how-step-desc">
                  Buat tiket baru lewat menu <b>Buat Tiket</b>. Jelaskan masalah
                  dengan detail dan lampirkan file jika diperlukan.
                </div>
                <div className="how-step-tip">
                  Tips: Judul singkat + deskripsi lengkap membuat proses lebih
                  cepat.
                </div>
              </div>
            </div>

            <div className="how-step">
              <div className="how-badge">2</div>
              <div className="how-step-content">
                <div className="how-step-title">Tinjauan Admin</div>
                <div className="how-step-desc">
                  Tim IT akan membaca tiket Anda dan melakukan pengecekan awal.
                  Status biasanya tetap <b>Open</b> pada tahap ini.
                </div>
              </div>
            </div>

            <div className="how-step">
              <div className="how-badge">3</div>
              <div className="how-step-content">
                <div className="how-step-title">Sedang Diproses</div>
                <div className="how-step-desc">
                  Tiket akan berubah menjadi <b>In Progress</b> saat sedang
                  ditangani.
                </div>
                <div className="how-step-tip">
                  Komunikasi dilakukan melalui <b>chat pada tiket</b> (menu
                  Lihat/Detail tiket).
                </div>
              </div>
            </div>

            <div className="how-step">
              <div className="how-badge done">4</div>
              <div className="how-step-content">
                <div className="how-step-title">Selesai</div>
                <div className="how-step-desc">
                  Jika masalah sudah selesai, tiket akan ditandai{" "}
                  <b>Resolved</b>. Anda masih bisa melihat riwayatnya di Tiket
                  Saya.
                </div>
              </div>
            </div>
          </div>

          <div className="how-divider" />

          <div className="how-note">
            <div className="how-note-title">Catatan penting</div>
            <ul className="how-note-list">
              <li>
                Jangan membuat tiket duplikat untuk masalah yang sama. Cukup
                lakukan pembaruan melalui chat pada tiket yang sudah ada.
              </li>
              <li>
                Agar penanganan lebih cepat, sertakan informasi: lokasi,
                perangkat, waktu kejadian, serta screenshot/pesan error.
              </li>
              <li>
                Jika status masih <b>Open</b>, berarti tiket sudah masuk antrean
                (tinggal menunggu admin).
              </li>
            </ul>

            <div className="how-actions">
              <button
                className="how-btn ghost"
                onClick={() => navigate("/user/tickets")}
              >
                Lihat Tiket Saya
              </button>
              <button
                className="how-btn primary"
                onClick={() => navigate("/user/tickets/create")}
              >
                + Buat Tiket Baru
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
