import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

type TutorGatewaySession = {
  applicationStatus?: {
    status?: string;
  } | null;
  assignment?: unknown;
};

export function TutorGatewayGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: gatewaySession, isLoading: gatewayLoading } = useQuery<TutorGatewaySession>({
    queryKey: ["/api/tutor/gateway-session"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading || (isAuthenticated && gatewayLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading tutor access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/operational/signup?role=tutor" replace />;
  }

  const currentPath = location.pathname;
  const isGatewayRoute = currentPath === "/operational/tutor/gateway";
  const status = String(gatewaySession?.applicationStatus?.status || "").toLowerCase();
  const hasPodAssignment = Boolean(gatewaySession?.assignment);
  const hasTutorAccess = status === "confirmed" && hasPodAssignment;

  if (!hasTutorAccess && !isGatewayRoute) {
    return <Navigate to="/operational/tutor/gateway" replace />;
  }

  if (hasTutorAccess && isGatewayRoute) {
    return <Navigate to="/tutor/pod" replace />;
  }

  return <>{children}</>;
}
