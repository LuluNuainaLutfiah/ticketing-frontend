import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock,
  Tickets,
  Circle,
} from "lucide-react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-profile.css";
import { fetchUserTickets } from "../services/tickets";
import { uploadAvatar } from "../services/profile";

export default function UserProfile() {
  const initialUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [userData, setUserData] = useState(initialUser);

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const resolveAvatar = (avatar) => {
    if (!avatar) return null;
    const v = String(avatar);
    if (v.startsWith("http")) return v;
    return `${API_BASE}/storage/${v}`;
  };

  const fullName = userData.name || userData.full_name || "";
  const parts = fullName.split(" ").filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");

  const initials =
    parts
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "US";

  const [avatarPreview, setAvatarPreview] = useState(
    resolveAvatar(userData.avatar || userData.avatar_url)
  );

  const fileInputRef = useRef(null);

  const role = String(userData.role || "").toLowerCase();
  const userType = String(userData.user_type || "").toLowerCase();

  const isStudent = userType === "mahasiswa";
  const idLabel = isStudent ? "NPM (Mahasiswa)" : "NIK (Dosen)";
  const idValue = isStudent ? userData.npm || "-" : userData.nik || "-";
  const userTypeLabel = userType ? (isStudent ? "Mahasiswa" : "Dosen") : "-";

  const email = userData.email || "-";
  const phone = userData.phone || "+62";

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
    const run = async () => {
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
        setResolvedRate(total > 0 ? Math.round((done / total) * 100) : 0);
      } catch (err) {
        setStatsError(err?.response?.data?.message || "Gagal mengambil statistik tiket.");
        setTotalTickets(0);
        setActiveTickets(0);
        setResolvedRate(0);
      } finally {
        setStatsLoading(false);
      }
    };

    run();
  }, []);

  useEffect(() => {
    setAvatarPreview(resolveAvatar(userData.avatar || userData.avatar_url));
  }, [userData]);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);

    try {
      const res = await uploadAvatar(file);

      const updatedUser =
        res?.data?.user || {
          ...userData,
          avatar: res?.data?.avatar || res?.data?.avatar_url || userData.avatar,
        };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
    } catch (err) {
      setStatsError(
        err?.response?.data?.message || "Upload foto gagal. Cek endpoint/izin akses."
      );
      setAvatarPreview(resolveAvatar(userData.avatar || userData.avatar_url));
    } finally {
      e.target.value = "";
      URL.revokeObjectURL(localPreview);
    }
  };

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

        {!!statsError && <div className="up-alert up-alert-error">{statsError}</div>}

        <div className="up-wrapper">
          <section className="up-hero">
            <div className="up-hero-bg" />

            <div className="up-hero-top">
              <div className="up-hero-left">
                <div className="up-avatar">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" />
                  ) : (
                    <span>{initials}</span>
                  )}
                  <span className="up-online-dot" />
                </div>

                <div className="up-identity">
                  <div className="up-name">{fullName || "Nama Pengguna"}</div>
                  <div className="up-email">{email}</div>

                  <div className="up-tags">
                    {showUserType && <span className="up-tag up-tag-soft">{userTypeLabel}</span>}
                    {roleLabel !== "-" && <span className="up-tag up-tag-soft">{roleLabel}</span>}
                    <span className="up-tag up-tag-live">
                      <Circle size={8} fill="currentColor" strokeWidth={0} />
                      Aktif
                    </span>
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
                  <Camera size={16} strokeWidth={2} />
                  Ganti Foto
                </button>
              </div>
            </div>

            <div className="up-metrics">
              <div className="up-metric">
                <div className="up-metric-icon up-i-green">
                  <Tickets size={18} strokeWidth={2} />
                </div>
                <div className="up-metric-meta">
                  <div className="up-metric-value">{statsLoading ? "…" : totalTickets}</div>
                  <div className="up-metric-label">Total Tiket</div>
                </div>
              </div>

              <div className="up-metric">
                <div className="up-metric-icon up-i-amber">
                  <Clock size={18} strokeWidth={2} />
                </div>
                <div className="up-metric-meta">
                  <div className="up-metric-value">{statsLoading ? "…" : activeTickets}</div>
                  <div className="up-metric-label">Tiket Aktif</div>
                </div>
              </div>

              <div className="up-metric up-metric-wide">
                <div className="up-metric-icon up-i-blue">
                  <CheckCircle2 size={18} strokeWidth={2} />
                </div>
                <div className="up-metric-meta">
                  <div className="up-metric-value">
                    {statsLoading ? "…" : `${resolvedRate}%`}
                  </div>
                  <div className="up-metric-label">Tingkat Penyelesaian</div>

                  <div className="up-progress">
                    <div className="up-progress-bar" style={{ width: `${resolvedRate}%` }} />
                  </div>

                  <div className="up-progress-sub">
                    {statsLoading ? "Menghitung statistik..." : "Semakin tinggi, semakin banyak tiket selesai"}
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