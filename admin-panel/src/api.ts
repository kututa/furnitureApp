import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1/admin";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchUsers = () => api.get("/users");
export const approveUser = (id) => api.patch(`/users/${id}/approve`);
export const suspendUser = (id) => api.patch(`/users/${id}/suspend`);
export const deleteUser = (id) => api.delete(`/users/${id}`);
