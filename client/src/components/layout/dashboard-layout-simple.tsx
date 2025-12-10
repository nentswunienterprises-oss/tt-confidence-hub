import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FolderKanban, TrendingUp } from "lucide-react";

interface DashboardLayoutSimpleProps {
  children: ReactNode;
}

export function DashboardLayoutSimple({ children }: DashboardLayoutSimpleProps) {
  return (
    <div>
      <div style={{ background: "red", padding: "20px", color: "white" }}>
        NAVIGATION TABS SHOULD BE HERE
      </div>
      {children}
    </div>
  );
}
