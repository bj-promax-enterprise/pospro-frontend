import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import type { Role } from "../../types";

interface Props {
  allow?: Role[];
}

export default function ProtectedRoute({ allow }: Props) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/checkout" replace />;
  }

  return <Outlet />;
}
