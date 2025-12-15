// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* ===== HERO SECTION ===== */}
        <section className="hero">
          {/* KIRI: TEKS */}
          <div className="hero-left">
            <div className="hero-badge">IT Support • Universitas Ibn Khaldun</div>

            <h1 className="hero-text-title">
              Welcome to IT Helpdesk UIKA
            </h1>

            <p className="hero-text-body">
              Portal layanan untuk membantu masalah akun, jaringan, email,
              dan kebutuhan IT lain di lingkungan kampus. Ajukan tiket,
              pantau progres, dan selesaikan kendala IT dengan lebih teratur.
            </p>

            <ul className="hero-list">
              <li>📩 Ajukan permintaan bantuan hanya dalam beberapa klik.</li>
              <li>📊 Pantau status tiket secara real-time.</li>
              <li>🤝 Terhubung langsung dengan tim IT kampus.</li>
            </ul>

            <div className="hero-actions">
              <button className="hero-cta-btn" onClick={handleGetStarted}>
                Get Started
              </button>
              <button
                type="button"
                className="hero-ghost-btn"
                onClick={handleLogin}
              >
                Login untuk buat tiket
              </button>
            </div>
          </div>

          {/* KANAN: ILLUSTRATION BOX */}
          <div className="hero-right">
            <div className="hero-right-box">
              <div className="hero-right-text">
                Butuh
                <br />
                Bantuan
                <br />
                IT?
              </div>

              <div className="hero-character">
                {/* nanti bisa diganti gambar / ilustrasi */}
                <div className="hero-character-icon">🛠️</div>
                <p className="hero-character-caption">
                  Tim IT siap membantu kendala
                  <br />
                  akun, jaringan, dan perangkatmu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== INFO CARDS SECTION ===== */}
        <section className="info-cards-section">
          <div className="info-header">
            <h2 className="info-title">Kenapa pakai IT Helpdesk?</h2>
            <p className="info-subtitle">
              Satu pintu untuk semua kebutuhan dukungan IT di kampus.
            </p>
          </div>

          <div className="info-cards">
            <article className="info-card">
              <div className="info-card-badge green" />
              <h3 className="info-card-title">Tiket Tercatat Rapi</h3>
              <p className="info-card-text">
                Setiap permintaan bantuan disimpan sebagai tiket,
                sehingga tidak ada laporan yang terlewat dan
                mudah ditelusuri kembali.
              </p>
            </article>

            <article className="info-card">
              <div className="info-card-badge blue" />
              <h3 className="info-card-title">Pantau Progres</h3>
              <p className="info-card-text">
                Lihat status &mdash; Open, In Progress, hingga Resolved.
                Kamu bisa memantau sejauh mana penanganan
                masalahmu secara mandiri.
              </p>
            </article>

            <article className="info-card">
              <div className="info-card-badge red" />
              <h3 className="info-card-title">Komunikasi Terpusat</h3>
              <p className="info-card-text">
                Semua komunikasi dengan admin IT ada di satu tempat,
                tidak tercecer di chat pribadi, sehingga lebih terstruktur
                dan mudah ditelusuri.
              </p>
            </article>
          </div>
        </section>

        {/* FOOTER KECIL */}
        <footer className="home-footer">
          © {new Date().getFullYear()} UIKA IT Helpdesk. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
