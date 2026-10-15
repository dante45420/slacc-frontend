// Session + error helpers shared by the news pages that call authenticated
// endpoints (member submission, admin editor, admin moderation bar).
import { startTransition, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { errorMessage, isAuthError } from "../../components/admin/adminUtils";
import { NEWS_CATEGORIES } from "../../components/news/newsUtils";

/**
 * Returns `handleAuthError(err, draft?)`. When the API says the stored JWT is
 * missing, expired or invalid (401/422) it keeps the optional draft for this
 * page, logs out and sends the user to /login (with the "session expired"
 * notice), coming back here afterwards. Returns true when it handled the error.
 */
export function useNewsSession() {
  const { logout } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const latest = useRef({ logout, navigate, location });
  latest.current = { logout, navigate, location };

  return useCallback((err, draft) => {
    if (!isAuthError(err)) return false;
    const { logout: doLogout, navigate: go, location: from } = latest.current;
    if (draft) saveDraft(from.pathname, draft);
    // The router navigates inside a transition (v7_startTransition). Clearing the
    // user in the same transition makes both land in one render, so the page's
    // ProtectedRoute cannot redirect first and drop the "session expired" reason.
    startTransition(() => {
      go("/login", { replace: true, state: { from, reason: "session_expired" } });
      doLogout?.();
    });
    return true;
  }, []);
}

/**
 * Text for an API error: the backend's own (Spanish) message when it is a
 * readable sentence, else the translated fallback. Bare 403 "Forbidden"
 * responses also use the fallback.
 */
export function newsErrorText(err, fallback) {
  if (err?.status === 403 && err?.code !== "account_inactive") return fallback;
  return errorMessage(err, fallback);
}

// Drafts survive the trip through /login (text fields only: files cannot be stored).
const DRAFT_PREFIX = "slacc.newsDraft:";

function saveDraft(path, draft) {
  try {
    sessionStorage.setItem(DRAFT_PREFIX + path, JSON.stringify(draft));
  } catch {
    // storage unavailable (private mode, blocked): nothing to keep
  }
}

/** Reads the draft saved for `path` (or null). Pair it with clearDraft once used. */
export function readDraft(path) {
  try {
    const raw = sessionStorage.getItem(DRAFT_PREFIX + path);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export function clearDraft(path) {
  try {
    sessionStorage.removeItem(DRAFT_PREFIX + path);
  } catch {
    // nothing to clear
  }
}

/** The text fields of a restored draft, validated (never trust stored shapes). */
export function draftFields(draft) {
  const out = {};
  for (const key of ["title", "excerpt", "content", "category"]) {
    if (typeof draft?.[key] === "string") out[key] = draft[key];
  }
  if (out.category && !NEWS_CATEGORIES.some(cat => cat.id === out.category)) {
    delete out.category;
  }
  return out;
}
