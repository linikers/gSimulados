import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "@gsimulados/shared";

interface AuthGuardProps {
  allowedRoles?: UserRole[];
}

export function AuthGuard({ allowedRoles }: AuthGuardProps) {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!signed || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    // If user's role is not allowed, redirect to dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
