import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const IDENTITIES = [
  "Entrepreneur",
  "Lawyer",
  "Accountant",
  "Doctor",
  "Engineer",
  "Director",
  "Coach",
  "CEO",
  "Storyteller",
  "Teacher",
];

const PRESSURE_RESPONSES = ["Fight", "Freeze", "Avoid", "Overthink", "Shut-down"];

const PLANS = ["Standard Plan", "Premium Plan"];

const JUSTIFICATION_SCRIPTS = {
  "Premium Plan": [
    "{studentName} performs best with tight, consistent touchpoints. Premium matches their learning tempo and keeps their progress sharp.",
    "{studentName} grasps concepts quickly, but they also move on quickly. Premium lets us channel that speed into mastery instead of rushing.",
    "{studentName} is aiming high. Premium gives them the intensity and structure that matches the goals they're chasing.",
    "{studentName} grows when they stay in flow. Premium keeps them in that flow so every lesson builds directly on the last.",
    "{studentName} responds well to quick corrections. Premium lets us turn mistakes into improvements before they settle.",
    "{studentName} benefits from a training-style routine. Premium mirrors athletic conditioning: frequent reps, steady gains.",
  ],
  "Standard Plan": [
    "{studentName} learns deeply when they have time to process. Standard gives them room to think, reflect, and come back stronger each week.",
    "{studentName} performs best without feeling rushed. Standard offers reliable support while keeping things calm and manageable.",
    "{studentName} naturally takes initiative. Standard ensures they have weekly guidance while still letting them build independence.",
    "{studentName} has a tight schedule. Standard keeps tutoring effective without crowding their routine.",
    "{studentName} improves consistently over time. Standard matches their natural pace and keeps progress smooth.",
    "{studentName} needs time to practice after learning something new. Standard gives them the perfect cycle: learn, apply, return.",
  ],
};

interface IdentitySheetData {
  personalProfile?: {
    personalityType?: string;
    name?: string;
    grade?: string;
    school?: string;
    learningId?: string;
    longTermGoals?: string;
  };
  emotionalInsights?: {
    relationshipWithMath?: string;
    confidenceTriggers?: string;
    confidenceKillers?: string;
    pressureResponse?: string;
    growthDrivers?: string;
  };
  academicDiagnosis?: {
    currentClassTopics?: string;
    strugglesWith?: string;
    gapsIdentified?: string;
    bossBattlesCompleted?: string;
    lastBossBattleResult?: string;
    tutorNotes?: string;
  };
  identitySheet?: Record<string, string[]>;
  completedAt?: string | null;
}

interface ParentOnboardingProposalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  tutorName?: string;
  identitySheetData?: IdentitySheetData;
}

