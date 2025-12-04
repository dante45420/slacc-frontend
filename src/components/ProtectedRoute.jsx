import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../auth/AuthContext.jsx";
import { Spinner } from "../components/ui";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useAuth();

  // If user is not loaded yet, show loading spinner
  if (user === undefined) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
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

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
};
