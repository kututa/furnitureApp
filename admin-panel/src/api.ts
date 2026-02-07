import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1/admin";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to log failed requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  },
);

export const fetchUsers = () => api.get("/users");
export const approveUser = (id: string) => api.patch(`/users/${id}/approve`);
export const suspendUser = (id: string) => api.patch(`/users/${id}/suspend`);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);
