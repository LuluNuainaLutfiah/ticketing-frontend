import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Paperclip, UploadCloud } from "lucide-react";
import UserSidebar from "../components/user/UserSidebar";
import "../styles/user-create-ticket.css";
import { createUserTicket } from "../services/tickets";

export default function UserCreateTicket() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAttachment(file);
  };

  const handleCancel = () => navigate("/user/tickets");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanDesc = description.trim();

    if (!cleanTitle || !cleanCategory || !priority || !cleanDesc) {
      setErrorMsg("Harap isi semua kolom wajib bertanda *");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", cleanTitle);
      formData.append("category", cleanCategory);
      formData.append("priority", priority);
      formData.append("description", cleanDesc);

      if (attachment) formData.append("files[]", attachment);

      await createUserTicket(formData);

      setSuccessMsg("Tiket berhasil dibuat.");
      setTitle("");
      setCategory("");
      setPriority("");
      setDescription("");
      setAttachment(null);

      setTimeout(() => navigate("/user/tickets"), 700);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message || "Gagal mengirim tiket ke server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="user-page">
      <UserSidebar
        active="create-ticket"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="user-main uct-main">
        <div className="uct-mobilebar">
          <button className="uct-hamburger" onClick={openSidebar} aria-label="Buka menu">
            <span />
            <span />
            <span />
          </button>

          <div className="uct-mobilebar-title">
            <div className="uct-mobilebar-main">Buat Tiket</div>
            <div className="uct-mobilebar-sub">Ajukan permintaan bantuan</div>
          </div>
        </div>

        <header className="uct-header">
          <h1 className="uct-header-title">Buat Tiket Baru</h1>
          <p className="uct-header-sub">Ajukan permintaan bantuan baru.</p>
        </header>

        <div className="uct-wrapper">
          <section className="uct-card">
            <div className="uct-card-header">
              <div className="uct-icon-circle" aria-hidden="true">
                <Plus size={18} strokeWidth={2} />
              </div>

              <div>
                <div className="uct-card-title">Buat Tiket Bantuan</div>
                <div className="uct-card-sub">
                  Isi formulir di bawah ini untuk mengajukan permintaan bantuan.
                </div>
              </div>
            </div>

            {!!errorMsg && <div className="uct-alert error">{errorMsg}</div>}
            {!!successMsg && <div className="uct-alert success">{successMsg}</div>}

            <form className="uct-form" onSubmit={handleSubmit}>
              <div className="uct-form-group">
                <label className="uct-label">
                  Judul Tiket <span className="uct-required">*</span>
                </label>
                <input
                  type="text"
                  className="uct-input"
                  placeholder="Ringkas masalah yang Anda alami"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="uct-row">
                <div className="uct-form-group">
                  <label className="uct-label">
                    Kategori <span className="uct-required">*</span>
                  </label>

                  <input
                    type="text"
                    className="uct-input"
                    list="category-suggestions"
                    placeholder="Ketik kategori (mis. Jaringan, Email...)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    autoComplete="off"
                  />

                  <datalist id="category-suggestions">
                    <option value="Email" />
                    <option value="Network" />
                    <option value="Software" />
                    <option value="Hardware" />
                    <option value="Account" />
                  </datalist>
                </div>

                <div className="uct-form-group">
                  <label className="uct-label">
                    Tingkat Prioritas <span className="uct-required">*</span>
                  </label>

                  <select
                    className="uct-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="">Pilih prioritas</option>
                    <option value="LOW">Rendah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HIGH">Tinggi</option>
                  </select>
                </div>
              </div>

              <div className="uct-form-group">
                <label className="uct-label">
                  Deskripsi Detail <span className="uct-required">*</span>
                </label>

                <textarea
                  className="uct-textarea"
                  placeholder="Jelaskan masalah Anda sedetail mungkin..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="uct-hint">
                  Semakin detail informasi yang Anda berikan, semakin cepat tim kami memahami konteks masalahnya.
                </div>
              </div>

              <div className="uct-form-group">
                <label className="uct-label">Lampiran (Opsional)</label>

                <label className="uct-upload-box">
                  <input
                    type="file"
                    className="uct-file-input"
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg,.pdf"
                  />

                  <div className="uct-upload-icon" aria-hidden="true">
                    {attachment ? (
                      <Paperclip size={18} strokeWidth={2} />
                    ) : (
                      <UploadCloud size={18} strokeWidth={2} />
                    )}
                  </div>

                  <div className="uct-upload-text">
                    <div className={`uct-upload-name ${attachment ? "has" : ""}`}>
                      {attachment ? attachment.name : "Klik untuk unggah file"}
                    </div>
                    <div className="uct-upload-sub">PNG, JPG, PDF maksimal 10MB</div>
                  </div>
                </label>
              </div>

              <div className="uct-actions">
                <button
                  type="button"
                  className="uct-btn uct-btn-ghost"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="uct-btn uct-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Mengirim..." : "Kirim Tiket"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}