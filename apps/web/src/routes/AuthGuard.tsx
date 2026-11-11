import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "@gsimulados/shared";

interface AuthGuardProps {
  allowedRoles?: UserRole[];
}

export function AuthGuard({ allowedRoles }: AuthGuardProps) {
  const { signed, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!signed || !user) {
    // Visitante não pode cair na home em silêncio: vai para o login com o
    // motivo e volta para a página pedida depois de entrar.
    const aviso = location.pathname.startsWith("/aluno/simulados")
      ? "Entre para ver seus simulados."
      : "Entre na sua conta para continuar.";

    return (
      <Navigate
        to="/login"
        replace
        state={{ aviso, from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    // If user's role is not allowed, redirect to dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
