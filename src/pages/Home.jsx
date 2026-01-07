import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
        badge: "green",
        title: "Tiket Tercatat",
        text: "Setiap kendala masuk sebagai tiket dengan detail, lampiran, dan riwayat penanganan yang rapi.",
        icon: "🧾",
      },
      {
        badge: "blue",
        title: "Status Jelas",
        text: "Pantau progres dari Open → Ditinjau → Diproses → Selesai tanpa harus tanya via chat pribadi.",
        icon: "📊",
      },
      {
        badge: "red",
        title: "Komunikasi Terpusat",
        text: "Diskusi dengan admin IT ada di satu tempat, mudah dilacak dan tidak tercecer.",
        icon: "💬",
      },
      {
        badge: "green",
        title: "Upload Multi File",
        text: "Lampirkan screenshot/log supaya admin lebih cepat memahami akar masalah.",
        icon: "📎",
      },
      {
        badge: "blue",
        title: "Akses Aman",
        text: "Tiket hanya bisa dilihat oleh pemilik tiket dan admin yang berwenang (sesuai role).",
        icon: "🔒",
      },
      {
        badge: "red",
        title: "Siap untuk Skala Kampus",
        text: "Struktur alur dan tampilan dibuat untuk kebutuhan mahasiswa, dosen, dan unit kerja.",
        icon: "🏛️",
      },
    ],
    []
  );

  const workflow = useMemo(
    () => [
      { step: "01", title: "Buat Tiket", text: "Isi judul, kategori, kronologi singkat, dan lampiran (jika ada)." },
      { step: "02", title: "Ditinjau Admin", text: "Admin memvalidasi informasi dan menyiapkan penanganan." },
      { step: "03", title: "Diproses", text: "Troubleshooting berjalan, komunikasi via komentar tiket, progres diperbarui." },
      { step: "04", title: "Selesai", text: "Masalah tuntas. Tiket tersimpan sebagai arsip & referensi." },
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
              Portal layanan IT kampus yang rapi, transparan, dan terstruktur.
            </span>
          </div>

          <div className="home-subnav-right">
            {links.map((l) => (
              <button key={l.id} className="home-subnav-link" onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <section className="hero">
          <div className="hero-left">
            <div className="hero-badge">IT Support • Universitas Ibn Khaldun</div>

            <h1 className="hero-text-title">
              Selamat Datang di <span className="home-accent">IT Helpdesk UIKA</span>
            </h1>

            <p className="hero-text-body">
              Ajukan tiket, unggah lampiran, dan pantau progres penanganan masalah IT kamu dengan status yang jelas:
              <b> Open</b> • <b>Ditinjau</b> • <b>Diproses</b> • <b>Selesai</b>.
            </p>

            <div className="home-stats">
              <div className="home-stat">
                <div className="home-stat-value">1 Pintu</div>
                <div className="home-stat-label">Semua layanan IT</div>
              </div>
              <div className="home-stat">
                <div className="home-stat-value">&lt; 24 Jam</div>
                <div className="home-stat-label">Respon awal (jam kerja)</div>
              </div>
              <div className="home-stat">
                <div className="home-stat-value">Multi File</div>
                <div className="home-stat-label">Lampiran pendukung</div>
              </div>
            </div>

            <ul className="hero-list">
              <li>📩 Buat tiket dengan cepat dan mudah.</li>
              <li>📊 Pantau status tiket secara real-time.</li>
              <li>🤝 Komunikasi terpusat bersama tim IT kampus.</li>
              <li>🧾 Riwayat tiket tersimpan untuk referensi berikutnya.</li>
            </ul>

            <div className="hero-actions">
              <button className="hero-cta-btn" onClick={handleGetStarted}>
                Register
              </button>
              <button className="hero-ghost-btn" onClick={handleLogin}>
                Login
              </button>
            </div>
          </div>
        </section>

        <section id="overview" className="home-section">
          <div className="home-section-head">
            <h2 className="home-section-title">Overview</h2>
            <p className="home-section-sub">
              Satu portal untuk akun, jaringan, email, dan kebutuhan IT lainnya — dengan alur yang jelas.
            </p>
          </div>

          <div className="home-split">
            <div className="home-panel">
              <div className="home-panel-title">Yang bikin cepat ditangani</div>
              <ul className="home-check">
                <li>✅ Judul tiket jelas & spesifik</li>
                <li>✅ Kronologi singkat (apa, kapan, di mana)</li>
                <li>✅ Screenshot / bukti pendukung</li>
                <li>✅ Info perangkat & jaringan (opsional)</li>
              </ul>
            </div>

            <div className="home-panel">
              <div className="home-panel-title">Kenapa pakai tiket?</div>
              <p className="home-muted">
                Chat pribadi bikin konteks tercecer. Sistem tiket bikin semuanya terdokumentasi: status, riwayat,
                komentar, lampiran, dan waktu penanganan.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="info-cards-section">
          <div className="info-header">
            <h2 className="info-title">Fitur Utama</h2>
            <p className="info-subtitle">Lebih kaya informasi dan lebih terstruktur.</p>
          </div>

          <div className="home-feature-grid">
            {featureCards.map((f) => (
              <article className="info-card" key={f.title}>
                <div className={`info-card-badge ${f.badge}`} />
                <div className="home-feature-top">
                  <div className="home-feature-icon">{f.icon}</div>
                  <h3 className="info-card-title">{f.title}</h3>
                </div>
                <p className="info-card-text">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="home-section">
          <div className="home-section-head">
            <h2 className="home-section-title">Alur Layanan</h2>
            <p className="home-section-sub">Biar user paham apa yang terjadi setelah submit tiket.</p>
          </div>

          <div className="home-steps">
            {workflow.map((w) => (
              <div className="home-step" key={w.step}>
                <div className="home-step-no">{w.step}</div>
                <div>
                  <div className="home-step-title">{w.title}</div>
                  <div className="home-step-text">{w.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-cta">
          <div>
            <h2 className="home-cta-title">Siap bikin tiket pertamamu?</h2>
            <p className="home-cta-sub">
              Login kalau sudah punya akun, atau daftar dulu kalau belum. Setelah itu kamu bisa langsung buat tiket.
            </p>
          </div>

          <div className="home-cta-card">
            <div className="home-cta-card-title">Tips pengisian tiket</div>
            <ul className="home-check">
              <li>✅ Jelaskan error yang muncul</li>
              <li>✅ Cantumkan waktu kejadian</li>
              <li>✅ Tambahkan screenshot</li>
              <li>✅ Sebutkan perangkat/jaringan</li>
            </ul>
          </div>
        </section>

        <footer className="home-footer">
          © {new Date().getFullYear()} UIKA IT Helpdesk. Seluruh hak cipta dilindungi.
        </footer>
      </div>
    </div>
  );
}
