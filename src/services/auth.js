// src/services/auth.js
import api from "./api";

// REGISTER
export const register = async (payload) => {
  // HARUS ke /auth/register sesuai routes/api.php
  const res = await api.post("/auth/register", payload);
  return res.data;
};

// LOGIN
export const login = async (payload) => {
  // HARUS ke /auth/login
  const res = await api.post("/auth/login", payload);
  return res.data;
};
