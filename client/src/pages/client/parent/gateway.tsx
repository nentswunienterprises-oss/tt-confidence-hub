import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, ArrowLeft, Check } from "lucide-react";
import { TTLogo } from "@/components/TTLogo";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import ProposalView from "@/components/parent/ProposalView";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns/format";
import { supabase } from "@/lib/supabaseClient";

interface EnrollmentStatus {
  status: "not_enrolled" | "awaiting_assignment" | "awaiting_tutor_acceptance" | "assigned" | "proposal_sent" | "session_booked" | "report_received" | "confirmed";
  step?: string;
}

export default function ParentGateway() {
  const [justBooked, setJustBooked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState<"enrollment" | "submitted" | "loading" | "awaiting_tutor_acceptance">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingProposal, setIsProcessingProposal] = useState(false);
  const [parentCode, setParentCode] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [proposedDate, setProposedDate] = useState<Date | undefined>(undefined);
  const [proposedTime, setProposedTime] = useState<string>("");
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const justSubmittedRef = useRef(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  // Fetch current user data
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch enrollment status
  const { data: enrollmentStatus } = useQuery<EnrollmentStatus>({
    queryKey: ["/api/parent/enrollment-status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Fetch assigned tutor if status is assigned
  const { data: assignedTutor } = useQuery<any>({
    queryKey: ["/api/parent/assigned-tutor"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && (enrollmentStatus?.status === "assigned" || enrollmentStatus?.status === "proposal_sent"),
  });

  // Fetch intro session confirmation if status is assigned or awaiting_assignment
  const {
    data: introSessionConfirmation,
    refetch: refetchIntroSessionConfirmation,
  } = useQuery<any>({
    queryKey: ["/api/parent/intro-session-confirmation"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && (enrollmentStatus?.status === "assigned" || enrollmentStatus?.status === "awaiting_assignment"),
    refetchInterval: 10000, // Poll every 10s for status updates
  });

  // Fetch proposal if available
  const { data: proposal, isLoading: proposalLoading, error: proposalError } = useQuery<any>({
    queryKey: ["/api/parent/proposal"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const response = await fetch(`${API_URL}/api/parent/proposal`, {
        credentials: "include",
        headers,
      });
      if (response.status === 404) {
        console.log("📋 No proposal found (404)");
        return null;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch proposal:", response.status, errorData);
        throw new Error(errorData.message || "Failed to fetch proposal");
      }
      const data = await response.json();
      console.log("📋 Proposal received:", data);
      if (data.parentCode) {
        setParentCode(data.parentCode);
      }
      return data;
    },
    enabled: !!user && !!enrollmentStatus,
    retry: false, // Don't retry on 404
  });

  // Derive effective parent code from local state or proposal data
  const effectiveParentCode = useMemo(() => {
    return parentCode || proposal?.parentCode || null;
  }, [parentCode, proposal?.parentCode]);

  // Auto-set step based on enrollment status and intro session confirmation
  useEffect(() => {
    // ...existing code for enrollmentStatus
    if (justSubmittedRef.current) return;
    if (!enrollmentStatus) {
      setStep("loading");
    } else if (enrollmentStatus.status === "not_enrolled") {
      setStep("enrollment");
    } else if (
      enrollmentStatus.status === "awaiting_assignment" ||
      enrollmentStatus.status === "assigned" ||
      enrollmentStatus.status === "proposal_sent" ||
      enrollmentStatus.status === "session_booked" ||
      enrollmentStatus.status === "report_received" ||
      enrollmentStatus.status === "confirmed"
    ) {
      setStep("submitted");
    } else if (enrollmentStatus.status === "awaiting_tutor_acceptance") {
      setStep("awaiting_tutor_acceptance");
    }
  }, [enrollmentStatus, navigate]);

  // Initialize form with user data
  const [formData, setFormData] = useState({
    parentFullName: "",
    parentPhone: "",
    parentEmail: "",
    parentCity: "",
    studentFullName: "",
    studentGrade: "",
    schoolName: "",
    stuckAreas: [] as string[],
    mathStruggleAreas: "",
    previousTutoring: "",
    confidenceLevel: "",
    internetAccess: "",
    parentMotivation: "",
    processAlignment: "",
    agreedToTerms: false,
  });

  // Auto-fill parent name and email from user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        parentEmail: user.email || prev.parentEmail,
        parentFullName: user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}`.trim() : prev.parentFullName),
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.parentFullName &&
      formData.parentPhone &&
      formData.parentEmail &&
      formData.parentCity &&
      formData.studentFullName &&
      formData.studentGrade &&
      formData.schoolName &&
      formData.mathStruggleAreas &&
      formData.previousTutoring &&
      formData.confidenceLevel &&
      formData.internetAccess &&
      formData.agreedToTerms
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const response = await fetch(`${API_URL}/api/parent/enroll`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to submit enrollment");
      }

      // Set flag to prevent useEffect from overriding step
      justSubmittedRef.current = true;

      // Invalidate the enrollment status query so it refetches with the new status
      await queryClient.invalidateQueries({ queryKey: ["/api/parent/enrollment-status"] });

      toast({
        title: "Application Received",
        description: "We'll assess fit and respond within 48 hours.",
      });
      setStep("submitted");
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Error",
        description: "Failed to submit enrollment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAcceptProposal = async () => {
    setIsProcessingProposal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const response = await fetch(`${API_URL}/api/parent/proposal/accept`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to accept proposal" }));
        throw new Error(err.message || "Failed to accept proposal");
      }

      const data = await response.json();
      
      // Store the parent code
      if (data.parentCode) {
        setParentCode(data.parentCode);
      }

      toast({
        title: "Proposal Accepted!",
        description: "Great! Your student code has been generated.",
      });

      // Refresh enrollment status
      queryClient.invalidateQueries({ queryKey: ["/api/parent/enrollment-status"] });
    } catch (error) {
      console.error("Error accepting proposal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleDeclineProposal = async () => {
    setIsProcessingProposal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const response = await fetch(`${API_URL}/api/parent/proposal/decline`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          reason: "Parent declined proposal", // Could add a dialog to collect reason
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to decline proposal" }));
        throw new Error(err.message || "Failed to decline proposal");
      }

      toast({
        title: "Proposal Declined",
        description: "We'll look for another tutor match.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/parent/enrollment-status"] });
    } catch (error) {
      console.error("Error declining proposal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to decline proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleProposeIntroSession = async () => {
    if (!proposedDate || !proposedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both a date and time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingSession(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const response = await fetch(`${API_URL}/api/parent/intro-session/propose`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          proposedDate: format(proposedDate, "yyyy-MM-dd"),
          proposedTime,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to propose session");
      }

      toast({
        title: "Session Proposed",
        description: "Your tutor will confirm the time shortly.",
      });

      setIsBookingDialogOpen(false);
      setProposedDate(undefined);
      setProposedTime("");

      setJustBooked(true);

      // Force refetch intro session confirmation immediately after booking
      await refetchIntroSessionConfirmation();
    } catch (error) {
      console.error("Error proposing session:", error);
      toast({
        title: "Error",
        description: "Failed to propose session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSession(false);
    }
  };
  // Reset justBooked if status is still not_scheduled (e.g. booking failed or was reset)
  useEffect(() => {
    if (justBooked && introSessionConfirmation?.status === "not_scheduled") {
      setTimeout(() => setJustBooked(false), 2000); // Add a short delay to avoid flicker
    }
  }, [introSessionConfirmation?.status, justBooked]);

  const handleDebugAuthInfo = async () => {
    setLoadingDebug(true);
    setDebugError(null);
    setDebugInfo(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const res = await fetch("https://tt-confidence-hub-api.onrender.com/api/debug/auth-info", {
        method: "GET",
        headers,
        credentials: "include"
      });
      const json = await res.json();
      setDebugInfo(json);
    } catch (e: any) {
      setDebugError(e.message || "Unknown error");
    } finally {
      setLoadingDebug(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Awaiting Tutor Acceptance State */}
      {step === "awaiting_tutor_acceptance" && (
        <Card className="text-center border-0 shadow-lg my-8" style={{ backgroundColor: "white" }}>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center justify-center gap-2 text-sm sm:text-lg" style={{ color: "#E63946" }}>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#E63946" }} />
              Tutor Assignment Pending Acceptance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-900">Your tutor has been assigned and is reviewing this assignment.</p>
              <p className="text-sm text-yellow-700 mt-2">
                Intro session booking will unlock once your tutor accepts the assignment. Please check back soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      // ...existing code...

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TTLogo size="md" />
          </div>
          
          <div className="hidden md:block">
            <span className="text-xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              Cohort Application
            </span>
          </div>
          
          <Button
            variant="ghost"
            className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            style={{ color: "#1A1A1A" }}
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Journey Status Bar */}
      <div style={{ backgroundColor: "#FFF0F0" }}>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex justify-center">
          <div className="flex items-center justify-between w-full max-w-2xl overflow-x-auto">
            {[
              { label: "Applied", status: step === "enrollment" || step === "submitted" },
              { label: "Review", status: enrollmentStatus?.status === "awaiting_assignment" || enrollmentStatus?.status === "assigned" || enrollmentStatus?.status === "proposal_sent" || enrollmentStatus?.status === "session_booked" || enrollmentStatus?.status === "report_received" || enrollmentStatus?.status === "confirmed" },
              { label: "Assigned", status: enrollmentStatus?.status === "assigned" || enrollmentStatus?.status === "proposal_sent" || enrollmentStatus?.status === "session_booked" || enrollmentStatus?.status === "report_received" || enrollmentStatus?.status === "confirmed" },
              { label: "Active", status: enrollmentStatus?.status === "confirmed" },
            ].map((item, idx, arr) => (
              <div key={item.label} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition"
                    style={{
                      backgroundColor: item.status ? "#E63946" : "transparent",
                      borderColor: item.status ? "#E63946" : "#D1D5DB",
                      color: item.status ? "white" : "#9CA3AF"
                    }}
                  >
                    {item.status ? (
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center" style={{ color: "#1A1A1A" }}>{item.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1 sm:mx-2 transition min-w-[12px]"
                    style={{ backgroundColor: item.status ? "#E63946" : "#E5E5E5" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        {/* Enrollment Form */}
        {step === "enrollment" && (
          <Card className="border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl" style={{ color: "#1A1A1A" }}>Application Form</CardTitle>
              <CardDescription className="text-sm" style={{ color: "#5A5A5A" }}>
                Territorial Tutoring - Founding Cohort Application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
              {/* Introduction */}
              <div className="rounded-xl p-4 sm:p-5 space-y-2 sm:space-y-3" style={{ backgroundColor: "#FFF0F0" }}>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: "#E63946" }}>"We train how students respond when certainty disappears."</h3>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  This is the Founding Cohort. Limited families. Serious about response training.
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                  TT is not tutoring. It's a performance-conditioning system. Every application is reviewed to ensure fit. This application helps us determine whether our training is appropriate for your child.
                </p>
              </div>

              {/* Parent Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Parent / Guardian Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Full Name *</label>
                    <Input
                      className="text-sm sm:text-base"
                      placeholder="Your full name"
                      value={formData.parentFullName}
                      onChange={(e) => handleInputChange("parentFullName", e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Phone Number (+27) *</label>
                    <Input
                      className="text-sm sm:text-base"
                      placeholder="+27 71 234 5678"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Email Address *</label>
                    <Input
                      className="text-sm sm:text-base"
                      placeholder="your@email.com"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">City / Suburb *</label>
                    <Input
                      className="text-sm sm:text-base"
                      placeholder="Your city"
                      value={formData.parentCity}
                      onChange={(e) => handleInputChange("parentCity", e.target.value)}
                      autoComplete="address-level2"
                    />
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Student Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Student's Full Name *</label>
                    <Input
                      className="text-sm sm:text-base"
                      placeholder="Student's name"
                      value={formData.studentFullName}
                      onChange={(e) => handleInputChange("studentFullName", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>Grade in 2026 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Grade 6", "Grade 7"].map((grade) => (
                        <button
                          key={grade}
                          onClick={() => handleInputChange("studentGrade", grade)}
                          className="px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition"
                          style={{
                            backgroundColor: formData.studentGrade === grade ? "#E63946" : "transparent",
                            color: formData.studentGrade === grade ? "white" : "#1A1A1A",
                            borderColor: formData.studentGrade === grade ? "#E63946" : "#E5E5E5"
                          }}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">School Name *</label>
                    <Input
                      className="text-sm sm:text-base"
                      placeholder="School name"
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange("schoolName", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>Where does your child most often get stuck in math?</label>
                    <div className="space-y-2">
                      {[
                        { value: "word_problems", label: "Word problems" },
                        { value: "tests", label: "Tests" },
                        { value: "timed_work", label: "Timed work" },
                        { value: "new_topics", label: "New topics" },
                        { value: "careless_errors", label: "Careless errors" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const currentAreas = formData.stuckAreas || [];
                            const newAreas = currentAreas.includes(option.value)
                              ? currentAreas.filter(a => a !== option.value)
                              : [...currentAreas, option.value];
                            handleInputChange("stuckAreas", newAreas);
                          }}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition flex items-center gap-2"
                          style={{
                            backgroundColor: (formData.stuckAreas || []).includes(option.value) ? "#E63946" : "#FFF0F0",
                            color: (formData.stuckAreas || []).includes(option.value) ? "white" : "#1A1A1A",
                            borderColor: (formData.stuckAreas || []).includes(option.value) ? "#E63946" : "#FFF0F0"
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: (formData.stuckAreas || []).includes(option.value) ? "white" : "#E5E5E5",
                              backgroundColor: (formData.stuckAreas || []).includes(option.value) ? "white" : "transparent"
                            }}
                          >
                            {(formData.stuckAreas || []).includes(option.value) && (
                              <Check className="w-3 h-3" style={{ color: "#E63946" }} />
                            )}
                          </div>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">What specific math areas does your child struggle with most? *</label>
                    <Input
                      className="text-sm sm:text-base"
                      placeholder="e.g., Algebra, Fractions, Problem Solving..."
                      value={formData.mathStruggleAreas}
                      onChange={(e) => handleInputChange("mathStruggleAreas", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              {/* Background Questions */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Background</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Has your child ever received tutoring before? *</label>
                    <div className="space-y-2">
                      {[
                        { value: "formal", label: "Yes - formal paid tutoring" },
                        { value: "informal", label: "Yes - informal help from friends/family" },
                        { value: "no", label: "No - this will be their first time" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("previousTutoring", option.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition"
                          style={{
                            backgroundColor: formData.previousTutoring === option.value ? "#E63946" : "#FFF0F0",
                            color: formData.previousTutoring === option.value ? "white" : "#1A1A1A",
                            borderColor: formData.previousTutoring === option.value ? "#E63946" : "#FFF0F0"
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">When your child hits uncertainty in math, what happens? *</label>
                    <div className="space-y-2">
                      {[
                        { value: "very_low", label: "They freeze - can't proceed without help" },
                        { value: "low", label: "They rush or guess - emotion hijacks thinking" },
                        { value: "average", label: "They try but break under time pressure" },
                        { value: "high", label: "They execute a trained response and stay calm" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("confidenceLevel", option.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition"
                          style={{
                            backgroundColor: formData.confidenceLevel === option.value ? "#E63946" : "#FFF0F0",
                            color: formData.confidenceLevel === option.value ? "white" : "#1A1A1A",
                            borderColor: formData.confidenceLevel === option.value ? "#E63946" : "#FFF0F0"
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Does your child have access to stable internet and a device for online sessions? *</label>
                    <div className="space-y-2">
                      {[
                        { value: "always", label: "Yes, always" },
                        { value: "sometimes", label: "Sometimes" },
                        { value: "no", label: "No" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("internetAccess", option.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition"
                          style={{
                            backgroundColor: formData.internetAccess === option.value ? "#E63946" : "#FFF0F0",
                            color: formData.internetAccess === option.value ? "white" : "#1A1A1A",
                            borderColor: formData.internetAccess === option.value ? "#E63946" : "#FFF0F0"
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Alignment */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm uppercase tracking-wide" style={{ color: "#E63946" }}>Process Alignment (Required)</h4>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>Are you willing to allow sessions without encouragement, reassurance, or emotional coaching? *</label>
                  <div className="space-y-2">
                    {[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("processAlignment", option.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm text-left transition"
                        style={{
                          backgroundColor: formData.processAlignment === option.value ? "#E63946" : "#FFF0F0",
                          color: formData.processAlignment === option.value ? "white" : "#1A1A1A",
                          borderColor: formData.processAlignment === option.value ? "#E63946" : "#FFF0F0"
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parent Agreement */}
              <div className="space-y-3 rounded-xl p-4 sm:p-5" style={{ backgroundColor: "#FFF0F0" }}>
                <h4 className="font-semibold text-xs sm:text-sm" style={{ color: "#1A1A1A" }}>Parent Agreement *</h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  {[
                    "I understand placement in the Founding Cohort is limited and not guaranteed.",
                    "I consent for my child to participate in TT's response-conditioning system.",
                    "I'll support my child's attendance, communication, and progress.",
                    "I understand TT may use anonymized results or testimonials for success case studies.",
                    "I understand the program structure and commitment expectations.",
                  ].map((agreement, idx) => (
                    <div key={idx} className="flex gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" style={{ color: "#E63946" }} />
                      <span style={{ color: "#5A5A5A" }}>{agreement}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleInputChange("agreedToTerms", !formData.agreedToTerms)}
                  className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer"
                  style={{ color: "#1A1A1A" }}
                >
                  <div 
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: formData.agreedToTerms ? "#E63946" : "#E5E5E5",
                      backgroundColor: formData.agreedToTerms ? "#E63946" : "white"
                    }}
                  >
                    {formData.agreedToTerms && <Check className="w-3 h-3 text-white" />}
                  </div>
                  I agree to the above terms
                </button>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="w-full rounded-full font-semibold text-sm sm:text-base"
                size="lg"
                style={{ backgroundColor: "#E63946", color: "white" }}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>

              <p className="text-[10px] sm:text-xs text-center" style={{ color: "#5A5A5A" }}>
                Limited spots available. All applications are reviewed individually.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submitted Confirmation */}
        {step === "submitted" && enrollmentStatus && (
          <Card className="text-center border-0 shadow-lg" style={{ backgroundColor: "white" }}>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center justify-center gap-2 text-sm sm:text-lg" style={{ color: "#1A1A1A" }}>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#E63946" }} />
                {enrollmentStatus.status === "awaiting_assignment" && "Application Being Assessed"}
                {enrollmentStatus.status === "assigned" && "Your tutor has been assigned"}
                {enrollmentStatus.status === "proposal_sent" && "Training Proposal Ready"}
                {enrollmentStatus.status === "session_booked" && "Proposal Accepted"}
                {enrollmentStatus.status === "report_received" && "Awaiting Report"}
                {enrollmentStatus.status === "confirmed" && "Active"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentStatus.status === "awaiting_assignment" && (
                <>
                  <p className="text-muted-foreground">
                    Application received. We're assessing fit.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We match each student with the right tutor. Response within 48 hours.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 text-left">
                    <p className="text-sm font-medium mb-2">What happens next:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>We assess your application</li>
                      <li>If accepted, we assign a tutor</li>
                      <li>You receive a training proposal</li>
                      <li>Review it. Accept or decline.</li>
                    </ul>
                  </div>
                </>
              )}
              {enrollmentStatus.status === "assigned" && (
                <>
                  {/* Always show assigned tutor info when assigned */}
                  {assignedTutor && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        {assignedTutor.profile_image_url ? (
                          <img 
                            src={assignedTutor.profile_image_url} 
                            alt={assignedTutor.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg">{assignedTutor.name}</h3>
                          {assignedTutor.bio && (
                            <p className="text-sm text-red-900 mt-1">{assignedTutor.bio}</p>
                          )}
                          {assignedTutor.email && (
                            <p className="mt-2 text-sm text-red-900">
                              <span className="font-medium">Email:</span> {assignedTutor.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Always show 'tutor assigned' message */}
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium text-yellow-900">Your tutor has been assigned.</p>
                    <p className="text-sm text-yellow-700 mt-2">
                      Book your intro session below once ready.
                    </p>
                  </div>

                  {/* Show session status if present */}
                  {introSessionConfirmation?.status === "pending_tutor_confirmation" && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-red-400/30 border-t-red-600 rounded-full animate-spin flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-900">Waiting for tutor confirmation</p>
                          {introSessionConfirmation.scheduled_time && (
                            <p className="text-xs text-red-700 mt-1">Proposed time: {new Date(introSessionConfirmation.scheduled_time).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {introSessionConfirmation?.status === "pending_parent_confirmation" && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-yellow-400/30 border-t-yellow-600 rounded-full animate-spin flex-shrink-0" />
                        <div>
                          <p className="font-medium text-yellow-900">Tutor proposed a new time. Please confirm.</p>
                          {introSessionConfirmation.scheduled_time && (
                            <p className="text-xs text-yellow-700 mt-1">Proposed time: {new Date(introSessionConfirmation.scheduled_time).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      {/* TODO: Add confirm/decline buttons for parent to respond to new time */}
                    </div>
                  )}
                  {introSessionConfirmation?.status === "confirmed" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      {introSessionConfirmation.introCompleted ? (
                        <>
                          <p className="font-medium text-green-900">Your introductory session has been conducted</p>
                          <p className="text-sm text-green-700 mt-2">
                            Tutor is now preparing your training proposal. You'll see it here once it has been sent.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-green-900">Your session has been confirmed</p>
                          {introSessionConfirmation.scheduled_time && (
                            <p className="text-sm text-green-700 mt-2">Scheduled for: {new Date(introSessionConfirmation.scheduled_time).toLocaleString()}</p>
                          )}
                          <p className="text-sm text-green-700 mt-2">You will receive an introductory report and proposal here after you've had your intro session</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Only show booking button if not_scheduled */}
                  {introSessionConfirmation?.status === "not_scheduled" && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-900 mb-4">Schedule your introductory session</p>
                      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            style={{ backgroundColor: '#E63946', color: 'white' }}
                            className="w-full"
                            disabled={isSubmittingSession || justBooked || introSessionConfirmation?.status !== "not_scheduled"}
                            title={
                              introSessionConfirmation?.status !== "not_scheduled"
                                ? "Tutor must accept assignment before booking."
                                : undefined
                            }
                          >
                            Book Introductory Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Propose Session Time</DialogTitle>
                            <DialogDescription>
                              Select a date and time for your introductory session with {assignedTutor?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Date</label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left">
                                    {proposedDate ? format(proposedDate, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={proposedDate}
                                    onSelect={setProposedDate}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Time</label>
                              <Input
                                type="time"
                                value={proposedTime}
                                onChange={(e) => setProposedTime(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <Button
                              onClick={handleProposeIntroSession}
                              disabled={isSubmittingSession || justBooked || introSessionConfirmation?.status !== "not_scheduled"}
                              className="w-full"
                            >
                              {isSubmittingSession ? "Proposing..." : "Propose Time"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </>
              )}
              {enrollmentStatus.status === "proposal_sent" && (
                <>
                  <p className="text-muted-foreground mb-4">
                    Your training proposal is ready.
                  </p>
                  
                  {(() => {
                    console.log("📋 Proposal status - Loading:", proposalLoading, "Error:", proposalError, "Data:", proposal);
                    
                    if (proposalLoading) {
                      return (
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Loading your proposal...</p>
                        </div>
                      );
                    }
                    
                    if (proposalError) {
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-red-600">Failed to load proposal. Please refresh the page.</p>
                          <p className="text-xs text-red-500 mt-2">{proposalError.message}</p>
                        </div>
                      );
                    }
                    
                    if (proposal) {
                      console.log("📋 Rendering ProposalView with:", proposal);
                      return (
                        <ProposalView 
                          proposal={proposal} 
                          showActions={true}
                          onAccept={handleAcceptProposal}
                          onDecline={handleDeclineProposal}
                          isProcessing={isProcessingProposal}
                        />
                      );
                    }
                    
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-yellow-600">Proposal is being prepared. Check back soon.</p>
                      </div>
                    );
                  })()}
                </>
              )}
              {(enrollmentStatus.status === "session_booked" || enrollmentStatus.status === "report_received" || enrollmentStatus.status === "confirmed") && (
                <>
                  {proposalLoading && !effectiveParentCode ? (
                    <div className="bg-muted/30 rounded-lg p-4 text-center mb-4 sm:mb-6">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Loading your student access code...</p>
                    </div>
                  ) : effectiveParentCode ? (
                    <Card className="border-2 border-primary mb-4 sm:mb-6">
                      <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-xl">Student Access Code</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Give this to your child. They'll use it to create their account.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-6 rounded-lg text-center">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Student Code</p>
                          <div className="text-2xl sm:text-4xl font-bold tracking-wider text-primary mb-3 sm:mb-4">
                            {effectiveParentCode}
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(effectiveParentCode);
                              toast({
                                title: "Copied",
                                description: "Code copied",
                              });
                            }}
                            className="gap-2 text-xs sm:text-sm"
                          >
                            Copy Code
                          </Button>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                          <h4 className="font-semibold text-xs sm:text-sm mb-2">What happens next:</h4>
                          <ol className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2">
                            <li>1. Give this code to your child</li>
                            <li>2. They visit the student portal</li>
                            <li>3. They enter this code during account creation</li>
                          </ol>
                        </div>
                        <Button
                          onClick={() => navigate("/client/parent/dashboard")}
                          className="w-full"
                          size="lg"
                        >
                          Continue to Dashboard
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-2 border-primary mb-4 sm:mb-6">
                      <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-xl">Generate Student Code</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Create your child's access code
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                            Proposal accepted. Generate a code for your child to create their account.
                          </p>
                          <Button
                            onClick={async () => {
                              try {
                                const { data: { session } } = await supabase.auth.getSession();
                                const headers: HeadersInit = { "Content-Type": "application/json" };
                                if (session?.access_token) {
                                  headers["Authorization"] = `Bearer ${session.access_token}`;
                                }
                                const response = await fetch(`${API_URL}/api/parent/generate-student-code`, {
                                  method: "POST",
                                  headers,
                                  credentials: "include",
                                });
                                const data = await response.json();
                                if (response.ok && data.parentCode) {
                                  setParentCode(data.parentCode);
                                  toast({
                                    title: "Code Generated!",
                                    description: "Your student access code is ready.",
                                  });
                                } else {
                                  throw new Error(data.message || "Failed to generate code");
                                }
                              } catch (error: any) {
                                console.error("❌ Error generating code:", error);
                                toast({
                                  title: "Error",
                                  description: error.message || "Failed to generate student code. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="w-full"
                            size="lg"
                          >
                            Generate Student Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {step === "loading" && (
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Loading your enrollment status...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
