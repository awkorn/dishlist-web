import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  //allow unrestricted access on localhost
  const isLocalhost = window.location.hostname === "localhost";

  if (!currentUser && !isLocalhost) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;