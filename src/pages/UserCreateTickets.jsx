import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setAttachment(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // validasi sederhana
    if (!title || !category || !priority || !description) {
      setErrorMsg("Harap isi semua field wajib bertanda *");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description);

      // kalau backend butuh user_id, biasanya sudah dari token; kalau butuh manual:
      // if (user.id) formData.append("user_id", user.id);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      await createUserTicket(formData);

      setSuccessMsg("Ticket berhasil dibuat.");
      // reset form
      setTitle("");
      setCategory("");
      setPriority("");
      setDescription("");
      setAttachment(null);

      // setelah beberapa detik, redirect ke My Tickets
      setTimeout(() => {
        navigate("/user/tickets");
      }, 800);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message ||
          "Gagal mengirim ticket ke server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/user/tickets");
  };

  return (
    <div className="user-page">
      <UserSidebar active="create-ticket" />

      <main className="user-main uct-main">
        {/* HEADER ATAS */}
        <header className="uct-header">
          <h1 className="uct-header-title">Create New Ticket</h1>
          <p className="uct-header-sub">
            Submit a new support request.
          </p>
        </header>

        <div className="uct-wrapper">
          <section className="uct-card">
            {/* icon & judul kecil */}
            <div className="uct-card-header">
              <div className="uct-icon-circle">➕</div>
              <div>
                <div className="uct-card-title">Create Support Ticket</div>
                <div className="uct-card-sub">
                  Fill out the form below to submit your support request
                </div>
              </div>
            </div>

            {errorMsg && <div className="uct-alert error">{errorMsg}</div>}
            {successMsg && <div className="uct-alert success">{successMsg}</div>}

            {/* FORM */}
            <form className="uct-form" onSubmit={handleSubmit}>
              {/* TITLE */}
              <div className="uct-form-group">
                <label className="uct-label">
                  Ticket Title <span className="uct-required">*</span>
                </label>
                <input
                  type="text"
                  className="uct-input"
                  placeholder="Brief description of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* CATEGORY + PRIORITY */}
              <div className="uct-row">
                <div className="uct-form-group">
                  <label className="uct-label">
                    Category <span className="uct-required">*</span>
                  </label>
                  <select
                    className="uct-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    <option value="Email">Email</option>
                    <option value="Network">Network</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Account">Account</option>
                    {/* kalau mau dinamis dari DB bisa diubah nanti */}
                  </select>
                </div>

                <div className="uct-form-group">
                  <label className="uct-label">
                    Priority Level <span className="uct-required">*</span>
                  </label>
                  <select
                    className="uct-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="uct-form-group">
                <label className="uct-label">
                  Detailed Description <span className="uct-required">*</span>
                </label>
                <textarea
                  className="uct-textarea"
                  placeholder="Please provide as much detail as possible about your issue..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="uct-hint">
                  The more details you provide, the faster we can resolve your
                  issue.
                </div>
              </div>

              {/* ATTACHMENT */}
              <div className="uct-form-group">
                <label className="uct-label">
                  Attachments (Optional)
                </label>

                <label className="uct-upload-box">
                  <input
                    type="file"
                    className="uct-file-input"
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg,.pdf"
                  />
                  <div className="uct-upload-icon">📎</div>
                  <div className="uct-upload-text">
                    {attachment
                      ? attachment.name
                      : "Click to upload or drag and drop"}
                    <div className="uct-upload-sub">
                      PNG, JPG, PDF up to 10MB
                    </div>
                  </div>
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="uct-actions">
                <button
                  type="button"
                  className="uct-btn uct-btn-ghost"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="uct-btn uct-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
