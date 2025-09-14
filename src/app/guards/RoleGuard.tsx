import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { selectRole } from "../../features/auth/slice";
import { can, Action } from "../../lib/ability";
import { Navigate } from "react-router-dom";

export default function RoleGuard({
  action,
  children,
}: {
  action: Action;
  children: ReactNode;
}) {
  const role = useSelector(selectRole);
  return can(role, action) ? <>{children}</> : <Navigate to="/login" replace />;
}
