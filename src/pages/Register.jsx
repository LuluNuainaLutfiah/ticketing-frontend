import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import "../styles/login.css"; // boleh tetap ini kalau kamu memang pakai style yg sama

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (form.password !== form.password_confirmation) {
      setErrorMsg("Password dan konfirmasi password tidak sama.");
      setLoading(false);
      return;
    }

    try {
      // kirim hanya field yg dibutuhkan backend
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      };

      const data = await register(payload);

      // ---- normalize response biar aman ----
      const token =
        data.token ||
        data.access_token ||
        data.data?.token ||
        data.data?.access_token;

      const user =
        data.user ||
        data.data?.user ||
        data.data ||
        null;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      // setelah register, biasanya arahkan login
      navigate("/login");
    } catch (err) {
      console.error(err);

      const resp = err.response?.data;

      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        setErrorMsg(resp.errors[firstKey][0]);
      } else {
        setErrorMsg(resp?.message || "Registrasi gagal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo-wrapper">
            <div className="auth-logo" />
          </div>

          <div className="auth-title-centered">Register</div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="name">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                className="auth-input"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="auth-input"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="password_confirmation">
                Konfirmasi Password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                className="auth-input"
                value={form.password_confirmation}
                onChange={handleChange}
                required
              />
            </div>

            {/* checkbox ini opsional, tidak dikirim ke backend */}
            <div className="auth-row-between">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                Remember me
              </label>
              <span />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "REGISTER"}
            </button>
          </form>

          <div className="auth-bottom-box">
            Apakah anda memiliki akun?{" "}
            <Link to="/login">Login Here!</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
