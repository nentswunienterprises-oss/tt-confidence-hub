import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
export default function AffiliateTracking() {
    var _a = useState("all"), filter = _a[0], setFilter = _a[1];
    var _b = useState(""), search = _b[0], setSearch = _b[1];
    // Fetch breakdown stats
    var breakdown = useQuery({
        queryKey: ["/api", "affiliate", "breakdown"],
        queryFn: getQueryFn({ on401: "throw" }),
    }).data;
    // Fetch encounters
    var _c = useQuery({
        queryKey: ["/api", "affiliate", "encounters"],
        queryFn: getQueryFn({ on401: "throw" }),
    }).data, encounters = _c === void 0 ? [] : _c;
    // Fetch leads
    var _d = useQuery({
        queryKey: ["/api", "affiliate", "leads"],
        queryFn: getQueryFn({ on401: "throw" }),
    }).data, leads = _d === void 0 ? [] : _d;
    // Fetch closes
    var _e = useQuery({
        queryKey: ["/api", "affiliate", "closes"],
        queryFn: getQueryFn({ on401: "throw" }),
    }).data, closes = _e === void 0 ? [] : _e;
    // Combine and filter all records based on current view
    var filteredRecords = [];
    if (filter === "all") {
        filteredRecords = encounters;
    }
    else if (filter === "leads") {
        filteredRecords = leads;
    }
    else if (filter === "closes") {
        filteredRecords = closes;
    }
    else if (filter === "objections") {
        filteredRecords = encounters.filter(function (e) { return e.status === "objected"; });
    }
    var filteredRecordsWithSearch = filteredRecords.filter(function (record) {
        var _a, _b;
        return ((_a = record.parent_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) ||
            ((_b = record.parent_email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase()));
    });
    var stats = [
        { label: "All Encounters", value: typeof (breakdown === null || breakdown === void 0 ? void 0 : breakdown.all) === 'number' ? breakdown.all : 0, filter: "all" },
        { label: "Leads", value: typeof (breakdown === null || breakdown === void 0 ? void 0 : breakdown.leads) === 'number' ? breakdown.leads : 0, filter: "leads" },
        { label: "Closes", value: typeof (breakdown === null || breakdown === void 0 ? void 0 : breakdown.closes) === 'number' ? breakdown.closes : 0, filter: "closes" },
        { label: "Objections", value: typeof (breakdown === null || breakdown === void 0 ? void 0 : breakdown.objections) === 'number' ? breakdown.objections : 0, filter: "objections" },
    ];
    return (<DashboardLayout>
      <div className="space-y-4 sm:space-y-8">
        {/* Welcome Hero */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">Tracking</h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Monitor every parent you've met and track their journey to becoming a lead or close.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {stats.map(function (stat) {
            var displayValue = typeof stat.value === 'number' ? String(stat.value) : '0';
            return (<Button key={stat.filter} variant={filter === stat.filter ? "default" : "outline"} onClick={function () { return setFilter(stat.filter); }} size="sm" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 h-auto">
                <span className="hidden sm:inline">{stat.label}</span>
                <span className="sm:hidden">{stat.label.split(' ').pop()}</span>
                <span className="ml-1 sm:ml-2 font-bold">{displayValue}</span>
              </Button>);
        })}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground"/>
            <Input placeholder="Search by parent name or email..." value={search} onChange={function (e) { return setSearch(e.target.value); }} className="pl-9 sm:pl-10 py-4 sm:py-6 text-sm sm:text-base"/>
          </div>
        </div>

        {/* Encounters List */}
        <div className="space-y-2 sm:space-y-3">
          {filteredRecordsWithSearch.length === 0 ? (<Card className="p-6 sm:p-12 text-center">
              <p className="text-sm sm:text-lg text-muted-foreground">
                {filter === "all" ? "No encounters found" :
                filter === "leads" ? "No leads found" :
                    filter === "closes" ? "No closes found" :
                        "No objections found"}
              </p>
            </Card>) : (filteredRecordsWithSearch.map(function (record) { return (<Card key={record.id} className="p-3 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 space-y-2 sm:space-y-3">
                    {/* Parent Info */}
                    <div className="flex justify-between items-start sm:block">
                      <div>
                        <h3 className="font-bold text-sm sm:text-lg">{record.parent_name}</h3>
                        <div className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1 mt-1 sm:mt-2">
                          {record.parent_email && <p className="truncate max-w-[200px] sm:max-w-none">📧 {record.parent_email}</p>}
                          {record.parent_phone && <p>📱 {record.parent_phone}</p>}
                        </div>
                      </div>
                      {/* Mobile Status Badge */}
                      <div className="sm:hidden">
                        <span className={"text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ".concat(filter === "objections"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : filter === "closes"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : filter === "leads"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200")}>
                          {filter === "objections" ? "❌" : filter === "closes" ? "✅" : filter === "leads" ? "📊" : "🎯"}
                        </span>
                      </div>
                    </div>

                    {/* Child Info */}
                    {record.child_name && (<div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">Child Information</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">👤 {record.child_name} {record.child_grade ? "(Grade ".concat(record.child_grade, ")") : ""}</p>
                      </div>)}

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      {record.date_met && (<div>
                          <p className="font-semibold text-foreground">Date Met</p>
                          <p className="text-muted-foreground">{new Date(record.date_met).toLocaleDateString()}</p>
                        </div>)}
                      {record.contact_method && (<div>
                          <p className="font-semibold text-foreground">Contact Method</p>
                          <p className="text-muted-foreground capitalize">{record.contact_method}</p>
                        </div>)}
                      {record.discovery_outcome && (<div>
                          <p className="font-semibold text-foreground">Discovery Outcome</p>
                          <p className="text-muted-foreground">{record.discovery_outcome}</p>
                        </div>)}
                      {record.final_outcome && (<div>
                          <p className="font-semibold text-foreground">Final Outcome</p>
                          <p className="text-muted-foreground">{record.final_outcome}</p>
                        </div>)}
                    </div>

                    {/* Notes */}
                    {record.notes && (<div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">Notes</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{record.notes}</p>
                      </div>)}

                    {/* Confidence Rating */}
                    {record.confidence_rating && (<div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">Confidence Rating</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(function (i) { return (<div key={i} className={"w-3 h-3 sm:w-4 sm:h-4 rounded-full ".concat(i <= record.confidence_rating ? "bg-yellow-400" : "bg-gray-300")}/>); })}
                          <span className="text-xs sm:text-sm text-muted-foreground ml-2">{record.confidence_rating}/5</span>
                        </div>
                      </div>)}
                  </div>

                  {/* Desktop Status Badge */}
                  <div className="hidden sm:flex text-right flex-col gap-3">
                    <span className={"text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap ".concat(filter === "objections"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : filter === "closes"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : filter === "leads"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200")}>
                      {filter === "objections" ? "❌ Objection" : filter === "closes" ? "✅ Close" : filter === "leads" ? "📊 Lead" : "🎯 Encounter"}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>); }))}
        </div>
      </div>
    </DashboardLayout>);
}
