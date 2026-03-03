import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Users, Calendar, MapPin, Phone, Mail, Plus, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
export default function ODEncounters() {
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    // Fetch encounters data
    var _c = useQuery({
        queryKey: ["/api/od/encounters"],
        enabled: isAuthenticated && !authLoading,
    }), _d = _c.data, encounters = _d === void 0 ? [] : _d, dataLoading = _c.isLoading, dataError = _c.error;
    useEffect(function () {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [isAuthenticated, authLoading, toast]);
    useEffect(function () {
        if (dataError && isUnauthorizedError(dataError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [dataError, toast]);
    if (authLoading || dataLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48"/>
          <Skeleton className="h-12 w-full"/>
          <div className="space-y-4">
            <Skeleton className="h-24"/>
            <Skeleton className="h-24"/>
            <Skeleton className="h-24"/>
          </div>
        </div>
      </DashboardLayout>);
    }
    var filteredEncounters = encounters.filter(function (encounter) {
        var _a;
        return encounter.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ((_a = encounter.parentEmail) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    var getStatusColor = function (status) {
        switch (status) {
            case "new":
                return "bg-blue-100 text-blue-700";
            case "contacted":
                return "bg-yellow-100 text-yellow-700";
            case "converted":
                return "bg-green-100 text-green-700";
            case "lost":
                return "bg-gray-100 text-gray-500";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Encounters</h1>
            <p className="text-muted-foreground mt-1">
              Manage all parent encounters logged by your affiliates
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4"/>
            Log Encounter
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input placeholder="Search encounters..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="pl-10"/>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-2xl font-bold">{encounters.length}</p>
            <p className="text-sm text-muted-foreground">Total Encounters</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-blue-600">
              {encounters.filter(function (e) { return e.status === "new"; }).length}
            </p>
            <p className="text-sm text-muted-foreground">New</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-yellow-600">
              {encounters.filter(function (e) { return e.status === "contacted"; }).length}
            </p>
            <p className="text-sm text-muted-foreground">Contacted</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-green-600">
              {encounters.filter(function (e) { return e.status === "converted"; }).length}
            </p>
            <p className="text-sm text-muted-foreground">Converted</p>
          </Card>
        </div>

        {/* Encounters List */}
        {filteredEncounters.length > 0 ? (<div className="space-y-3">
            {filteredEncounters.map(function (encounter) { return (<Card key={encounter.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{encounter.parentName}</h3>
                      <Badge className={getStatusColor(encounter.status)}>
                        {encounter.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {encounter.parentEmail && (<div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5"/>
                          <span className="truncate">{encounter.parentEmail}</span>
                        </div>)}
                      {encounter.parentPhone && (<div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5"/>
                          <span>{encounter.parentPhone}</span>
                        </div>)}
                      {encounter.location && (<div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5"/>
                          <span className="truncate">{encounter.location}</span>
                        </div>)}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5"/>
                        <span>{format(new Date(encounter.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>); })}
          </div>) : (<Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
            <h3 className="text-lg font-semibold mb-2">No Encounters Yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No encounters match your search."
                : "Encounters logged by affiliates will appear here."}
            </p>
          </Card>)}
      </div>
    </DashboardLayout>);
}
