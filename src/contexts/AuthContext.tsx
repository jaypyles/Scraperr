import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextProps {
  user: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("/api/auth/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    const response = await axios.post("/api/auth/token", params);
    localStorage.setItem("token", response.data.access_token);
    const userResponse = await axios.get("/api/auth/users/me", {
      headers: { Authorization: `Bearer ${response.data.access_token}` },
    });
    setUser(userResponse.data);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
