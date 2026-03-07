import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";

export default function TrackLeadsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [toast, setToast] = React.useState<{ title: string; description?: string } | null>(null);
  const [tab, setTab] = React.useState("codes");

  // Saved affiliate codes/links

  // Use apiRequest for consistent API base URL
  const { data: codes = [], isLoading: codesLoading } = useQuery<any[]>({
    queryKey: ["/api/coo/affiliate-codes"],
    enabled: isAuthenticated && !authLoading,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/coo/affiliate-codes");
      return res.json();
    },
  });

  // Mutation for revoking a code
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/coo/affiliate-codes/${id}`);
      if (!res.ok) throw new Error("Failed to revoke code");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coo/affiliate-codes"] });
      setToast({ title: "Code revoked" });
    },
    onError: () => setToast({ title: "Failed to revoke code" }),
  });

  // Copy to clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ title: "Copied!", description: text });
  };
  // Example queries for leads, closes, subscriptions
  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["/api/coo/leads"],
    enabled: isAuthenticated && !authLoading,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/coo/leads");
      return res.json();
    },
  });
  const { data: closes = [], isLoading: closesLoading } = useQuery<any[]>({
    queryKey: ["/api/coo/closes"],
    enabled: isAuthenticated && !authLoading,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/coo/closes");
      return res.json();
    },
  });
  const { data: subscriptions = [], isLoading: subsLoading } = useQuery<any[]>({
    queryKey: ["/api/coo/subscriptions"],
    enabled: isAuthenticated && !authLoading,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/coo/subscriptions");
      return res.json();
    },
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => window.location.href = '/executive/coo/dashboard'}>
        ← Back to Dashboard
      </Button>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="codes">Saved Links / Codes</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="closes">Closes</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="codes">
          <Card>
            <CardHeader>
              <CardTitle>Saved Links / Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {codesLoading ? (
                <p className="text-muted-foreground">Loading codes...</p>
              ) : codes.length === 0 ? (
                <p className="text-muted-foreground">No codes found.</p>
              ) : (
                <div className="space-y-2">
                  {codes.map((code: any) => {
                    const link = `${window.location.origin}/client/signup?affiliate=${code.code}`;
                    return (
                      <div key={code.id} className="p-2 border rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono break-all select-all">
                            <b>{code.code}</b>
                            <span className="text-xs text-muted-foreground ml-2">[{code.type}]</span>
                            {code.personName && <span className="ml-2">Name: <b>{code.personName}</b></span>}
                            {code.entityName && <span className="ml-2">Entity: <b>{code.entityName}</b></span>}
                            {code.schoolType && <span className="ml-2">School: <b>{code.schoolType}</b></span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 select-all">
                            Link: <span className="break-all">{link}</span>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="outline" onClick={() => handleCopy(code.code)}>Copy Code</Button>
                          <Button size="sm" variant="outline" onClick={() => handleCopy(link)}>Copy Link</Button>
                          <Button size="sm" variant="destructive" onClick={() => revokeMutation.mutate(code.id)} disabled={revokeMutation.isPending}>Revoke</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <p className="text-muted-foreground">Loading leads...</p>
              ) : leads.length === 0 ? (
                <p className="text-muted-foreground">No leads found.</p>
              ) : (
                <div className="space-y-2">
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="p-2 border rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div><b>{lead.parentName || lead.userEmail}</b></div>
                        <div className="text-xs text-muted-foreground">
                          Status: <Badge>{lead.status}</Badge>
                          {lead.affiliateType && <span className="ml-2">Type: <b>{lead.affiliateType}</b></span>}
                          {lead.affiliateName && <span className="ml-2">Affiliate: <b>{lead.affiliateName}</b></span>}
                          {lead.leadType && <span className="ml-2">Lead Type: <b>{lead.leadType}</b></span>}
                          {lead.onboardingType && <span className="ml-2">Onboarding: <b>{lead.onboardingType}</b></span>}
                          {lead.fullName && <span className="ml-2">Full Name: <b>{lead.fullName}</b></span>}
                        </div>
                        <div className="text-xs text-muted-foreground">Created: {new Date(lead.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="closes">
          <Card>
            <CardHeader>
              <CardTitle>Closes</CardTitle>
            </CardHeader>
            <CardContent>
              {closesLoading ? (
                <p className="text-muted-foreground">Loading closes...</p>
              ) : closes.length === 0 ? (
                <p className="text-muted-foreground">No closes found.</p>
              ) : (
                <div className="space-y-2">
                  {closes.map((close: any) => (
                    <div key={close.id} className="p-2 border rounded flex justify-between items-center">
                      <span>{close.parentName || close.userEmail}</span>
                      <Badge variant="secondary">Closed</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {subsLoading ? (
                <p className="text-muted-foreground">Loading subscriptions...</p>
              ) : subscriptions.length === 0 ? (
                <p className="text-muted-foreground">No subscriptions found.</p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub: any) => (
                    <div key={sub.id} className="p-2 border rounded flex justify-between items-center">
                      <span>{sub.parentName || sub.userEmail}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ToastProvider>
        <ToastViewport />
        {toast && (
          <Toast open onOpenChange={() => setToast(null)}>
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </Toast>
        )}
      </ToastProvider>
    </div>
  );
}
