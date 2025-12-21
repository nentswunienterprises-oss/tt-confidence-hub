import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

type FilterType = "all" | "leads" | "closes" | "objections";

export default function AffiliateTracking() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  // Fetch breakdown stats
  const { data: breakdown } = useQuery<{ all: number; leads: number; closes: number; objections: number }>({
    queryKey: ["/api", "affiliate", "breakdown"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch encounters
  const { data: encounters = [] } = useQuery<any[]>({
    queryKey: ["/api", "affiliate", "encounters"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch leads
  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ["/api", "affiliate", "leads"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch closes
  const { data: closes = [] } = useQuery<any[]>({
    queryKey: ["/api", "affiliate", "closes"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Combine and filter all records based on current view
  let filteredRecords: any[] = [];
  if (filter === "all") {
    filteredRecords = encounters;
  } else if (filter === "leads") {
    filteredRecords = leads;
  } else if (filter === "closes") {
    filteredRecords = closes;
  } else if (filter === "objections") {
    filteredRecords = encounters.filter((e: any) => e.status === "objected");
  }

  const filteredRecordsWithSearch = filteredRecords.filter((record: any) =>
    record.parent_name?.toLowerCase().includes(search.toLowerCase()) ||
    record.parent_email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "All Encounters", value: typeof breakdown?.all === 'number' ? breakdown.all : 0, filter: "all" as const },
    { label: "Leads", value: typeof breakdown?.leads === 'number' ? breakdown.leads : 0, filter: "leads" as const },
    { label: "Closes", value: typeof breakdown?.closes === 'number' ? breakdown.closes : 0, filter: "closes" as const },
    { label: "Objections", value: typeof breakdown?.objections === 'number' ? breakdown.objections : 0, filter: "objections" as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Hero */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tracking</h1>
          <p className="text-lg text-muted-foreground">
            Monitor every parent you've met and track their journey to becoming a lead or close.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {stats.map((stat) => {
            const displayValue = typeof stat.value === 'number' ? String(stat.value) : '0';
            return (
              <Button
                key={stat.filter}
                variant={filter === stat.filter ? "default" : "outline"}
                onClick={() => setFilter(stat.filter)}
                size="lg"
              >
                {stat.label}
                <span className="ml-2 font-bold text-lg">{displayValue}</span>
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by parent name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </div>

        {/* Encounters List */}
        <div className="space-y-3">
          {filteredRecordsWithSearch.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                {filter === "all" ? "No encounters found" : 
                 filter === "leads" ? "No leads found" : 
                 filter === "closes" ? "No closes found" : 
                 "No objections found"}
              </p>
            </Card>
          ) : (
            filteredRecordsWithSearch.map((record: any) => (
              <Card key={record.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Parent Info */}
                    <div>
                      <h3 className="font-bold text-lg">{record.parent_name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        {record.parent_email && <p>📧 {record.parent_email}</p>}
                        {record.parent_phone && <p>📱 {record.parent_phone}</p>}
                      </div>
                    </div>

                    {/* Child Info */}
                    {record.child_name && (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Child Information</p>
                        <p className="text-sm text-muted-foreground">👤 {record.child_name} {record.child_grade ? `(Grade ${record.child_grade})` : ""}</p>
                      </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {record.date_met && (
                        <div>
                          <p className="font-semibold text-foreground">Date Met</p>
                          <p className="text-muted-foreground">{new Date(record.date_met).toLocaleDateString()}</p>
                        </div>
                      )}
                      {record.contact_method && (
                        <div>
                          <p className="font-semibold text-foreground">Contact Method</p>
                          <p className="text-muted-foreground capitalize">{record.contact_method}</p>
                        </div>
                      )}
                      {record.discovery_outcome && (
                        <div>
                          <p className="font-semibold text-foreground">Discovery Outcome</p>
                          <p className="text-muted-foreground">{record.discovery_outcome}</p>
                        </div>
                      )}
                      {record.final_outcome && (
                        <div>
                          <p className="font-semibold text-foreground">Final Outcome</p>
                          <p className="text-muted-foreground">{record.final_outcome}</p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Notes</p>
                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                      </div>
                    )}

                    {/* Confidence Rating */}
                    {record.confidence_rating && (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Confidence Rating</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 rounded-full ${
                                i <= record.confidence_rating ? "bg-yellow-400" : "bg-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">{record.confidence_rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="text-right flex flex-col gap-3">
                    <span
                      className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap ${
                        filter === "objections"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : filter === "closes"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : filter === "leads"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {filter === "objections" ? "❌ Objection" : filter === "closes" ? "✅ Close" : filter === "leads" ? "📊 Lead" : "🎯 Encounter"}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
