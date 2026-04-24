import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Search, Users, UserPlus, CreditCard, Trash2 } from "lucide-react";

interface EligibleEgp {
  id: string;
  name: string;
  email: string;
  onboardingCompletedAt: string;
  applicationStatus: string;
  currentCrewId: string | null;
}

interface CrewMember {
  egpId: string;
  membershipId: string;
  role: "member" | "crew_lead";
  joinedAt: string;
  name: string;
  email?: string | null;
  totalLeads: number;
  totalCloses: number;
  totalPayments: number;
  pendingPayments: number;
}

interface Crew {
  id: string;
  crewName: string;
  territory?: string | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  totalLeads: number;
  totalCloses: number;
  totalPayments: number;
  pendingPayments: number;
  members: CrewMember[];
}

const formatCurrency = (value: number) => `R${Number(value || 0).toFixed(2)}`;

export default function ODCrews() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [crewName, setCrewName] = useState("");
  const [territory, setTerritory] = useState("");
  const [selectedEgpByCrew, setSelectedEgpByCrew] = useState<Record<string, string>>({});

  const {
    data: crews = [],
    isLoading: crewsLoading,
    error: crewsError,
  } = useQuery<Crew[]>({
    queryKey: ["/api", "od", "crews"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: eligibleEgps = [],
    isLoading: eligibleLoading,
    error: eligibleError,
  } = useQuery<EligibleEgp[]>({
    queryKey: ["/api", "od", "crew-eligible-egps"],
    queryFn: getQueryFn({ on401: "throw" }),
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
    const error = crewsError || eligibleError;
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [crewsError, eligibleError, toast]);

  const createCrewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/od/crews", {
        crewName,
        territory: territory || null,
      });
    },
    onSuccess: async () => {
      setCrewName("");
      setTerritory("");
      await queryClient.invalidateQueries({ queryKey: ["/api", "od", "crews"] });
      toast({ title: "Crew created" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create crew",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ crewId, egpId }: { crewId: string; egpId: string }) => {
      await apiRequest("POST", `/api/od/crews/${crewId}/members`, { egpId });
    },
    onSuccess: async (_, variables) => {
      setSelectedEgpByCrew((current) => ({ ...current, [variables.crewId]: "" }));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api", "od", "crews"] }),
        queryClient.invalidateQueries({ queryKey: ["/api", "od", "crew-eligible-egps"] }),
      ]);
      toast({ title: "EGP added to crew" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add EGP",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ crewId, egpId }: { crewId: string; egpId: string }) => {
      await apiRequest("DELETE", `/api/od/crews/${crewId}/members/${egpId}`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api", "od", "crews"] }),
        queryClient.invalidateQueries({ queryKey: ["/api", "od", "crew-eligible-egps"] }),
      ]);
      toast({ title: "EGP removed from crew" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove EGP",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const unassignedEligibleEgps = useMemo(
    () => eligibleEgps.filter((egp) => !egp.currentCrewId),
    [eligibleEgps]
  );

  const filteredCrews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return crews;

    return crews.filter((crew) =>
      crew.crewName.toLowerCase().includes(query) ||
      String(crew.territory || "").toLowerCase().includes(query) ||
      crew.members.some((member) =>
        member.name.toLowerCase().includes(query) ||
        String(member.email || "").toLowerCase().includes(query)
      )
    );
  }, [crews, searchQuery]);

  if (authLoading || crewsLoading || eligibleLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-28" />
          <Skeleton className="h-60" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Crews</h1>
          <p className="text-muted-foreground">
            Group approved, fully onboarded EGPs into operating crews.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <Users className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{crews.length}</p>
            <p className="text-sm text-muted-foreground">Crews</p>
          </Card>
          <Card className="p-4">
            <UserPlus className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{eligibleEgps.length}</p>
            <p className="text-sm text-muted-foreground">Eligible EGPs</p>
          </Card>
          <Card className="p-4">
            <Users className="mb-3 h-5 w-5 text-green-600" />
            <p className="text-2xl font-bold">
              {crews.reduce((sum, crew) => sum + Number(crew.memberCount || 0), 0)}
            </p>
            <p className="text-sm text-muted-foreground">Crewed EGPs</p>
          </Card>
          <Card className="p-4">
            <CreditCard className="mb-3 h-5 w-5 text-yellow-600" />
            <p className="text-2xl font-bold">
              {formatCurrency(crews.reduce((sum, crew) => sum + Number(crew.pendingPayments || 0), 0))}
            </p>
            <p className="text-sm text-muted-foreground">Pending Payments</p>
          </Card>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
            <Input
              value={crewName}
              onChange={(event) => setCrewName(event.target.value)}
              placeholder="Crew name"
            />
            <Input
              value={territory}
              onChange={(event) => setTerritory(event.target.value)}
              placeholder="Territory"
            />
            <Button
              onClick={() => createCrewMutation.mutate()}
              disabled={!crewName.trim() || createCrewMutation.isPending}
            >
              Create Crew
            </Button>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search crews or members..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>

        {filteredCrews.length > 0 ? (
          <div className="space-y-4">
            {filteredCrews.map((crew) => {
              const addableEgps = unassignedEligibleEgps;
              const selectedEgpId = selectedEgpByCrew[crew.id] || "";

              return (
                <Card key={crew.id} className="p-4 sm:p-6">
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">{crew.crewName}</h2>
                        <p className="text-sm text-muted-foreground">
                          {crew.territory || "No territory set"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4 sm:text-right">
                        <div>
                          <p className="font-semibold">{crew.memberCount}</p>
                          <p className="text-muted-foreground">Members</p>
                        </div>
                        <div>
                          <p className="font-semibold">{crew.totalLeads}</p>
                          <p className="text-muted-foreground">Leads</p>
                        </div>
                        <div>
                          <p className="font-semibold">{crew.totalCloses}</p>
                          <p className="text-muted-foreground">Closes</p>
                        </div>
                        <div>
                          <p className="font-semibold">{formatCurrency(crew.totalPayments)}</p>
                          <p className="text-muted-foreground">Payments</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <select
                        value={selectedEgpId}
                        onChange={(event) =>
                          setSelectedEgpByCrew((current) => ({
                            ...current,
                            [crew.id]: event.target.value,
                          }))
                        }
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Add eligible EGP...</option>
                        {addableEgps.map((egp) => (
                          <option key={egp.id} value={egp.id}>
                            {egp.name} ({egp.email})
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => addMemberMutation.mutate({ crewId: crew.id, egpId: selectedEgpId })}
                        disabled={!selectedEgpId || addMemberMutation.isPending}
                      >
                        Add to Crew
                      </Button>
                    </div>

                    {crew.members.length > 0 ? (
                      <div className="space-y-3">
                        {crew.members.map((member) => (
                          <div
                            key={member.membershipId}
                            className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_auto] sm:items-center"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold">{member.name}</p>
                              <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {member.role === "crew_lead" ? "Crew Lead" : "Member"}
                              </p>
                            </div>
                            <div className="text-sm">
                              <p className="font-semibold">{member.totalLeads}</p>
                              <p className="text-muted-foreground">Leads</p>
                            </div>
                            <div className="text-sm">
                              <p className="font-semibold">{member.totalCloses}</p>
                              <p className="text-muted-foreground">Closes</p>
                            </div>
                            <div className="text-sm">
                              <p className="font-semibold">{formatCurrency(member.totalPayments)}</p>
                              <p className="text-muted-foreground">Payments</p>
                            </div>
                            <div className="text-sm">
                              <p className="font-semibold">{formatCurrency(member.pendingPayments)}</p>
                              <p className="text-muted-foreground">Pending</p>
                            </div>
                            <div className="sm:text-right">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeMemberMutation.mutate({ crewId: crew.id, egpId: member.egpId })}
                                disabled={removeMemberMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          This crew has no members yet.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Crews Yet</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No crews match your search."
                : "Create your first crew, then assign eligible EGPs to it."}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
