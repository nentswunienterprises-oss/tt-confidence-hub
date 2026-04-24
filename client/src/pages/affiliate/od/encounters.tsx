import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface EgpTrackingRow {
  id: string;
  name: string;
  email?: string;
  totalLeads: number;
  totalCloses: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  conversionRate: number;
}

interface OdTrackingSummary {
  totalLeads: number;
  totalCloses: number;
  totalPayments: number;
  pendingPayments: number;
  affiliateDetails: EgpTrackingRow[];
}

const formatCurrency = (value: number) => `R${Number(value || 0).toFixed(2)}`;

export default function ODEncounters() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading: dataLoading, error: dataError } = useQuery<OdTrackingSummary>({
    queryKey: ["/api/od/tracking"],
    enabled: isAuthenticated && !authLoading,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (dataError && isUnauthorizedError(dataError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [dataError, toast]);

  const affiliateDetails = data?.affiliateDetails || [];
  const filteredAffiliates = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return affiliateDetails;

    return affiliateDetails.filter((affiliate) =>
      affiliate.name.toLowerCase().includes(query) ||
      String(affiliate.email || "").toLowerCase().includes(query)
    );
  }, [affiliateDetails, searchQuery]);

  if (authLoading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-40" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Tracking</h1>
          <p className="text-muted-foreground">
            Track EGP leads, closes, and affiliate payment status.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <Users className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{data?.totalLeads || 0}</p>
            <p className="text-sm text-muted-foreground">Leads</p>
          </Card>
          <Card className="p-4">
            <TrendingUp className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{data?.totalCloses || 0}</p>
            <p className="text-sm text-muted-foreground">Closes</p>
          </Card>
          <Card className="p-4">
            <CreditCard className="mb-3 h-5 w-5 text-green-600" />
            <p className="text-2xl font-bold">{formatCurrency(data?.totalPayments || 0)}</p>
            <p className="text-sm text-muted-foreground">EGP Payments</p>
          </Card>
          <Card className="p-4">
            <CreditCard className="mb-3 h-5 w-5 text-yellow-600" />
            <p className="text-2xl font-bold">{formatCurrency(data?.pendingPayments || 0)}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search EGPs..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>

        {filteredAffiliates.length > 0 ? (
          <div className="space-y-3">
            {filteredAffiliates.map((affiliate) => (
              <Card key={affiliate.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{affiliate.name}</h3>
                    {affiliate.email && (
                      <p className="truncate text-sm text-muted-foreground">{affiliate.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5 sm:text-right">
                    <div>
                      <p className="font-semibold">{affiliate.totalLeads}</p>
                      <p className="text-muted-foreground">Leads</p>
                    </div>
                    <div>
                      <p className="font-semibold">{affiliate.totalCloses}</p>
                      <p className="text-muted-foreground">Closes</p>
                    </div>
                    <div>
                      <p className="font-semibold">{affiliate.conversionRate}%</p>
                      <p className="text-muted-foreground">Rate</p>
                    </div>
                    <div>
                      <p className="font-semibold">{formatCurrency(affiliate.totalPayments)}</p>
                      <p className="text-muted-foreground">Payments</p>
                    </div>
                    <div>
                      <p className="font-semibold">{formatCurrency(affiliate.pendingPayments)}</p>
                      <p className="text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Tracking Yet</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No EGPs match your search."
                : "EGP leads, closes, and payment records will appear here."}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
