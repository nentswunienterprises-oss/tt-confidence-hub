import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

type TdGatewaySession = {
  applicationStatus?: {
    status?: string;
    onboardingCompletedAt?: string | null;
    onboarding_completed_at?: string | null;
  } | null;
  hasAssignedPods?: boolean;
};

export function TdGatewayGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: gatewaySession, isLoading: gatewayLoading } = useQuery<TdGatewaySession>({
    queryKey: ["/api/td/gateway-session"],
    enabled: isAuthenticated,
  });

  if (authLoading || (isAuthenticated && gatewayLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading TD access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/operational/td/signup" replace />;
  }

  const status = String(gatewaySession?.applicationStatus?.status || "").toLowerCase();
  const onboardingCompletedAt =
    gatewaySession?.applicationStatus?.onboardingCompletedAt ??
    gatewaySession?.applicationStatus?.onboarding_completed_at ??
    null;
  const hasCompletedGateway = status === "confirmed" && Boolean(onboardingCompletedAt);
  const hasAssignedPods = Boolean(gatewaySession?.hasAssignedPods);
  const currentPath = location.pathname;

  if (!hasCompletedGateway) {
    if (currentPath !== "/operational/td/gateway") {
      return <Navigate to="/operational/td/gateway" replace />;
    }
    return <>{children}</>;
  }

  if (currentPath === "/operational/td/gateway") {
    return <Navigate to={hasAssignedPods ? "/operational/td/dashboard" : "/operational/td/no-pod"} replace />;
  }

  if (!hasAssignedPods && currentPath !== "/operational/td/no-pod" && currentPath !== "/td/no-pod") {
    return <Navigate to="/operational/td/no-pod" replace />;
  }

  if (hasAssignedPods && (currentPath === "/operational/td/no-pod" || currentPath === "/td/no-pod")) {
    return <Navigate to="/operational/td/dashboard" replace />;
  }

  return <>{children}</>;
}
