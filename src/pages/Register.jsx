import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import "../styles/login.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    user_type: "mahasiswa",
    id_number: "",
    phone: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const canHover =
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!canHover) return;

    let raf = 0;

    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    };

    const onLeave = () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "35%");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

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
      setErrorMsg("Kata sandi dan konfirmasi kata sandi tidak sama.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: "user",
        user_type: form.user_type,
        phone: form.phone || null,
      };

      if (form.user_type === "mahasiswa") {
        payload.npm = form.id_number;
      } else {
        payload.nik = form.id_number;
      }

      const data = await register(payload);

      const token =
        data.token ||
        data.access_token ||
        data.data?.token ||
        data.data?.access_token;

      const user = data.user || data.data?.user || data.data || null;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate("/login");
    } catch (err) {
      const resp = err.response?.data;

      if (resp?.errors) {
        const firstKey = Object.keys(resp.errors)[0];
        setErrorMsg(resp.errors[firstKey][0]);
      } else {
        setErrorMsg(resp?.message || "Registrasi gagal. Silakan coba kembali.");
      }
    } finally {
      setLoading(false);
    }
  };

  const idLabel = form.user_type === "mahasiswa" ? "NPM (Mahasiswa)" : "NIK (Dosen)";

  return (
    <div ref={pageRef} className="auth-page">
      <div className="auth-shell">
        <button
          type="button"
          className="auth-back-btn"
          onClick={() => navigate("/")}
          aria-label="Kembali ke Beranda"
          title="Kembali ke Beranda"
        >
          ←
        </button>

        <div className="auth-card">
          <div className="auth-logo-wrapper">
            <div className="auth-logo" />
          </div>

          <div className="auth-title-centered">Pendaftaran Akun</div>

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
                Alamat Email
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
              <label className="auth-label" htmlFor="user_type">
                Status Pengguna
              </label>
              <select
                id="user_type"
                name="user_type"
                className="auth-input auth-select"
                value={form.user_type}
                onChange={handleChange}
                required
              >
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
              </select>
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="id_number">
                {idLabel}
              </label>
              <input
                id="id_number"
                name="id_number"
                className="auth-input"
                value={form.id_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="phone">
                Nomor Telepon
              </label>
              <input
                id="phone"
                name="phone"
                className="auth-input"
                value={form.phone}
                onChange={handleChange}
                placeholder="+62..."
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="password">
                Kata Sandi
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
                Konfirmasi Kata Sandi
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

            <div className="auth-row-between">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                Ingat saya
              </label>
              <span />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "DAFTAR"}
            </button>
          </form>

          <div className="auth-bottom-box">
            Sudah memiliki akun? <Link to="/login">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
