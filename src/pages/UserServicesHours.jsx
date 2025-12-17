import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-service-hours.css";

export default function UserServiceHours() {
  return (
    <div className="user-page">
      <UserSidebar active="" />

      <main className="user-main sh-main">
        <div className="sh-wrap">
          <h1 className="sh-title">Service Hours</h1>
          <p className="sh-sub">Jam layanan support IT.</p>

          <div className="sh-card">
            <div className="sh-row">
              <span>Senin - Jumat</span>
              <strong>08:00 - 18:00</strong>
            </div>
            <div className="sh-row">
              <span>Sabtu</span>
              <strong>Closed</strong>
            </div>
            <div className="sh-row">
              <span>Minggu</span>
              <strong>Closed</strong>
            </div>

            <div className="sh-note">
              Catatan: Untuk prioritas HIGH, silakan buat ticket dengan detail lengkap.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
