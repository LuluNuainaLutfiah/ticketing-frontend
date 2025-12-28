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
        <section className="hero">
          <div className="hero-left">
            <div className="hero-badge">
              IT Support • Universitas Ibn Khaldun
            </div>

            <h1 className="hero-text-title">
              Selamat Datang di IT Helpdesk UIKA
            </h1>

            <p className="hero-text-body">
              Portal layanan resmi untuk membantu permasalahan akun,
              jaringan, email, dan kebutuhan IT lainnya di lingkungan
              Universitas Ibn Khaldun. Ajukan tiket, pantau progres,
              dan selesaikan kendala IT secara lebih terstruktur.
            </p>

            <ul className="hero-list">
              <li>📩 Ajukan permintaan bantuan dengan cepat dan mudah.</li>
              <li>📊 Pantau status tiket secara real-time.</li>
              <li>🤝 Terhubung langsung dengan tim IT kampus.</li>
            </ul>

            <div className="hero-actions">
              <button className="hero-cta-btn" onClick={handleGetStarted}>
                Mulai Sekarang
              </button>
              <button
                type="button"
                className="hero-ghost-btn"
                onClick={handleLogin}
              >
                Masuk untuk Membuat Tiket
              </button>
            </div>
          </div>

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
                <div className="hero-character-icon">🛠️</div>
                <p className="hero-character-caption">
                  Tim IT siap membantu kendala
                  <br />
                  akun, jaringan, dan perangkat Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="info-cards-section">
          <div className="info-header">
            <h2 className="info-title">
              Mengapa Menggunakan IT Helpdesk?
            </h2>
            <p className="info-subtitle">
              Satu pintu untuk seluruh kebutuhan dukungan IT di kampus.
            </p>
          </div>

          <div className="info-cards">
            <article className="info-card">
              <div className="info-card-badge green" />
              <h3 className="info-card-title">Tiket Tercatat dengan Rapi</h3>
              <p className="info-card-text">
                Setiap permintaan bantuan dicatat dalam bentuk tiket,
                sehingga tidak ada laporan yang terlewat dan mudah
                ditelusuri kembali.
              </p>
            </article>

            <article className="info-card">
              <div className="info-card-badge blue" />
              <h3 className="info-card-title">Pantau Progres Penanganan</h3>
              <p className="info-card-text">
                Lihat status tiket mulai dari Open, In Progress,
                hingga Resolved. Anda dapat memantau perkembangan
                penanganan masalah secara mandiri.
              </p>
            </article>

            <article className="info-card">
              <div className="info-card-badge red" />
              <h3 className="info-card-title">Komunikasi Terpusat</h3>
              <p className="info-card-text">
                Seluruh komunikasi dengan admin IT berada dalam satu
                sistem, tidak tersebar di chat pribadi, sehingga lebih
                terstruktur dan mudah ditelusuri.
              </p>
            </article>
          </div>
        </section>

        <footer className="home-footer">
          © {new Date().getFullYear()} UIKA IT Helpdesk. Seluruh hak cipta dilindungi.
        </footer>
      </div>
    </div>
  );
}
