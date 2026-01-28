import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
 
      const res = await api.post("/auth/forgot-password", { email });

      setAlert({
        type: "success",
        message: res.data?.message || "Link reset berhasil dikirim ke email.",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal mengirim email reset. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-title-centered">Lupa Kata Sandi</div>

          {alert.message && (
            <div className={`auth-alert ${alert.type}`}>{alert.message}</div>
          )}

          <form onSubmit={submit}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="email">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="Masukkan email terdaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>

          <div className="auth-bottom-box">
            <Link to="/login">Kembali ke Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
