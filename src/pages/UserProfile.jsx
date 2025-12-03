import { useMemo, useRef, useState } from "react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-profile.css";

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

  // preview avatar (kalau nanti backend kirim avatar url, bisa pakai user.avatar)
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const fileInputRef = useRef(null);

  const role = String(user.role || "").toLowerCase();       // admin / user
  const userType = String(user.user_type || "").toLowerCase(); // mahasiswa / dosen

  const isStudent = userType === "mahasiswa";
  const idLabel = isStudent ? "NPM (Mahasiswa)" : "NIK (Dosen)";
  const idValue = isStudent ? user.npm || "-" : user.nik || "-";

  // 🔥 label yang kita pakai di form untuk menampilkan status Mahasiswa / Dosen
  const userTypeLabel = userType
    ? isStudent
      ? "Mahasiswa"
      : "Dosen"
    : "-";

  const email = user.email || "-";
  const phone = user.phone || "+62";

  // dummy stats (kalau mau bisa diisi dari backend nanti)
  const totalTickets = user.total_tickets ?? 0;
  const activeTickets = user.active_tickets ?? 0;
  const satisfaction = user.satisfaction ?? 0;

  const handleChangePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // NOTE:
    // di sini nanti bisa ditambah API upload ke backend
    // dan update localStorage user dengan avatar url dari server
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
                  <div className="up-user-name">
                    {fullName || "User Name"}
                  </div>
                  <div className="up-user-email">{email}</div>

                  <div className="up-user-tags">
                    {/* Badge Mahasiswa / Dosen */}
                    {userType && (
                      <span className="up-tag">
                        {isStudent ? "Mahasiswa" : "Dosen"}
                      </span>
                    )}
                    {/* Badge role system: Admin / User */}
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
                <div className="up-stat-value">{totalTickets}</div>
                <div className="up-stat-label">Total Tickets</div>
              </div>
              <div className="up-stat-item">
                <div className="up-stat-value">{activeTickets}</div>
                <div className="up-stat-label">Active Tickets</div>
              </div>
              <div className="up-stat-item">
                <div className="up-stat-value">{satisfaction}</div>
                <div className="up-stat-label">Satisfaction</div>
              </div>
            </div>
          </section>

          {/* CARD BAWAH – INFO PRIBADI */}
          <section className="up-card up-card-form">
            <div className="up-section-title">Personal Information</div>

            <div className="up-form-grid">
              {/* First / Last name */}
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

              {/* Email */}
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

              {/* 🔥 User Type: Mahasiswa / Dosen */}
              <div className="up-form-group up-form-full">
                <label className="up-label">Pengguna</label>
                <input
                  className="up-input"
                  type="text"
                  value={userTypeLabel}
                  disabled
                />
              </div>

              {/* NPM / NIK */}
              <div className="up-form-group up-form-full">
                <label className="up-label">{idLabel}</label>
                <input
                  className="up-input"
                  type="text"
                  value={idValue}
                  disabled
                />
              </div>

              {/* Phone */}
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
