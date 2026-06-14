import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import config from "../config";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // If we already verified this session, skip the API call
      const alreadyVerified = sessionStorage.getItem("sessionVerified") === userId;
      if (alreadyVerified) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(`${config.API_URL}/users/${userId}`);
        if (response.status === 404 || response.status === 400) {
          // Account no longer exists or ID is malformed — force logout
          localStorage.removeItem("userId");
          sessionStorage.removeItem("sessionVerified");
          setIsAuthenticated(false);
        } else {
          // Mark as verified for the rest of this browser session
          sessionStorage.setItem("sessionVerified", userId);
          setIsAuthenticated(true);
        }
      } catch {
        // Network unavailable — allow through rather than locking the user out
        setIsAuthenticated(true);
      }

      setIsChecking(false);
    };

    void checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <p className="text-ink text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
