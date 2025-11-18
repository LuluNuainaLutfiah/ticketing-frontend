import axios from "axios";

const API = import.meta.env.VITE_API_URL;
// API = "http://127.0.0.1:8000/api/auth"

export const loginUser = (email, password) => {
  return axios.post(`${API}/login`, {
    email,
    password,
  });
};
