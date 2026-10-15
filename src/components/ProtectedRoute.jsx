import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../auth/AuthContext.jsx";
import { Spinner } from "../components/ui";

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requirePaid = false,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show loading spinner
  if (loading || user === undefined) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not logged in: go to login and come back here afterwards
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If admin is required and user is not admin, redirect to home
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Paid content is available to admins or members with paid status
  if (requirePaid && user.role !== "admin" && user.payment_status !== "paid") {
    return (
      <Navigate
        to="/perfil"
        replace
        state={{ from: location, reason: "payment_required" }}
      />
    );
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
  requirePaid: PropTypes.bool,
};
