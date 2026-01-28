import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../styles/login.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = useMemo(() => params.get("email") || "", [params]);
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!email || !token) {
      setAlert({
        type: "error",
        message: "Link reset tidak valid. Silakan minta link reset baru.",
      });
      return;
    }

    if (password.length < 8) {
      setAlert({
        type: "error",
        message: "Password minimal 8 karakter.",
      });
      return;
    }

    if (password !== confirm) {
      setAlert({
        type: "error",
        message: "Konfirmasi password tidak sama.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        token,
        password,
        password_confirmation: confirm,
      });

      setAlert({
        type: "success",
        message: res.data?.message || "Password berhasil direset.",
      });

      // Optional: auto redirect ke login setelah sukses
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Gagal reset password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-title-centered">Reset Password</div>

          {alert.message && (
            <div className={`auth-alert ${alert.type}`}>{alert.message}</div>
          )}

          <form onSubmit={submit}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="password">
                Password baru
              </label>
              <input
                id="password"
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="confirm">
                Konfirmasi password
              </label>
              <input
                id="confirm"
                type="password"
                className="auth-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Reset Password"}
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