export default function ParentOnboardingProposal({
  open,
  onOpenChange,
  studentName,
  studentId,
  tutorName = "Your Tutor",
  identitySheetData,
}: ParentOnboardingProposalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    primaryIdentity: "",
    mathRelationship: "",
    confidenceTriggers: "",
    confidenceKillers: "",
    pressureResponse: "",
    growthDrivers: "",
    currentTopics: "",
    immediateStruggles: "",
    gapsIdentified: "",
    tutorNotes: "",
    futureIdentity: "",
    wantToRemembered: "",
    hiddenMotivations: "",
    internalConflict: "",
    recommendedPlan: "Standard Plan",
    justification: "",
    childWillWin: "",
  });
  const [selectedJustificationScript, setSelectedJustificationScript] = useState<string>("");

  // Pre-populate form when identity sheet data is available
  useEffect(() => {
    if (identitySheetData && open) {
      // Extract specific answers from identity sheet Q&A
      const identitySheet = identitySheetData.identitySheet || {};
      
      // Map questions to form fields
      const dreamJob = identitySheet["Who Are You?-1"]?.[0] || ""; // "What's your dream life or job?"
      const wantRemembered = identitySheet["Values & Emotional Landscape-0"]?.[0] || ""; // "What kind of person do you want to be remembered as?"
      const hiddenBelief = identitySheet["Mindset & Self-Perception-3"]?.[0] || ""; // "What's something you believe about yourself that no one sees?"
      const secretDream = identitySheet["Dreams & Inner Drive-0"]?.[0] || ""; // "What's a dream you haven't told anyone about?"
      const deepDesire = identitySheet["Dreams & Inner Drive-1"]?.[0] || ""; // "What's something you really want"
      
      // Clean up corrupted array data (filters out single-char strings)
      const cleanArray = (value: any): string => {
        if (!value) return "";
        if (Array.isArray(value)) {
          // Filter out single-character corruption, keep real values
          const cleaned = value.filter(item => typeof item === 'string' && item.length > 1);
          return cleaned.join(", ");
        }
        if (typeof value === 'string') return value;
        return "";
      };

      setFormData((prev) => ({
        ...prev,
        primaryIdentity: identitySheetData.personalProfile?.learningId || "",
        mathRelationship: identitySheetData.emotionalInsights?.relationshipWithMath || "",
        confidenceTriggers: cleanArray(identitySheetData.emotionalInsights?.confidenceTriggers),
        confidenceKillers: cleanArray(identitySheetData.emotionalInsights?.confidenceKillers),
        pressureResponse: identitySheetData.emotionalInsights?.pressureResponse || "",
        growthDrivers: identitySheetData.emotionalInsights?.growthDrivers || "",
        currentTopics: identitySheetData.academicDiagnosis?.currentClassTopics || "",
        immediateStruggles: identitySheetData.academicDiagnosis?.strugglesWith || "",
        gapsIdentified: identitySheetData.academicDiagnosis?.gapsIdentified || "",
        tutorNotes: identitySheetData.academicDiagnosis?.tutorNotes || "",
        // Psychological Anchor fields from identity sheet Q&A
        futureIdentity: dreamJob,
        wantToRemembered: wantRemembered,
        hiddenMotivations: [secretDream, deepDesire].filter(Boolean).join("; "),
        internalConflict: hiddenBelief,
      }));
    }
  }, [identitySheetData, open]);

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Reset justification script selector when plan changes
    if (field === "recommendedPlan") {
      setSelectedJustificationScript("");
    }
  };

  const handleJustificationScriptSelect = (scriptTemplate: string) => {
    setSelectedJustificationScript(scriptTemplate);
    // Replace {studentName} with actual student name
    const personalizedScript = scriptTemplate.replace(/{studentName}/g, studentName);
    handleInputChange("justification", personalizedScript);
  };

  const handleSendProposal = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tutor/proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          studentId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to send proposal" }));
        console.error("Server error:", errorData);
        throw new Error(errorData.message || "Failed to send proposal");
      }

      const data = await response.json();
      console.log("✅ Proposal sent successfully:", data);
      
      // Show success message
      toast({
        title: "Proposal Sent Successfully!",
        description: `The personalized proposal for ${studentName} has been sent to their parent.`,
        duration: 5000,
      });
      
      // Refresh pod data to update button state
      await queryClient.invalidateQueries({ queryKey: ["/api/tutor/pod"] });
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("❌ Error sending proposal:", error);
      toast({
        title: "Failed to Send Proposal",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleDownloadProposal = () => {
    // TODO: Implement PDF download
    console.log("Downloading proposal for student:", studentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-base sm:text-lg">Parent Onboarding Proposal</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Creating a personalized proposal for {studentName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Overview</TabsTrigger>
            <TabsTrigger value="identity" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Identity</TabsTrigger>
            <TabsTrigger value="academics" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Academics</TabsTrigger>
            <TabsTrigger value="recommendation" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Recommendation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 sm:space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 sm:p-6 rounded-lg mb-3 sm:mb-6">
              <h3 className="text-sm sm:text-lg font-bold text-foreground mb-1 sm:mb-2">
                Parent-Ready, Confidence-Engineered, Retention-Designed
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                A comprehensive proposal built around {studentName}'s unique identity, emotional patterns, and academic needs.
              </p>
            </div>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">1. Identity Insight Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div>
                  <Label htmlFor="primaryIdentity" className="text-xs sm:text-sm font-medium">
                    Primary Identity Detected
                  </Label>
                  <Select
                    value={formData.primaryIdentity}
                    onValueChange={(value) =>
                      handleInputChange("primaryIdentity", value)
                    }
                  >
                    <SelectTrigger id="primaryIdentity" className="mt-2">
                      <SelectValue placeholder="Select identity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {IDENTITIES.map((identity) => (
                        <SelectItem key={identity} value={identity}>
                          {identity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your child naturally thinks, reacts, and solves problems like a {formData.primaryIdentity || "[identity]"}.
                  </p>
                </div>

                <div>
                  <Label htmlFor="tutorNotes" className="text-xs sm:text-sm font-medium">
                    Tutor Observations
                  </Label>
                  <Textarea
                    id="tutorNotes"
                    placeholder="Enter tutor observations about core strengths, personality traits, blind spots, and how math aligns with their identity..."
                    value={formData.tutorNotes}
                    onChange={(e) =>
                      handleInputChange("tutorNotes", e.target.value)
                    }
                    className="mt-2 min-h-20 sm:min-h-24 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include: Core strengths, personality traits, blind spots, and how math feels aligned with their identity
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identity" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">2. Emotional Map & Confidence Blueprint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div>
                  <Label htmlFor="mathRelationship" className="text-xs sm:text-sm font-medium">
                    Relationship With Math
                  </Label>
                  <Textarea
                    id="mathRelationship"
                    placeholder="Describe their emotional patterns with math, not academics..."
                    value={formData.mathRelationship}
                    onChange={(e) =>
                      handleInputChange("mathRelationship", e.target.value)
                    }
                    className="mt-2 min-h-16 sm:min-h-20 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="confidenceTriggers" className="text-xs sm:text-sm font-medium">
                      Confidence Triggers
                    </Label>
                    <Textarea
                      id="confidenceTriggers"
                      placeholder="What lifts them up?"
                      value={formData.confidenceTriggers}
                      onChange={(e) =>
                        handleInputChange("confidenceTriggers", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confidenceKillers" className="text-xs sm:text-sm font-medium">
                      Confidence Killers
                    </Label>
                    <Textarea
                      id="confidenceKillers"
                      placeholder="What shuts them down instantly?"
                      value={formData.confidenceKillers}
                      onChange={(e) =>
                        handleInputChange("confidenceKillers", e.target.value)
                      }
                      className="mt-2 min-h-16 sm:min-h-20 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pressureResponse" className="text-xs sm:text-sm font-medium">
                    Pressure Response Pattern
                  </Label>
                  <Textarea
                    id="pressureResponse"
                    placeholder="How do they respond under pressure?"
                    value={formData.pressureResponse}
                    onChange={(e) =>
                      handleInputChange("pressureResponse", e.target.value)
                    }
                    className="mt-2 min-h-16 sm:min-h-20 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="growthDrivers" className="text-xs sm:text-sm font-medium">
                    Growth Drivers
                  </Label>
                  <Textarea
                    id="growthDrivers"
                    placeholder="What gets them to try, improve, persist?"
                    value={formData.growthDrivers}
                    onChange={(e) =>
                      handleInputChange("growthDrivers", e.target.value)
                    }
                    className="mt-2 min-h-16 sm:min-h-20 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">3. Academic Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div>
                  <Label htmlFor="currentTopics" className="text-xs sm:text-sm font-medium">
                    Current Topics
                  </Label>
                  <Textarea
                    id="currentTopics"
                    placeholder="Based on what the child mentioned in session..."
                    value={formData.currentTopics}
                    onChange={(e) =>
                      handleInputChange("currentTopics", e.target.value)
                    }
                    className="mt-2 min-h-16 sm:min-h-20 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="immediateStruggles" className="text-xs sm:text-sm font-medium">
                      Immediate Struggles
                    </Label>
                    <Textarea
                      id="immediateStruggles"
                      placeholder="Patterns, not just topics..."
                      value={formData.immediateStruggles}
                      onChange={(e) =>
                        handleInputChange("immediateStruggles", e.target.value)
                      }
                      className="mt-2 min-h-16 sm:min-h-20 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gapsIdentified" className="text-xs sm:text-sm font-medium">
                      Gaps Identified
                    </Label>
                    <Textarea
                      id="gapsIdentified"
                      placeholder="Where foundations cracked..."
                      value={formData.gapsIdentified}
                      onChange={(e) =>
                        handleInputChange("gapsIdentified", e.target.value)
                      }
                      className="mt-2 min-h-16 sm:min-h-20 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">4. Psychological Anchor: The Identity Sheet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="futureIdentity" className="text-xs sm:text-sm font-medium">
                      Who They Want To Be
                    </Label>
                    <Textarea
                      id="futureIdentity"
                      placeholder="Pulled from long-term answers..."
                      value={formData.futureIdentity}
                      onChange={(e) =>
                        handleInputChange("futureIdentity", e.target.value)
                      }
                      className="mt-2 min-h-16 sm:min-h-20 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="wantToRemembered" className="text-xs sm:text-sm font-medium">
                      How They Want To Be Remembered
                    </Label>
                    <Textarea
                      id="wantToRemembered"
                      placeholder="Personality + values..."
                      value={formData.wantToRemembered}
                      onChange={(e) =>
                        handleInputChange("wantToRemembered", e.target.value)
                      }
                      className="mt-2 min-h-16 sm:min-h-20 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="hiddenMotivations" className="text-xs sm:text-sm font-medium">
                      Hidden Motivations
                    </Label>
                    <Textarea
                      id="hiddenMotivations"
                      placeholder="Pulled from emotional questions..."
                      value={formData.hiddenMotivations}
                      onChange={(e) =>
                        handleInputChange("hiddenMotivations", e.target.value)
                      }
                      className="mt-2 min-h-16 sm:min-h-20 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="internalConflict" className="text-xs sm:text-sm font-medium">
                      Internal Conflict
                    </Label>
                    <Textarea
                      id="internalConflict"
                      placeholder="Where they sabotage themselves..."
                      value={formData.internalConflict}
                      onChange={(e) =>
                        handleInputChange("internalConflict", e.target.value)
                      }
                      className="mt-2 min-h-16 sm:min-h-20 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academics" className="space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">5. The Confidence Roadmap (90-Day Plan)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="bg-accent/50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm mb-2">Phase 1: Reset & Confidence Stabilization (Weeks 1–3)</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• Rebuilding their relationship with math</li>
                      <li>• Identity-based motivation</li>
                      <li>• Fixing pressure response</li>
                      <li>• Teaching student their own strengths</li>
                      <li>• Introducing TT's signature step-by-step mastery model</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm mb-2">Phase 2: Foundation Reconstruction (Weeks 4–7)</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• Closing the exact gaps identified</li>
                      <li>• Real high-stakes-style practice with The Boss Battles</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm mb-2">Phase 3: Performance Expansion (Weeks 8–12)</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• Stronger problem-solving</li>
                      <li>• Faster pace</li>
                      <li>• Test-readiness</li>
                      <li>• Confidence-first exam approaching</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/10 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <h4 className="font-semibold text-xs sm:text-sm mb-2 text-foreground">Expected Outcomes by Day 90</h4>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>✓ Better attitude</li>
                    <li>✓ Cleaner logic</li>
                    <li>✓ Stronger confidence</li>
                    <li>✓ More consistency</li>
                    <li>✓ A child who doesn't fear math anymore</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">6. Why {studentName} Will Win</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <Textarea
                  placeholder="Describe how this child's specific identity, confidence triggers, learning style, and pressure pattern will lead to success..."
                  value={formData.childWillWin}
                  onChange={(e) =>
                    handleInputChange("childWillWin", e.target.value)
                  }
                  className="min-h-16 sm:min-h-24 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This is personalized to their unique psychology and academic profile.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-3 sm:space-y-4">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Standard Program: Premium Response Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-medium">
                    All students receive the same standardized program: <strong>Premium Response Training</strong>
                  </p>
                  
                  <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                    <h4 className="font-semibold text-xs sm:text-sm">What's Included</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>✓ Weekly 1-on-1 session</li>
                      <li>✓ Response-first problem training</li>
                      <li>✓ Monthly pressure simulation</li>
                      <li>✓ Neutral progress reporting</li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-muted-foreground italic">
                      No psychology theatre, no identity probing, no motivational leakage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Ready to Send</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    Click "Send to Parent" to deliver the standardized Premium Response Training program to {studentName}'s parent.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 px-3 sm:px-0">
              <Button
                onClick={handleSendProposal}
                className="w-full gap-2 text-sm sm:text-base"
                size="lg"
              >
                <Send className="w-4 h-4" />
                Send to Parent
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
