// src/services/tickets.js
import api from "./api";

/* ============================
 * USER TICKETS
 * ============================ */

/**
 * Ambil semua ticket milik user yang sedang login
 * GET /api/tickets  (userIndex)
 */
export const fetchUserTickets = async (params = {}) => {
  const res = await api.get("/tickets", { params });
  return res.data; // bisa {data:[...]} atau [...]
};

/**
 * Ambil detail 1 ticket user
 * GET /api/tickets/{id_ticket}
 */
export const fetchUserTicketDetail = async (id) => {
  const res = await api.get(`/tickets/${id}`);
  return res.data;
};

/**
 * Buat ticket baru
 * POST /api/tickets
 * - di frontend kamu kirim FormData, jadi cek dulu tipenya
 */
export const createUserTicket = async (payload) => {
  const isFormData = payload instanceof FormData;

  const res = await api.post("/tickets", payload, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" },
  });

  return res.data;
};

/**
 * Update ticket user (kalau dipakai)
 * PUT /api/tickets/{id_ticket}
 */
export const updateUserTicket = async (id, payload) => {
  const res = await api.put(`/tickets/${id}`, payload);
  return res.data;
};

/**
 * Hapus ticket user (kalau dipakai)
 * DELETE /api/tickets/{id_ticket}
 */
export const deleteUserTicket = async (id) => {
  const res = await api.delete(`/tickets/${id}`);
  return res.data;
};

/* ============================
 * ADMIN TICKETS
 * ============================ */

/**
 * Ambil semua ticket untuk admin
 * GET /api/admin/tickets
 */
export const fetchAdminTickets = async (params = {}) => {
  const res = await api.get("/admin/tickets", { params });
  return res.data;
};

/**
 * Detail 1 ticket untuk admin
 * GET /api/admin/tickets/{id_ticket}
 */
export const fetchAdminTicketDetail = async (id) => {
  const res = await api.get(`/admin/tickets/${id}`);
  return res.data;
};

/**
 * Admin update status tiket
 * PATCH /api/admin/tickets/{id_ticket}/status
 */
export const adminUpdateTicket = async (id, payload) => {
  const res = await api.patch(`/admin/tickets/${id}/status`, payload);
  return res.data;
};
