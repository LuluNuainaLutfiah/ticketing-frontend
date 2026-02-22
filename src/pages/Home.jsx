import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  CheckCircle2,
  MessageSquare,
  Upload,
  ShieldCheck,
  Building2
} from "lucide-react";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => navigate("/register");
  const handleLogin = () => navigate("/login");

  const links = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "features", label: "Fitur" },
      { id: "workflow", label: "Alur" },
    ],
    []
  );

  const featureCards = useMemo(
    () => [
      {
        tone: "green",
        title: "Pencatatan Tiket Terstruktur",
        text: "Setiap kendala tercatat sebagai tiket lengkap dengan detail dan riwayat penanganan.",
        icon: <Ticket size={20} strokeWidth={1.8} />,
      },
      {
        tone: "blue",
        title: "Status Progres Konsisten",
        text: "Pantau progres melalui Open, Ditinjau, Diproses hingga Selesai.",
        icon: <CheckCircle2 size={20} strokeWidth={1.8} />,
      },
      {
        tone: "red",
        title: "Komunikasi Terpusat",
        text: "Diskusi penanganan dilakukan langsung di dalam tiket.",
        icon: <MessageSquare size={20} strokeWidth={1.8} />,
      },
      {
        tone: "green",
        title: "Upload Multi File",
        text: "Lampirkan screenshot atau log untuk mempercepat analisis.",
        icon: <Upload size={20} strokeWidth={1.8} />,
      },
      {
        tone: "blue",
        title: "Akses Berbasis Role",
        text: "Tiket hanya dapat diakses sesuai hak akses pengguna.",
        icon: <ShieldCheck size={20} strokeWidth={1.8} />,
      },
      {
        tone: "red",
        title: "Siap untuk Skala Kampus",
        text: "Dirancang untuk kebutuhan mahasiswa, dosen, dan unit kerja.",
        icon: <Building2 size={20} strokeWidth={1.8} />,
      },
    ],
    []
  );

  const workflow = useMemo(
    () => [
      { step: "01", title: "Buat Tiket", text: "Isi judul, kategori, kronologi singkat, dan lampiran (jika diperlukan)." },
      { step: "02", title: "Verifikasi Admin", text: "Admin meninjau informasi dan memulai penanganan." },
      { step: "03", title: "Proses Penanganan", text: "Troubleshooting berjalan dan komunikasi melalui komentar tiket." },
      { step: "04", title: "Selesai", text: "Masalah dinyatakan selesai dan tiket tersimpan sebagai arsip." },
    ],
    []
  );

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="home-subnav">
          <div className="home-subnav-left">
            <span className="home-subnav-pill">IT Helpdesk • UIKA</span>
            <span className="home-subnav-text">
              Portal layanan IT kampus yang transparan, rapi, dan terdokumentasi.
            </span>
          </div>

          <div className="home-subnav-right">
            {links.map((l) => (
              <button
                key={l.id}
                className="home-subnav-link"
                onClick={() => scrollTo(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <section className="hero hero-formal">
          <div className="hero-left">

            <h1 className="hero-text-title">
              Portal <span className="home-accent">IT Helpdesk UIKA</span>
            </h1>

            <p className="hero-text-body">
              Ajukan tiket layanan, lampirkan bukti pendukung, dan pantau progres
              penanganan dengan alur yang jelas dan terdokumentasi.
            </p>

            <div className="home-stats home-stats-formal">
              <div className="home-stat">
                <div className="home-stat-value">Satu Portal</div>
                <div className="home-stat-label">Seluruh layanan IT</div>
              </div>
              <div className="home-stat">
                <div className="home-stat-value">&lt; 24 Jam</div>
                <div className="home-stat-label">
                  Respon awal (jam kerja)
                </div>
              </div>
              <div className="home-stat">
                <div className="home-stat-value">Terdokumentasi</div>
                <div className="home-stat-label">
                  Status & riwayat tiket
                </div>
              </div>
            </div>

            <div className="hero-actions">
              <button
                className="hero-cta-btn"
                onClick={handleGetStarted}
              >
                Register
              </button>
              <button
                className="hero-ghost-btn"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>

          <aside className="hero-right">
            <div className="hero-card">
              <div className="hero-card-head">
                <div className="hero-card-title">
                  Ringkasan Layanan
                </div>
                <div className="hero-card-sub">
                  Panduan singkat sebelum membuat tiket
                </div>
              </div>

              <div className="hero-card-row">
                <div className="hero-mini-label">Status</div>
                <div className="hero-mini-value">
                  Open → Ditinjau → Diproses → Selesai
                </div>
              </div>

              <div className="hero-card-row">
                <div className="hero-mini-label">Disarankan</div>
                <ul className="hero-mini-list">
                  <li>Judul spesifik dan singkat</li>
                  <li>Kronologi: apa, kapan, di mana</li>
                  <li>Lampirkan screenshot/log</li>
                </ul>
              </div>

              <div className="hero-card-note">
                Akses tiket mengikuti hak akses (role). Informasi yang rapi
                mempercepat proses penanganan.
              </div>
            </div>
          </aside>
        </section>

        <section id="overview" className="home-section home-section-formal">
          <div className="home-section-head">
            <h2 className="home-section-title">Overview</h2>
            <p className="home-section-sub">
              Sistem tiket membantu layanan IT lebih terukur: informasi lengkap,
              status konsisten, dan arsip mudah ditelusuri.
            </p>
          </div>

          <div className="home-split home-split-formal">
            <div className="home-panel">
              <div className="home-panel-title">
                Agar tiket cepat diproses
              </div>
              <ul className="home-check">
                <li>Judul tiket jelas dan spesifik</li>
                <li>Kronologi singkat dan runtut</li>
                <li>Lampiran pendukung (screenshot/log)</li>
                <li>Informasi perangkat/jaringan (opsional)</li>
              </ul>
            </div>

            <div className="home-panel home-panel-soft">
              <div className="home-panel-title">
                Manfaat sistem tiket
              </div>
              <p className="home-muted">
                Komunikasi tidak tercecer karena seluruh progres, komentar,
                lampiran, dan waktu penanganan tercatat di satu tempat.
              </p>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="info-cards-section info-cards-formal"
        >
          <div className="info-header">
            <h2 className="info-title">Fitur Utama</h2>
            <p className="info-subtitle">
              Tampilan sederhana, informasi lengkap, dan siap digunakan
              untuk kebutuhan kampus.
            </p>
          </div>

          <div className="home-feature-grid home-feature-grid-formal">
            {featureCards.map((f) => (
              <article
                key={f.title}
                className={`info-card info-card-formal tone-${f.tone}`}
              >
                <div className="info-card-top">
                  <div className="home-feature-icon-formal">
                    {f.icon}
                  </div>
                  <h3 className="info-card-title">
                    {f.title}
                  </h3>
                </div>
                <p className="info-card-text">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="home-section home-section-formal"
        >
          <div className="home-section-head">
            <h2 className="home-section-title">
              Alur Layanan
            </h2>
            <p className="home-section-sub">
              Tahapan layanan dibuat jelas agar pengguna memahami proses setelah mengirim tiket.
            </p>
          </div>

          <div className="home-steps home-steps-formal">
            {workflow.map((w) => (
              <div
                key={w.step}
                className="home-step home-step-formal"
              >
                <div className="home-step-no">
                  {w.step}
                </div>
                <div className="home-step-body">
                  <div className="home-step-title">
                    {w.title}
                  </div>
                  <div className="home-step-text">
                    {w.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-cta home-cta-formal">
          <div>
            <h2 className="home-cta-title">
              Mulai dari tiket pertama
            </h2>
            <p className="home-cta-sub">
              Masuk jika sudah memiliki akun atau daftar untuk mulai menggunakan layanan.
            </p>
          </div>

          <div className="home-cta-card">
            <div className="home-cta-card-title">
              Checklist sebelum submit
            </div>
            <ul className="home-check">
              <li>Pesan error yang muncul</li>
              <li>Waktu kejadian</li>
              <li>Screenshot/log pendukung</li>
              <li>Perangkat/jaringan (jika perlu)</li>
            </ul>
          </div>
        </section>

        <footer className="home-footer">
          © {new Date().getFullYear()} UIKA IT Helpdesk.
          Seluruh hak cipta dilindungi.
        </footer>
      </div>
    </div>
  );
}