import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import ProposalView from "@/components/parent/ProposalView";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";

interface EnrollmentStatus {
  status: "not_enrolled" | "awaiting_assignment" | "assigned" | "proposal_sent" | "session_booked" | "report_received" | "confirmed";
  step?: string;
}

export default function ParentGateway() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState<"enrollment" | "submitted" | "loading">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingProposal, setIsProcessingProposal] = useState(false);
  const [parentCode, setParentCode] = useState<string | null>(null);

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

  // Fetch proposal if available
  const { data: proposal, isLoading: proposalLoading, error: proposalError } = useQuery<any>({
    queryKey: ["/api/parent/proposal"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/parent/proposal`, {
        credentials: "include",
      });
      
      if (response.status === 404) {
        // No proposal yet - this is expected
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
      
      // Set parent code if it exists in the proposal
      if (data.parentCode) {
        setParentCode(data.parentCode);
      }
      
      return data;
    },
    enabled: !!user && !!enrollmentStatus,
    retry: false, // Don't retry on 404
  });

  // Auto-set step based on enrollment status
  useEffect(() => {
    console.log("🔄 [Gateway] Enrollment status effect triggered", {
      hasEnrollmentStatus: !!enrollmentStatus,
      status: enrollmentStatus?.status,
    });
    
    if (!enrollmentStatus) {
      console.log("  → Setting step to 'loading'");
      setStep("loading");
    } else if (enrollmentStatus.status === "not_enrolled") {
      console.log("  → Setting step to 'enrollment'");
      setStep("enrollment");
    } else if (enrollmentStatus.status === "session_booked" || enrollmentStatus.status === "report_received" || enrollmentStatus.status === "confirmed") {
      console.log("  → REDIRECTING to parent dashboard! Status:", enrollmentStatus.status);
      // Redirect to dashboard after proposal accepted
      setStep("loading"); // Show loading during redirect
      navigate("/client/parent/dashboard", { replace: true });
    } else if (enrollmentStatus.status === "awaiting_assignment" || enrollmentStatus.status === "assigned" || enrollmentStatus.status === "proposal_sent") {
      console.log("  → Setting step to 'submitted'");
      setStep("submitted");
    } else {
      console.log("  → Unhandled status:", enrollmentStatus.status);
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
    mathStruggleAreas: "",
    previousTutoring: "",
    confidenceLevel: "",
    internetAccess: "",
    parentMotivation: "",
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

  const handleInputChange = (field: string, value: string | boolean) => {
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
      const response = await fetch(`${API_URL}/api/parent/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit enrollment");
      }

      toast({
        title: "Enrollment Submitted",
        description: "Your application has been submitted. HR will review and assign a tutor shortly.",
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
      const response = await fetch(`${API_URL}/api/parent/proposal/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept proposal");
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
        description: "Failed to accept proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingProposal(false);
    }
  };

  const handleDeclineProposal = async () => {
    setIsProcessingProposal(true);
    try {
      const response = await fetch(`${API_URL}/api/parent/proposal/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Parent declined proposal", // Could add a dialog to collect reason
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline proposal");
      }

      toast({
        title: "Proposal Declined",
        description: "Your tutor has been notified and may send a revised proposal.",
      });

      // Refresh enrollment status
      queryClient.invalidateQueries({ queryKey: ["/api/parent/enrollment-status"] });
    } catch (error) {
      console.error("Error declining proposal:", error);
      toast({
        title: "Error",
        description: "Failed to decline proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingProposal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <h1 className="font-bold text-lg">Confidence Hub Enrollment</h1>
          <p className="text-xs text-muted-foreground">Parent Gateway</p>
        </div>
      </header>

      {/* Journey Status Bar */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-6 flex justify-center">
          <div className="flex items-center justify-between w-full max-w-2xl">
            {[
              { label: "Enrollment", status: step === "enrollment" || step === "submitted" },
              { label: "Pending", status: enrollmentStatus?.status === "awaiting_assignment" || enrollmentStatus?.status === "assigned" || enrollmentStatus?.status === "proposal_sent" || enrollmentStatus?.status === "session_booked" || enrollmentStatus?.status === "report_received" || enrollmentStatus?.status === "confirmed" },
              { label: "Assigned", status: enrollmentStatus?.status === "assigned" || enrollmentStatus?.status === "proposal_sent" || enrollmentStatus?.status === "session_booked" || enrollmentStatus?.status === "report_received" || enrollmentStatus?.status === "confirmed" },
              { label: "Dashboard", status: enrollmentStatus?.status === "confirmed" },
            ].map((item, idx, arr) => (
              <div key={item.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition ${
                      item.status
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {item.status ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs mt-2 font-medium">{item.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition ${
                      item.status ? "bg-primary" : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Enrollment Form */}
        {step === "enrollment" && (
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Form</CardTitle>
              <CardDescription>
                Territorial Tutoring – Confidence Pod Enrollment (Experimental Phase)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Introduction */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">"Confidence isn't a luxury. It's a skill we teach."</h3>
                <p className="text-sm text-muted-foreground">
                  Welcome to Territorial Tutoring's Confidence Project, a national pilot program redefining how students rebuild confidence in mathematics.
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a limited experimental phase where selected students join our structured Confidence Pods - a mentorship-based tutoring model designed and monitored by TT Headquarters.
                </p>
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide">Parent / Guardian Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input
                      placeholder="Your full name"
                      value={formData.parentFullName}
                      onChange={(e) => handleInputChange("parentFullName", e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number (+27) *</label>
                    <Input
                      placeholder="+27 71 234 5678"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address *</label>
                    <Input
                      placeholder="your@email.com"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City / Suburb *</label>
                    <Input
                      placeholder="Your city"
                      value={formData.parentCity}
                      onChange={(e) => handleInputChange("parentCity", e.target.value)}
                      autoComplete="address-level2"
                    />
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide">Student Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Student's Full Name *</label>
                    <Input
                      placeholder="Student's name"
                      value={formData.studentFullName}
                      onChange={(e) => handleInputChange("studentFullName", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Grade in 2025 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Grade 6", "Grade 7", "Grade 8", "Grade 9"].map((grade) => (
                        <button
                          key={grade}
                          onClick={() => handleInputChange("studentGrade", grade)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                            formData.studentGrade === grade
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">School Name *</label>
                    <Input
                      placeholder="School name"
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange("schoolName", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">What specific math areas does your child struggle with most? *</label>
                    <Input
                      placeholder="e.g., Algebra, Fractions, Problem Solving..."
                      value={formData.mathStruggleAreas}
                      onChange={(e) => handleInputChange("mathStruggleAreas", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              {/* Background Questions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide">Background</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Has your child ever received tutoring before? *</label>
                    <div className="space-y-2">
                      {[
                        { value: "formal", label: "Yes – formal paid tutoring" },
                        { value: "informal", label: "Yes – informal help from friends/family" },
                        { value: "no", label: "No – this will be their first time" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("previousTutoring", option.value)}
                          className={`w-full px-4 py-2 rounded-lg border text-sm text-left transition ${
                            formData.previousTutoring === option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">How would you describe your child's current confidence level in math? *</label>
                    <div className="space-y-2">
                      {[
                        { value: "very_low", label: "Very low – they feel anxious or shut down easily" },
                        { value: "low", label: "Low – they try, but get discouraged quickly" },
                        { value: "average", label: "Average – some confidence, but inconsistent" },
                        { value: "high", label: "High – generally confident but still wants improvement" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("confidenceLevel", option.value)}
                          className={`w-full px-4 py-2 rounded-lg border text-sm text-left transition ${
                            formData.confidenceLevel === option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Does your child have access to stable internet and a device for online sessions? *</label>
                    <div className="space-y-2">
                      {[
                        { value: "always", label: "Yes, always" },
                        { value: "sometimes", label: "Sometimes" },
                        { value: "no", label: "No" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange("internetAccess", option.value)}
                          className={`w-full px-4 py-2 rounded-lg border text-sm text-left transition ${
                            formData.internetAccess === option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Why join this pilot? (Optional but Encouraged)</label>
                <textarea
                  placeholder="In one or two sentences, tell us why you'd like your child to join this pilot..."
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={formData.parentMotivation}
                  onChange={(e) => handleInputChange("parentMotivation", e.target.value)}
                />
              </div>

              {/* Parent Agreement */}
              <div className="space-y-3 bg-muted/20 rounded-lg p-4">
                <h4 className="font-semibold text-sm">Parent Agreement *</h4>
                <div className="space-y-2 text-sm">
                  {[
                    "I understand this is an experimental pre-launch phase.",
                    "I consent for my child to participate under TT's Confidence Project.",
                    "I'll support my child's attendance, communication, and progress.",
                    "I understand TT may use anonymized results or testimonials for success case studies.",
                    "I understand there may be an option to continue tutoring beyond the free trial on a paid basis.",
                  ].map((agreement, idx) => (
                    <div key={idx} className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{agreement}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleInputChange("agreedToTerms", !formData.agreedToTerms)}
                  className="mt-4 flex items-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-border"
                  />
                  I agree to the above terms
                </button>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Enrollment"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Due to high demand and limited tutor availability, placement is not guaranteed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submitted Confirmation */}
        {step === "submitted" && enrollmentStatus && (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                {enrollmentStatus.status === "awaiting_assignment" && "Application Under Review"}
                {enrollmentStatus.status === "assigned" && "Tutor Assigned"}
                {enrollmentStatus.status === "session_booked" && "Proposal Accepted"}
                {enrollmentStatus.status === "report_received" && "Waiting for Report"}
                {enrollmentStatus.status === "confirmed" && "Enrollment Confirmed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentStatus.status === "awaiting_assignment" && (
                <>
                  <p className="text-muted-foreground">
                    Thank you for submitting your enrollment! Our HR team is reviewing your application.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you once a tutor is assigned to your child. This typically takes 2-3 business days.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 text-left">
                    <p className="text-sm font-medium mb-2">What happens next:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>HR reviews your application</li>
                      <li>A tutor is matched to your child's needs</li>
                      <li>You'll see the tutor's profile and bio</li>
                      <li>You'll book an intro session</li>
                    </ul>
                  </div>
                </>
              )}
              {enrollmentStatus.status === "assigned" && (
                <>
                  <h3 className="text-xl font-semibold mb-4">
                    A tutor has been assigned to your child!
                  </h3>
                  
                  {assignedTutor && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-4">
                        {assignedTutor.profile_image_url ? (
                          <img 
                            src={assignedTutor.profile_image_url} 
                            alt={assignedTutor.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{assignedTutor.name}</h3>
                          {assignedTutor.bio && (
                            <p className="text-sm text-muted-foreground mt-1">{assignedTutor.bio}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            {assignedTutor.email && (
                              <div>📧 {assignedTutor.email}</div>
                            )}
                            {assignedTutor.phone && (
                              <div>📱 {assignedTutor.phone}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-blue-400/30 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-900">Your tutor is creating a personalized learning proposal...</p>
                        <p className="text-sm text-blue-700 mt-1">Proposal being prepared, check back soon</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {enrollmentStatus.status === "proposal_sent" && (
                <>
                  <p className="text-muted-foreground mb-4">
                    Your tutor has created a personalized learning proposal for your child!
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
                  {parentCode ? (
                    <Card className="border-2 border-primary mb-6">
                      <CardHeader>
                        <CardTitle className="text-xl">🎓 Student Access Code</CardTitle>
                        <CardDescription>
                          Share this code with your child so they can create their student account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground mb-2">Your Student Code</p>
                          <div className="text-4xl font-bold tracking-wider text-primary mb-4">
                            {parentCode}
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(parentCode);
                              toast({
                                title: "Copied!",
                                description: "Student code copied to clipboard",
                              });
                            }}
                            className="gap-2"
                          >
                            📋 Copy Code
                          </Button>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h4 className="font-semibold text-sm mb-2">Next Steps:</h4>
                          <ol className="text-sm text-muted-foreground space-y-2">
                            <li>1. Share this code with your child</li>
                            <li>2. Have them visit the student portal and create an account</li>
                            <li>3. They'll enter this code during signup to link their account</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-2 border-primary mb-6">
                      <CardHeader>
                        <CardTitle className="text-xl">🎓 Get Your Student Access Code</CardTitle>
                        <CardDescription>
                          Generate a code for your child to create their student account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Your proposal has been accepted! Click the button below to generate a unique code that your child will use to create their student account.
                          </p>
                          <Button
                            onClick={async () => {
                              try {
                                console.log("🎓 Generating student code...");
                                const response = await fetch(`${API_URL}/api/parent/generate-student-code`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                });
                                console.log("📡 Response status:", response.status);
                                const data = await response.json();
                                console.log("📋 Response data:", data);
                                
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
