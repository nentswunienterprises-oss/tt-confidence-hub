import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft } from "lucide-react";

interface Pod {
  id: string;
  podName: string;
  podType: string;
  status: string;
  tdId?: string;
}

interface TutorAssignment {
  id: string;
  tutorId: string;
  podId: string;
  studentCount: number;
  certificationStatus: string;
  tutorName?: string;
  tutorEmail?: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImageUrl?: string;
  verified: boolean;
}

interface AssignTutorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  onAssigned: () => void;
}

export default function AssignTutorModal({
  open,
  onOpenChange,
  enrollmentId,
  onAssigned,
}: AssignTutorModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState<"pods" | "tutors" | "profile">("pods");
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorAssignment | null>(null);
  const [selectedTutorProfile, setSelectedTutorProfile] = useState<Tutor | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch active pods created by COO
  const { data: pods = [], isLoading: podsLoading } = useQuery<Pod[]>({
    queryKey: ["/api/hr/active-pods"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user && open && step === "pods",
  });

  const activePods = pods;

  // Fetch tutors for selected pod
  const { data: tutors = [], isLoading: tutorsLoading } = useQuery<TutorAssignment[]>({
    queryKey: [`/api/hr/pods/${selectedPod?.id}/tutors`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!selectedPod,
  });

  // Fetch full tutor profile when tutor is selected
  useEffect(() => {
    if (selectedTutor && step === "profile") {
      // Extract tutor details from the assignment
      const fetchTutorProfile = async () => {
        try {
          const response = await fetch(
            `/api/tutors/${selectedTutor.tutorId}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
          const profile = await response.json();
          setSelectedTutorProfile(profile);
        } catch (error) {
          console.error("Error fetching tutor profile:", error);
        }
      };
      fetchTutorProfile();
    }
  }, [selectedTutor, step]);

  const handlePodSelect = (pod: Pod) => {
    setSelectedPod(pod);
    setStep("tutors");
  };

  const handleTutorSelect = (tutor: TutorAssignment) => {
    setSelectedTutor(tutor);
    setStep("profile");
  };

  const handleAssignTutor = async () => {
    if (!selectedTutor || !enrollmentId) return;

    setIsAssigning(true);
    try {
      const response = await fetch(
        `/api/hr/enrollments/${enrollmentId}/assign-tutor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tutorId: selectedTutor.tutorId,
            podId: selectedPod?.id,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        onAssigned();
        onOpenChange(false);
        // Reset state
        setStep("pods");
        setSelectedPod(null);
        setSelectedTutor(null);
        setSelectedTutorProfile(null);
      } else {
        console.error("Failed to assign tutor:", response.statusText);
      }
    } catch (error) {
      console.error("Error assigning tutor:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Tutor to Parent</DialogTitle>
          <DialogDescription>
            Select a pod, then a tutor to assign to this parent enrollment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Select Pod */}
          {step === "pods" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Select a Pod (Active)</h3>
              {podsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : activePods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active pods available</p>
              ) : (
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {activePods.map((pod: Pod) => (
                    <Card
                      key={pod.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handlePodSelect(pod)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{pod.podName}</p>
                            <p className="text-xs text-muted-foreground">
                              Type: {pod.podType} • Status: {pod.status}
                            </p>
                          </div>
                          <Badge variant="secondary">{pod.podType}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Tutor */}
          {step === "tutors" && selectedPod && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setStep("pods");
                    setSelectedPod(null);
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Pods
                </button>
              </div>

              <h3 className="font-semibold text-sm">
                Tutors in {selectedPod.podName}
              </h3>

              {tutorsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : tutors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tutors assigned to this pod yet
                </p>
              ) : (
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {tutors.map((tutor: TutorAssignment) => (
                    <Card
                      key={tutor.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleTutorSelect(tutor)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {tutor.tutorName || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tutor.tutorEmail}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Students: {tutor.studentCount} • Certification:{" "}
                              {tutor.certificationStatus}
                            </p>
                          </div>
                          <Badge
                            variant={
                              tutor.certificationStatus === "passed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {tutor.certificationStatus}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: View Tutor Profile and Confirm Assignment */}
          {step === "profile" && selectedTutor && selectedTutorProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setStep("tutors");
                    setSelectedTutor(null);
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Tutors
                </button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedTutorProfile.profileImageUrl} />
                      <AvatarFallback>
                        {selectedTutorProfile.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{selectedTutorProfile.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedTutorProfile.email}
                      </p>
                      {selectedTutorProfile.phone && (
                        <p className="text-sm text-muted-foreground">
                          {selectedTutorProfile.phone}
                        </p>
                      )}
                      <div className="mt-2">
                        <Badge variant={selectedTutorProfile.verified ? "default" : "secondary"}>
                          {selectedTutorProfile.verified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {selectedTutorProfile.bio && (
                  <CardContent className="space-y-2">
                    <h4 className="font-semibold text-sm">Bio</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTutorProfile.bio}
                    </p>
                  </CardContent>
                )}
              </Card>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("tutors");
                    setSelectedTutor(null);
                  }}
                  disabled={isAssigning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTutor}
                  disabled={isAssigning}
                >
                  {isAssigning && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Assign Tutor
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 Loading State */}
          {step === "profile" && selectedTutor && !selectedTutorProfile && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
