import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../auth/AuthContext.jsx";
import { Spinner } from "../components/ui";

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requirePaid = false,
}) {
  const { user, loading } = useAuth();

  // If still loading auth state, show loading spinner
  if (loading || user === undefined) {
    return (
      <div className="flex-center min-h-60vh">
        <Spinner />
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin is required and user is not admin, redirect to home
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Paid content is available to admins or members with paid status
  if (requirePaid && user.role !== "admin" && user.payment_status !== "paid") {
    return <Navigate to="/por-que-ser-socio" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
  requirePaid: PropTypes.bool,
};
