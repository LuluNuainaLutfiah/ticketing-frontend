// src/pages/UserProfile.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-profile.css";
import { fetchUserTickets } from "../services/tickets";

export default function UserProfile() {
  // ambil data user dari localStorage (di-set waktu register/login)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const fullName = user.name || user.full_name || "";
  const [firstName, ...restName] = fullName.split(" ");
  const lastName = restName.join(" ");

  // inisial avatar kalau belum ada foto
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "US";

  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const fileInputRef = useRef(null);

  const role = String(user.role || "").toLowerCase(); // admin / user
  const userType = String(user.user_type || "").toLowerCase(); // mahasiswa / dosen

  const isStudent = userType === "mahasiswa";
  const idLabel = isStudent ? "NPM (Mahasiswa)" : "NIK (Dosen)";
  const idValue = isStudent ? user.npm || "-" : user.nik || "-";

  const userTypeLabel = userType ? (isStudent ? "Mahasiswa" : "Dosen") : "-";

  const email = user.email || "-";
  const phone = user.phone || "+62";

  // =========================
  // ✅ STATS (Total / Active / Resolved Rate)
  // =========================
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [totalTickets, setTotalTickets] = useState(0);
  const [activeTickets, setActiveTickets] = useState(0);
  const [resolvedRate, setResolvedRate] = useState(0); // percent

  const normalizeStatus = (s) => {
    const v = String(s || "").toUpperCase();
    // status di DB lu: OPEN / IN_REVIEW / IN_PROGRESS / RESOLVED (+ mungkin CLOSED)
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

        // aman untuk beberapa bentuk response:
        // 1) { data: [...] }
        // 2) [...]
        // 3) { data: { data: [...] } } (kadang kalau pakai paginator)
        const raw =
          (Array.isArray(res?.data) && res.data) ||
          (Array.isArray(res) && res) ||
          (Array.isArray(res?.data?.data) && res.data.data) ||
          [];

        const tickets = Array.isArray(raw) ? raw : [];

        const total = tickets.length;
        const done = tickets.filter(
          (t) => normalizeStatus(t.status) === "done"
        ).length;
        const active = tickets.filter(
          (t) => normalizeStatus(t.status) !== "done"
        ).length;

        setTotalTickets(total);
        setActiveTickets(active);

        // Resolved Rate = persentase ticket yang selesai
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        setResolvedRate(pct);
      } catch (err) {
        console.error(err);
        setStatsError(
          err?.response?.data?.message || "Gagal mengambil statistik ticket."
        );
        setTotalTickets(0);
        setActiveTickets(0);
        setResolvedRate(0);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const handleChangePhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    // NOTE: nanti bisa ditambah API upload ke backend
  };

  return (
    <div className="user-page">
      <UserSidebar active="profile" />

      <main className="user-main up-main">
        {/* HEADER ATAS */}
        <header className="up-header">
          <h1 className="up-header-title">My Profile</h1>
          <p className="up-header-sub">Manage your account settings.</p>
        </header>

        {statsError && <div className="auth-error">{statsError}</div>}

        <div className="up-wrapper">
          {/* CARD ATAS – AVATAR & STATS */}
          <section className="up-card up-card-top">
            <div className="up-card-top-main">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="up-avatar">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="up-user-info">
                  <div className="up-user-name">{fullName || "User Name"}</div>
                  <div className="up-user-email">{email}</div>

                  <div className="up-user-tags">
                    {userType && (
                      <span className="up-tag">
                        {isStudent ? "Mahasiswa" : "Dosen"}
                      </span>
                    )}
                    {role && (
                      <span className="up-tag">
                        {role === "admin" ? "Admin" : "User"}
                      </span>
                    )}
                    <span className="up-tag up-tag-active">Active</span>
                  </div>
                </div>
              </div>

              {/* input file hidden */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <button
                className="up-btn-ghost"
                type="button"
                onClick={handleChangePhotoClick}
              >
                Change Photo
              </button>
            </div>

            <div className="up-stats-row">
              <div className="up-stat-item">
                <div className="up-stat-value">
                  {statsLoading ? "..." : totalTickets}
                </div>
                <div className="up-stat-label">Total Tickets</div>
              </div>

              <div className="up-stat-item">
                <div className="up-stat-value">
                  {statsLoading ? "..." : activeTickets}
                </div>
                <div className="up-stat-label">Active Tickets</div>
              </div>

              <div className="up-stat-item">
                <div className="up-stat-value">
                  {statsLoading ? "..." : `${resolvedRate}%`}
                </div>
                <div className="up-stat-label">Resolved Rate</div>
              </div>
            </div>
          </section>

          {/* CARD BAWAH – INFO PRIBADI */}
          <section className="up-card up-card-form">
            <div className="up-section-title">Personal Information</div>

            <div className="up-form-grid">
              <div className="up-form-group">
                <label className="up-label">First Name</label>
                <input
                  className="up-input"
                  type="text"
                  value={firstName || ""}
                  disabled
                />
              </div>

              <div className="up-form-group">
                <label className="up-label">Last Name</label>
                <input
                  className="up-input"
                  type="text"
                  value={lastName || ""}
                  disabled
                />
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">Email Address</label>
                <input
                  className="up-input"
                  type="email"
                  value={email}
                  disabled
                />
                <div className="up-hint">
                  Contact IT support to change your email.
                </div>
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">Pengguna</label>
                <input
                  className="up-input"
                  type="text"
                  value={userTypeLabel}
                  disabled
                />
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">{idLabel}</label>
                <input
                  className="up-input"
                  type="text"
                  value={idValue}
                  disabled
                />
              </div>

              <div className="up-form-group up-form-full">
                <label className="up-label">Phone Number</label>
                <input
                  className="up-input"
                  type="text"
                  value={phone}
                  disabled
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
