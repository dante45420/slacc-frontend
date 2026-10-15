import { useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { isAuthError } from "./adminUtils";

/**
 * Returns `handleAuthError(err)`: when the API says the session is no longer
 * valid (expired / invalid JWT) it logs out and sends the admin to /login,
 * coming back to the current tab afterwards. Returns true when it handled it.
 * The callback is stable, so loaders can list it as an effect dependency.
 */
export default function useAdminSession() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const latest = useRef({ logout, navigate, location });
  latest.current = { logout, navigate, location };

  const handleAuthError = useCallback(err => {
    if (!isAuthError(err)) return false;
    const { logout: doLogout, navigate: go, location: from } = latest.current;
    doLogout?.();
    go("/login", { replace: true, state: { from } });
    return true;
  }, []);

  return { user, handleAuthError };
}
