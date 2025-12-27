import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Users, TrendingUp, Calendar, Mail, Search, UserPlus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliateCode: string;
  totalEncounters: number;
  totalLeads: number;
  totalCloses: number;
  status: "active" | "inactive" | "pending";
  joinedAt: string;
}

export default function ODAffiliates() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch affiliates data
  const { data: affiliates = [], isLoading: dataLoading, error: dataError } = useQuery<Affiliate[]>({
    queryKey: ["/api/od/affiliates"],
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

  if (authLoading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredAffiliates = affiliates.filter((affiliate) =>
    affiliate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    affiliate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    affiliate.affiliateCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Affiliate["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-500";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Affiliates</h1>
            <p className="text-muted-foreground mt-1">
              Manage your affiliate team and track their performance
            </p>
          </div>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Affiliate
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search affiliates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-2xl font-bold">{affiliates.length}</p>
            <p className="text-sm text-muted-foreground">Total Affiliates</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-green-600">
              {affiliates.filter((a) => a.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-primary">
              {affiliates.reduce((sum, a) => sum + a.totalEncounters, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Encounters</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-green-600">
              {affiliates.reduce((sum, a) => sum + a.totalCloses, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Closes</p>
          </Card>
        </div>

        {/* Affiliates Grid */}
        {filteredAffiliates.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAffiliates.map((affiliate) => (
              <Card key={affiliate.id} className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(affiliate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{affiliate.name}</h3>
                      <Badge className={getStatusColor(affiliate.status)}>
                        {affiliate.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {affiliate.email}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{affiliate.totalEncounters}</p>
                    <p className="text-xs text-muted-foreground">Encounters</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{affiliate.totalLeads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{affiliate.totalCloses}</p>
                    <p className="text-xs text-muted-foreground">Closes</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-mono text-xs">{affiliate.affiliateCode}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(affiliate.joinedAt), "MMM yyyy")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Affiliates Yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No affiliates match your search."
                : "Invite affiliates to grow your team."}
            </p>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite First Affiliate
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
