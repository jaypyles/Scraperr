import { useState, useEffect } from "react";
import axios from "axios";

type User = {
  full_name: string;
  email: string;
  disabled: null | boolean;
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("/api/auth/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo();
    }
  }, []);

  const login = () => {
    window.location.href = "http://localhost:8000/api/auth/login";
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
};
