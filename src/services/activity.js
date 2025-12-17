// src/services/activity.js
import api from "./api";

export const fetchAdminActivities = async ({ page = 1, perPage = 10 } = {}) => {
  const res = await api.get("/admin/recent-activities", {
    params: { page, per_page: perPage },
  });
  return res.data;
};
