import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";
import PropTypes from "prop-types";

const AuthCtx = createContext(null);

// Only these mean the stored token is no longer valid. Network errors, 5xx
// and backend cold starts must not log the user out.
const INVALID_TOKEN_STATUSES = new Set([401, 403, 422]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return undefined;
    }
    apiGet("/me")
      .then(me => {
        if (!cancelled) setUser(me);
      })
      .catch(err => {
        if (cancelled) return;
        if (INVALID_TOKEN_STATUSES.has(err.status)) {
          localStorage.removeItem("access_token");
        }
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    const data = await apiPost("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    setLoading(false);
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
