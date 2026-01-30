import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" }); // Change port if needed

export const fetchUsers = () => API.get("/users");
export const approveUser = (id) => API.patch(`/users/${id}/approve`);
export const suspendUser = (id) => API.patch(`/users/${id}/suspend`);
export const deleteUser = (id) => API.delete(`/users/${id}`);
