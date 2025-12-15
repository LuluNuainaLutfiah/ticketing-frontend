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
  // backend kirim: { message: "...", data: [...] }
  return res.data; // bisa {data:[...]} atau langsung [...]
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
 * Admin update status tiket (dipakai di AdminTickets.jsx)
 * PATCH /api/admin/tickets/{id_ticket}/status
 *
 * newStatus HARUS salah satu:
 *  - "OPEN"
 *  - "IN_PROGRESS"
 *  - "RESOLVED"
 *
 * (kalau kirim "CLOSED" akan ditolak backend, karena tidak ada di validasi)
 */
export const adminUpdateTicketStatus = async (idTicket, newStatus) => {
  const res = await api.patch(`/admin/tickets/${idTicket}/status`, {
    status: newStatus,
  });
  return res.data; // { message, data: {...ticket} }
};

/**
 * Versi generic pakai payload object
 * Tetap ke endpoint: PATCH /api/admin/tickets/{id_ticket}/status
 */
export const adminUpdateTicket = async (id, payload) => {
  const res = await api.patch(`/admin/tickets/${id}/status`, payload);
  return res.data;
};

// ============================
// TICKET CHAT (USER & ADMIN)
// ============================

/**
 * Ambil semua pesan chat dalam 1 ticket
 * GET /api/tickets/{id_ticket}/messages
 */
export const fetchTicketMessages = async (ticketId) => {
  const res = await api.get(`/tickets/${ticketId}/messages`);
  // backend: { message: 'Messages fetched', data: [...] }
  return res.data;
};

/**
 * Kirim pesan + (optional) multi file
 * POST /api/tickets/{id_ticket}/messages
 *
 * payload: FormData
 *  - message_body (string, optional)
 *  - files[] (file, optional)
 */
export const sendTicketMessage = async (ticketId, formData) => {
  const res = await api.post(`/tickets/${ticketId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // backend: { message: 'Message sent', data: {...} }
  return res.data;
};

