import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export default function COOVerification() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verification Center</h1>

        <Card className="p-12 text-center border">
          <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">Document verification integrated with Applications</p>
          <p className="text-sm text-muted-foreground">
            Review documents in the Applications page
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
