// src/services/activity.js
import api from "./api";

// PANGGIL endpoint yang MEMANG ADA di api.php:
// GET /api/admin/dashboard/recent-activities
export const fetchAdminActivities = async () => {
  const res = await api.get("/admin/dashboard/recent-activities");
  // ekspektasi: { message: "...", data: [ ... ] }
  return res.data;
};
