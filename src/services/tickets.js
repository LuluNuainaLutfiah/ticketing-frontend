// services/tickets.js
import api from "./api";

/**
 * =======================
 *  USER TICKETS
 * =======================
 */

/**
 * Ambil semua tiket milik user yang sedang login
 * GET /api/user/tickets
 */
export const fetchUserTickets = async (params = {}) => {
  const res = await api.get("/user/tickets", { params });
  // backend bisa balikin { data: [...] } atau langsung [...]
  return res.data;
};

/**
 * Detail 1 ticket user
 * GET /api/user/tickets/{id}
 */
export const fetchUserTicketDetail = async (id) => {
  const res = await api.get(`/user/tickets/${id}`);
  return res.data;
};

/**
 * Buat tiket baru (user)
 * POST /api/user/tickets
 *
 * NOTE:
 * - `formData` harus instance FormData dari frontend
 * - Bisa berisi field biasa (title, category, dst) + file (attachment)
 */
export const createUserTicket = async (formData) => {
  const res = await api.post("/user/tickets", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};



/**
 * =======================
 *  ADMIN TICKETS
 * =======================
 */

/**
 * Ambil semua tiket untuk admin
 * GET /api/admin/tickets
 */
export const fetchAdminTickets = async (params = {}) => {
  const res = await api.get("/admin/tickets", { params });
  return res.data;
};

/**
 * Detail 1 ticket untuk admin
 * GET /api/admin/tickets/{id}
 */
export const fetchAdminTicketDetail = async (id) => {
  const res = await api.get(`/admin/tickets/${id}`);
  return res.data;
};

/**
 * Admin update status / assign tiket
 * PUT /api/admin/tickets/{id}
 */
export const adminUpdateTicket = async (id, payload) => {
  const res = await api.put(`/admin/tickets/${id}`, payload);
  return res.data;
};
