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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parent Onboarding Proposal</DialogTitle>
          <DialogDescription>
            Creating a personalized proposal for {studentName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="identity">Identity & Emotions</TabsTrigger>
            <TabsTrigger value="academics">Academics & Plan</TabsTrigger>
            <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Parent-Ready, Confidence-Engineered, Retention-Designed
              </h3>
              <p className="text-sm text-muted-foreground">
                A comprehensive proposal built around {studentName}'s unique identity, emotional patterns, and academic needs.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Identity Insight Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryIdentity" className="text-sm font-medium">
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
                  <Label htmlFor="tutorNotes" className="text-sm font-medium">
                    Tutor Observations
                  </Label>
                  <Textarea
                    id="tutorNotes"
                    placeholder="Enter tutor observations about core strengths, personality traits, blind spots, and how math aligns with their identity..."
                    value={formData.tutorNotes}
                    onChange={(e) =>
                      handleInputChange("tutorNotes", e.target.value)
                    }
                    className="mt-2 min-h-24"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include: Core strengths, personality traits, blind spots, and how math feels aligned with their identity
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Emotional Map & Confidence Blueprint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mathRelationship" className="text-sm font-medium">
                    Relationship With Math
                  </Label>
                  <Textarea
                    id="mathRelationship"
                    placeholder="Describe their emotional patterns with math, not academics..."
                    value={formData.mathRelationship}
                    onChange={(e) =>
                      handleInputChange("mathRelationship", e.target.value)
                    }
                    className="mt-2 min-h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confidenceTriggers" className="text-sm font-medium">
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
                    <Label htmlFor="confidenceKillers" className="text-sm font-medium">
                      Confidence Killers
                    </Label>
                    <Textarea
                      id="confidenceKillers"
                      placeholder="What shuts them down instantly?"
                      value={formData.confidenceKillers}
                      onChange={(e) =>
                        handleInputChange("confidenceKillers", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pressureResponse" className="text-sm font-medium">
                    Pressure Response Pattern
                  </Label>
                  <Textarea
                    id="pressureResponse"
                    placeholder="How do they respond under pressure?"
                    value={formData.pressureResponse}
                    onChange={(e) =>
                      handleInputChange("pressureResponse", e.target.value)
                    }
                    className="mt-2 min-h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="growthDrivers" className="text-sm font-medium">
                    Growth Drivers
                  </Label>
                  <Textarea
                    id="growthDrivers"
                    placeholder="What gets them to try, improve, persist?"
                    value={formData.growthDrivers}
                    onChange={(e) =>
                      handleInputChange("growthDrivers", e.target.value)
                    }
                    className="mt-2 min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">3. Academic Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentTopics" className="text-sm font-medium">
                    Current Topics
                  </Label>
                  <Textarea
                    id="currentTopics"
                    placeholder="Based on what the child mentioned in session..."
                    value={formData.currentTopics}
                    onChange={(e) =>
                      handleInputChange("currentTopics", e.target.value)
                    }
                    className="mt-2 min-h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="immediateStruggles" className="text-sm font-medium">
                      Immediate Struggles
                    </Label>
                    <Textarea
                      id="immediateStruggles"
                      placeholder="Patterns, not just topics..."
                      value={formData.immediateStruggles}
                      onChange={(e) =>
                        handleInputChange("immediateStruggles", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gapsIdentified" className="text-sm font-medium">
                      Gaps Identified
                    </Label>
                    <Textarea
                      id="gapsIdentified"
                      placeholder="Where foundations cracked..."
                      value={formData.gapsIdentified}
                      onChange={(e) =>
                        handleInputChange("gapsIdentified", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">4. Psychological Anchor: The Identity Sheet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="futureIdentity" className="text-sm font-medium">
                      Who They Want To Be
                    </Label>
                    <Textarea
                      id="futureIdentity"
                      placeholder="Pulled from long-term answers..."
                      value={formData.futureIdentity}
                      onChange={(e) =>
                        handleInputChange("futureIdentity", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="wantToRemembered" className="text-sm font-medium">
                      How They Want To Be Remembered
                    </Label>
                    <Textarea
                      id="wantToRemembered"
                      placeholder="Personality + values..."
                      value={formData.wantToRemembered}
                      onChange={(e) =>
                        handleInputChange("wantToRemembered", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hiddenMotivations" className="text-sm font-medium">
                      Hidden Motivations
                    </Label>
                    <Textarea
                      id="hiddenMotivations"
                      placeholder="Pulled from emotional questions..."
                      value={formData.hiddenMotivations}
                      onChange={(e) =>
                        handleInputChange("hiddenMotivations", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="internalConflict" className="text-sm font-medium">
                      Internal Conflict
                    </Label>
                    <Textarea
                      id="internalConflict"
                      placeholder="Where they sabotage themselves..."
                      value={formData.internalConflict}
                      onChange={(e) =>
                        handleInputChange("internalConflict", e.target.value)
                      }
                      className="mt-2 min-h-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">5. The Confidence Roadmap (90-Day Plan)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/50 p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Phase 1: Reset & Confidence Stabilization (Weeks 1–3)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Rebuilding their relationship with math</li>
                      <li>• Identity-based motivation</li>
                      <li>• Fixing pressure response</li>
                      <li>• Teaching student their own strengths</li>
                      <li>• Introducing TT's signature step-by-step mastery model</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Phase 2: Foundation Reconstruction (Weeks 4–7)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Closing the exact gaps identified</li>
                      <li>• Real high-stakes-style practice with The Boss Battles</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Phase 3: Performance Expansion (Weeks 8–12)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Stronger problem-solving</li>
                      <li>• Faster pace</li>
                      <li>• Test-readiness</li>
                      <li>• Confidence-first exam approaching</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-foreground">Expected Outcomes by Day 90</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
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
              <CardHeader>
                <CardTitle className="text-base">6. Why {studentName} Will Win</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe how this child's specific identity, confidence triggers, learning style, and pressure pattern will lead to success..."
                  value={formData.childWillWin}
                  onChange={(e) =>
                    handleInputChange("childWillWin", e.target.value)
                  }
                  className="min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  This is personalized to their unique psychology and academic profile.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">7. TT Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recommendedPlan" className="text-sm font-medium">
                    Recommended Plan
                  </Label>
                  <Select
                    value={formData.recommendedPlan}
                    onValueChange={(value) =>
                      handleInputChange("recommendedPlan", value)
                    }
                  >
                    <SelectTrigger id="recommendedPlan" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="justificationScript" className="text-sm font-medium">
                    Choose Justification Script
                  </Label>
                  <Select
                    value={selectedJustificationScript}
                    onValueChange={handleJustificationScriptSelect}
                  >
                    <SelectTrigger id="justificationScript" className="mt-2">
                      <SelectValue placeholder="Select a pre-written justification script..." />
                    </SelectTrigger>

                    <SelectContent className="max-w-3xl max-h-[400px]" side="bottom" align="start">
                      {JUSTIFICATION_SCRIPTS[formData.recommendedPlan as keyof typeof JUSTIFICATION_SCRIPTS]?.map((script, index) => (
                        <SelectItem key={index} value={script} className="whitespace-normal py-4 px-4 h-auto min-h-[60px] items-start cursor-pointer">
                          <span className="block leading-relaxed">
                            {script.replace(/{studentName}/g, studentName)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.justification && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
                      {formData.justification}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">8. Closing Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    Your child doesn't need a tutor. They need the right environment - one built for who they are, and who they're becoming. That's what we're offering you.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleDownloadProposal}
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Download as PDF
              </Button>
              <Button
                onClick={handleSendProposal}
                className="flex-1 gap-2"
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
