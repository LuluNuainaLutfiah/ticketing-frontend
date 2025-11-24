import api from "./api";

export async function fetchAdminTickets() {
  const res = await api.get("/api/admin/tickets");
  return res.data; 
}

export async function fetchAdminActivities() {
  const res = await api.get("/api/admin/activities");
  return res.data;
}
