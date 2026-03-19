import { createContext, useState, useContext, useEffect } from "react";
import api from "./axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const { accessToken, user: loggedInUser } = response.data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setUser(loggedInUser);
      toast.success("Logged in successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await api.post("/users/register", {
        fullName,
        email,
        password,
      });
      const { accessToken, user: registeredUser } = response.data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(registeredUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setUser(registeredUser);
      toast.success("Registered successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    toast.success("Logged out.");
  };

  const value = { user, loading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
