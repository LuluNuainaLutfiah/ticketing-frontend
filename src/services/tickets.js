import api from "./api";

/* ============================
 * USER TICKETS
 * ============================ */

/**
 * Ambil semua ticket milik user login
 * GET /api/tickets
 */
export const fetchUserTickets = async (params = {}) => {
  const res = await api.get("/tickets", { params });
  return res.data;
};

/**
 * Ambil detail 1 ticket user
 * GET /api/tickets/{id}
 */
export const fetchUserTicketDetail = async (id) => {
  const res = await api.get(`/tickets/${id}`);
  return res.data;
};

/**
 * Buat ticket baru
 * POST /api/tickets
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
 * Update ticket user
 * PUT /api/tickets/{id}
 */
export const updateUserTicket = async (id, payload) => {
  const res = await api.put(`/tickets/${id}`, payload);
  return res.data;
};

/**
 * Hapus ticket user
 * DELETE /api/tickets/{id}
 */
export const deleteUserTicket = async (id) => {
  const res = await api.delete(`/tickets/${id}`);
  return res.data;
};

/* ============================
 * ADMIN TICKETS
 * ============================ */

/**
 * Ambil semua ticket (ADMIN) - PAGINATION
 * GET /api/admin/tickets?page=1
 * Backend return paginator: { message, data: { current_page, data:[...], ... } }
 */
export const fetchAdminTickets = async (params = {}) => {
  const res = await api.get("/admin/tickets", { params });
  return res.data;
};

/**
 * Ambil 10 ticket terbaru untuk DASHBOARD ADMIN
 * GET /api/admin/dashboard/recent-tickets
 * Backend sudah limit 10, jadi FE tidak perlu kirim page/perPage
 */
export const fetchAdminRecentTickets = async () => {
  const res = await api.get("/admin/dashboard/recent-tickets");
  return res.data;
};

/**
 * Detail 1 ticket (ADMIN)
 * GET /api/admin/tickets/{id}
 */
export const fetchAdminTicketDetail = async (id) => {
  const res = await api.get(`/admin/tickets/${id}`);
  return res.data;
};

/**
 * Summary dashboard admin
 * GET /api/admin/dashboard/summary
 */
export const fetchAdminSummary = async () => {
  const res = await api.get("/admin/dashboard/summary");
  return res.data;
};

/**
 * Update status ticket (ADMIN) - FLOW ENDPOINT
 * IN_REVIEW  -> PATCH /api/admin/tickets/{id}/open
 * IN_PROGRESS-> PATCH /api/admin/tickets/{id}/start-work
 * RESOLVED   -> PATCH /api/admin/tickets/{id}/resolve
 */
export const adminUpdateTicketStatus = async (idTicket, newStatus) => {
  const st = String(newStatus || "").toUpperCase();

  if (st === "IN_REVIEW") {
    const res = await api.patch(`/admin/tickets/${idTicket}/open`);
    return res.data; // { message, ticket, chat }
  }

  if (st === "IN_PROGRESS") {
    const res = await api.patch(`/admin/tickets/${idTicket}/start-work`);
    return res.data; // { message, ticket }
  }

  if (st === "RESOLVED") {
    const res = await api.patch(`/admin/tickets/${idTicket}/resolve`);
    return res.data; // { message, ticket }
  }

  throw new Error(`Status "${st}" belum didukung oleh endpoint backend.`);
};

/**
 * Generic update ticket (ADMIN)
 * Kalau dipakai, arahkan ke flow status juga
 */
export const adminUpdateTicket = async (id, payload) => {
  const st = String(payload?.status || "").toUpperCase();
  return adminUpdateTicketStatus(id, st);
};

/* ============================
 * TICKET CHAT
 * ============================ */

export const fetchTicketMessages = async (ticketId) => {
  const res = await api.get(`/tickets/${ticketId}/messages`);
  return res.data;
};

export const sendTicketMessage = async (ticketId, formData) => {
  const res = await api.post(`/tickets/${ticketId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
