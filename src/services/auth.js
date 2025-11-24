import api from "./api";

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
}

export async function register({ name, email, password, password_confirmation }) {
  const response = await api.post("/api/auth/register", {
    name,
    email,
    password,
    password_confirmation,
  });
  return response.data;
}
