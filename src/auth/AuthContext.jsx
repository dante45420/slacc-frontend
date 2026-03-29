import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";
import PropTypes from "prop-types";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      apiGet("/me")
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("access_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
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

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  return useContext(AuthCtx);
}
