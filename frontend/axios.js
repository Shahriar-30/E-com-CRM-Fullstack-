import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Your backend URL
  // baseURL: "http://localhost:8080/api/v1", // Your backend URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
