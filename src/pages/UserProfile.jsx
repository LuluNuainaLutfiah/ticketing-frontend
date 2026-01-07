import { useEffect, useMemo, useRef, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-profile.css";
import { fetchUserTickets } from "../services/tickets";

export default function UserProfile() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const fullName = user.name || user.full_name || "";
  const parts = fullName.split(" ").filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");

  const initials =
    parts
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "US";

  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const fileInputRef = useRef(null);

  const role = String(user.role || "").toLowerCase();
  const userType = String(user.user_type || "").toLowerCase();

  const isStudent = userType === "mahasiswa";
  const idLabel = isStudent ? "NPM (Mahasiswa)" : "NIK (Dosen)";
  const idValue = isStudent ? user.npm || "-" : user.nik || "-";
  const userTypeLabel = userType ? (isStudent ? "Mahasiswa" : "Dosen") : "-";

  const email = user.email || "-";
  const phone = user.phone || "+62";

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [totalTickets, setTotalTickets] = useState(0);
  const [activeTickets, setActiveTickets] = useState(0);
  const [resolvedRate, setResolvedRate] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const normalizeStatus = (s) => {
    const v = String(s || "").toUpperCase();
    if (v === "RESOLVED" || v === "CLOSED") return "done";
    if (v === "IN_PROGRESS") return "progress";
    if (v === "IN_REVIEW") return "review";
    return "open";
  };

  useEffect(() => {
    (async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const res = await fetchUserTickets();

        const raw =
          (Array.isArray(res?.data) && res.data) ||
          (Array.isArray(res) && res) ||
          (Array.isArray(res?.data?.data) && res.data.data) ||
          [];

        const tickets = Array.isArray(raw) ? raw : [];

        const total = tickets.length;
        const done = tickets.filter((t) => normalizeStatus(t.status) === "done").length;
        const active = tickets.filter((t) => normalizeStatus(t.status) !== "done").length;

        setTotalTickets(total);
        setActiveTickets(active);

        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        setResolvedRate(pct);
      } catch (err) {
        console.error(err);
        setStatsError(err?.response?.data?.message || "Gagal mengambil statistik tiket.");
        setTotalTickets(0);
        setActiveTickets(0);
        setResolvedRate(0);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const roleLabel = role ? (role === "admin" ? "Admin" : "Pengguna") : "-";
  const showUserType = userTypeLabel !== "-";

  return (
    <div className="user-page">
      <UserSidebar active="profile" mobileOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="user-main up-main">
        <div className="up-mobilebar">
          <button className="up-hamburger" onClick={openSidebar} aria-label="Buka menu">
            <span />
            <span />
            <span />
          </button>

          <div className="up-mobilebar-title">
            <div className="up-mobilebar-main">Profil</div>
            <div className="up-mobilebar-sub">Informasi akun Anda</div>
          </div>
        </div>

        <header className="up-header">
          <h1 className="up-header-title">Profil Saya</h1>
          <p className="up-header-sub">Kelola informasi dan akun Anda.</p>
        </header>

        {statsError && <div className="up-alert up-alert-error">{statsError}</div>}

        <div className="up-wrapper">
          <section className="up-hero">
            <div className="up-hero-bg" />

            <div className="up-hero-top">
              <div className="up-hero-left">
                <div className="up-avatar">
                  {avatarPreview ? <img src={avatarPreview} alt="Avatar" /> : <span>{initials}</span>}
                  <span className="up-online-dot" />
                </div>

                <div className="up-identity">
                  <div className="up-name">{fullName || "Nama Pengguna"}</div>
                  <div className="up-email">{email}</div>

                  <div className="up-tags">
                    {showUserType && <span className="up-tag up-tag-soft">{userTypeLabel}</span>}
                    {roleLabel !== "-" && <span className="up-tag up-tag-soft">{roleLabel}</span>}
                    <span className="up-tag up-tag-live">Aktif</span>
                  </div>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="up-file"
                onChange={handleFileChange}
              />

              <div className="up-hero-actions">
                <button className="up-btn up-btn-ghost" type="button" onClick={handleChangePhotoClick}>
                  Ganti Foto
                </button>
              </div>
            </div>

            <div className="up-metrics">
              <div className="up-metric">
                <div className="up-metric-icon up-i-green">🧾</div>
                <div className="up-metric-meta">
                  <div className="up-metric-value">{statsLoading ? "…" : totalTickets}</div>
                  <div className="up-metric-label">Total Tiket</div>
                </div>
              </div>

              <div className="up-metric">
                <div className="up-metric-icon up-i-amber">⏳</div>
                <div className="up-metric-meta">
                  <div className="up-metric-value">{statsLoading ? "…" : activeTickets}</div>
                  <div className="up-metric-label">Tiket Aktif</div>
                </div>
              </div>

              <div className="up-metric up-metric-wide">
                <div className="up-metric-icon up-i-blue">✅</div>
                <div className="up-metric-meta">
                  <div className="up-metric-value">{statsLoading ? "…" : `${resolvedRate}%`}</div>
                  <div className="up-metric-label">Tingkat Penyelesaian</div>

                  <div className="up-progress">
                    <div className="up-progress-bar" style={{ width: `${resolvedRate}%` }} />
                  </div>

                  <div className="up-progress-sub">
                    {statsLoading ? "Menghitung statistik..." : "Semakin tinggi, semakin cepat tiket selesai"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="up-card up-card-form">
            <div className="up-section-head">
              <div>
                <div className="up-section-title">Informasi Pribadi</div>
                <div className="up-section-sub">Data ini bersifat read-only untuk keamanan.</div>
              </div>
              <div className="up-chip">
                <span className="up-chip-dot" />
                Terverifikasi
              </div>
            </div>

            <div className="up-form-grid">
              <div className="up-form-group">
                <label className="up-label">Nama Depan</label>
                <input className="up-input" type="text" value={firstName} disabled />
              </div>

              <div className="up-form-group">
                <label className="up-label">Nama Belakang</label>
                <input className="up-input" type="text" value={lastName} disabled />
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">Alamat Email</label>
                <input className="up-input" type="email" value={email} disabled />
                <div className="up-hint">Hubungi tim IT untuk mengubah alamat email.</div>
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">Status Pengguna</label>
                <input className="up-input" type="text" value={userTypeLabel} disabled />
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">{idLabel}</label>
                <input className="up-input" type="text" value={idValue} disabled />
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">Nomor Telepon</label>
                <input className="up-input" type="text" value={phone} disabled />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
