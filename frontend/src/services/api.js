import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post("/api/v1/auth/register", data);
export const login = (data) => api.post("/api/v1/auth/login", data);
export const createRoom = () => api.post("/api/v1/rooms/create");
export const joinRoom = (code) => api.post(`/api/v1/rooms/join/${code}`);
export const getRoom = (code) => api.get(`/api/v1/rooms/${code}`);
export const loadQuestions = (code, gameName) =>
  api.post(`/api/v1/rooms/${code}/load-questions?game_name=${gameName}`);

export default api;
