import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; 
// Ganti dengan URL backend kamu

export const fetchAdminActivities = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_BASE_URL}/admin/activity-log`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data; // Backend mengembalikan { data: { activity_log: [...] } }
};
