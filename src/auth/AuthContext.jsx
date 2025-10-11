import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) apiGet("/me").then(setUser).catch(() => logout());
  }, []);

  async function login(email, password) {
    const data = await apiPost("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }


