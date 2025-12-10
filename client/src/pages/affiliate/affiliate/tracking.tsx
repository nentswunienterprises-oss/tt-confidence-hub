import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Home, FolderKanban, TrendingUp, AlertCircle, Search, LogOut, User } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

type FilterType = "all" | "leads" | "closes" | "objections";

export default function AffiliateTracking() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex justify-center flex-1 gap-4">
            <Link to="/affiliate/affiliate/home">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <Link to="/affiliate/affiliate/discover-deliver">
              <Button variant="ghost" size="sm" className="gap-2">
                <FolderKanban className="w-4 h-4" />
                Discover & Deliver
              </Button>
            </Link>
            <Link to="/affiliate/affiliate/tracking">
              <Button variant="default" size="sm" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Tracking
              </Button>
            </Link>
            <Link to="/affiliate/affiliate/updates">
              <Button variant="ghost" size="sm" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                Updates
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-full p-0 flex items-center justify-center border border-foreground/30"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User className="w-5 h-5" />
            </Button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-card border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b">
                  <p className="font-semibold text-foreground">{user?.firstName} {user?.lastName || ""}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-accent text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-r from-primary/10 to-amber-500/10 border-b p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Tracking</h1>
            <p className="text-lg text-muted-foreground">
              Monitor every parent you've met and track their journey to becoming a lead or close.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
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
                              <p className="text-muted-foreground capitalize">{record.final_outcome}</p>
                            </div>
                          )}
                        </div>

                        {/* Delivery Notes */}
                        {record.delivery_notes && (
                          <div>
                            <p className="text-sm font-semibold text-foreground">Delivery Notes</p>
                            <p className="text-sm text-muted-foreground">{record.delivery_notes}</p>
                          </div>
                        )}

                        {/* Result & Thoughts */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {record.result && (
                            <div>
                              <p className="font-semibold text-foreground">Result</p>
                              <p className="text-muted-foreground">{record.result}</p>
                            </div>
                          )}
                          {record.my_thoughts && (
                            <div>
                              <p className="font-semibold text-foreground">My Thoughts</p>
                              <p className="text-muted-foreground">{record.my_thoughts}</p>
                            </div>
                          )}
                        </div>

                        {/* Confidence Rating */}
                        {record.confidence_rating && (
                          <div>
                            <p className="text-sm font-semibold text-foreground">Confidence Rating</p>
                            <div className="flex gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < record.confidence_rating ? "bg-yellow-400" : "bg-gray-300"
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
        </div>
      </div>
    </div>
  );
}
