import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const STORAGE_KEY = "tutor_application_draft";
const STEP_STORAGE_KEY = "tutor_application_step";

const applicationSchema = z.object({
  // Personal & Environmental
  fullNames: z.string().min(2, "Full name is required"),
  age: z.coerce.number().min(13).max(100),
  phoneNumber: z.string().min(10, "Valid phone number required"),
  email: z.string().email(),
  city: z.string().min(2),
  currentStatus: z.string().min(1, "Please select your current status"),
  whoInfluences: z.string().optional(),
  environment: z.string().optional(),
  
  // Mindset - stored in JSON
  whyTutor: z.string().min(10, "Please share why you want to tutor"),
  whatIsConfidenceMentor: z.string().min(10, "Please share your understanding"),
  resilienceStory: z.string().min(10, "Please share your story"),
  reactionToStudent: z.string().min(10, "Please share your honest reaction"),
  beliefInConfidence: z.string().min(10, "Please share your belief"),
  pressureWeak: z.enum(["focus", "confidence", "discipline"]),
  motivationQuote: z.enum(["prove", "grow", "impact"]),
  
  // Academic
  gradesEquipped: z.array(z.string()).min(1, "Select at least one grade"),
  canExplainClearly: z.enum(["yes_definitely", "i_think_so", "need_guidance"]),
  googleMeetConfidence: z.coerce.number().min(1).max(5),
  onenoteConfidence: z.coerce.number().min(1).max(5),
  screenShareConfidence: z.coerce.number().min(1).max(5),
  studentNotImproving: z.enum(["change_teaching", "encourage", "ask_help", "assume_not_serious"]),
  
  // Psychological
  statementHits: z.enum(["underestimated", "enjoy_challenge", "struggle_discipline", "help_others"]),
  feedbackResponse: z.enum(["defensive", "listen_fix", "reflect_need_time", "ignore"]),
  quitReason: z.enum(["workload", "recognition", "personal", "would_not_quit"]),
  teamMeaning: z.enum(["shared_responsibility", "family", "performance_group", "accountability"]),
  whatScares: z.string().min(10, "Please share what scares you"),
  
  // Vision
  futurePersonality: z.string().min(10, "Please share your vision"),
  earningsUse: z.string().min(10, "Please share how you'd use earnings"),
  studentRemembrance: z.string().min(10, "What do you want students to remember you for?"),
  impactVsScale: z.enum(["impact_10", "teach_100"]),
  impactVsScaleReason: z.string().min(10, "Please explain your choice"),
  
  // Video
  videoUrl: z.string().url("Please provide a valid video URL").optional().or(z.literal("")),
  
  // Availability
  bootcampAvailable: z.enum(["yes", "maybe", "no"]),
  commitToTrial: z.boolean(),
  referralSource: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 7;

// Load saved draft from localStorage
function loadSavedDraft(): Partial<ApplicationFormData> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading saved draft:", e);
  }
  return null;
}

// Load saved step from localStorage
function loadSavedStep(): number {
  try {
    const saved = localStorage.getItem(STEP_STORAGE_KEY);
    if (saved) {
      const step = parseInt(saved, 10);
      if (step >= 1 && step <= TOTAL_STEPS) {
        return step;
      }
    }
  } catch (e) {
    console.error("Error loading saved step:", e);
  }
  return 1;
}

export function ApplicationForm({ onSuccess, onCancel }: ApplicationFormProps) {
  const savedDraft = loadSavedDraft();
  const [currentStep, setCurrentStep] = useState(loadSavedStep());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullNames: "",
      age: 18,
      phoneNumber: "",
      email: "",
      city: "",
      currentStatus: "",
      gradesEquipped: [],
      commitToTrial: false,
      googleMeetConfidence: 3,
      onenoteConfidence: 3,
      screenShareConfidence: 3,
      // Merge with saved draft if available
      ...savedDraft,
    },
  });

  // Auto-save form data to localStorage whenever it changes
  const watchedValues = form.watch();
  
  useEffect(() => {
    // Debounce save to avoid excessive writes
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
      } catch (e) {
        console.error("Error saving draft:", e);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [watchedValues]);

  // Save current step whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString());
    } catch (e) {
      console.error("Error saving step:", e);
    }
  }, [currentStep]);

  // Clear saved data after successful submission
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_STORAGE_KEY);
    } catch (e) {
      console.error("Error clearing saved data:", e);
    }
  }, []);

  // Show toast if draft was restored
  useEffect(() => {
    if (savedDraft && Object.keys(savedDraft).length > 0) {
      toast({
        title: "Draft Restored",
        description: "Your previous progress has been restored.",
      });
    }
  }, []); // Only run once on mount

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      // Structure data to match backend schema
      const payload = {
        fullNames: data.fullNames,
        age: data.age,
        phoneNumber: data.phoneNumber,
        email: data.email,
        city: data.city,
        currentStatus: data.currentStatus,
        whoInfluences: data.whoInfluences || "",
        environment: data.environment || "",
        mindsetData: {
          whyTutor: data.whyTutor,
          whatIsConfidenceMentor: data.whatIsConfidenceMentor,
          resilienceStory: data.resilienceStory,
          reactionToStudent: data.reactionToStudent,
          beliefInConfidence: data.beliefInConfidence,
          pressureWeak: data.pressureWeak,
          motivationQuote: data.motivationQuote,
        },
        gradesEquipped: data.gradesEquipped,
        canExplainClearly: data.canExplainClearly,
        toolConfidence: {
          googleMeet: data.googleMeetConfidence,
          onenote: data.onenoteConfidence,
          screenShare: data.screenShareConfidence,
        },
        studentNotImproving: data.studentNotImproving,
        psychologicalData: {
          statementHits: data.statementHits,
          feedbackResponse: data.feedbackResponse,
          quitReason: data.quitReason,
          teamMeaning: data.teamMeaning,
          whatScares: data.whatScares,
        },
        visionData: {
          futurePersonality: data.futurePersonality,
          earningsUse: data.earningsUse,
          studentRemembrance: data.studentRemembrance,
          impactVsScale: data.impactVsScale,
          impactVsScaleReason: data.impactVsScaleReason,
        },
        videoUrl: data.videoUrl || null,
        bootcampAvailable: data.bootcampAvailable,
        commitToTrial: data.commitToTrial,
        referralSource: data.referralSource || "",
        status: "pending",
      };

      await apiRequest("POST", "/api/tutor/application", payload);
      
      // Clear saved draft after successful submission
      clearSavedData();
      
      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. We'll review it soon.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/applications"] });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    // Validate current step before moving forward
    let fieldsToValidate: (keyof ApplicationFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ["fullNames", "age", "phoneNumber", "email", "city", "currentStatus"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["whyTutor", "whatIsConfidenceMentor", "resilienceStory", "reactionToStudent", "beliefInConfidence", "pressureWeak", "motivationQuote"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["gradesEquipped", "canExplainClearly", "googleMeetConfidence", "onenoteConfidence", "screenShareConfidence", "studentNotImproving"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["statementHits", "feedbackResponse", "quitReason", "teamMeaning", "whatScares"];
    } else if (currentStep === 5) {
      fieldsToValidate = ["futurePersonality", "earningsUse", "studentRemembrance", "impactVsScale", "impactVsScaleReason"];
    } else if (currentStep === 7) {
      fieldsToValidate = ["bootcampAvailable", "commitToTrial"];
    }
    
    const result = await form.trigger(fieldsToValidate);
    if (result) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Personal & Environmental */}
        {currentStep === 1 && (
          <Card data-testid="step-personal">
            <CardHeader>
              <CardTitle>Personal & Environmental Profile</CardTitle>
              <CardDescription>Tell us about yourself and your environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullNames">Full Names</Label>
                <Input id="fullNames" {...form.register("fullNames")} data-testid="input-full-names" />
                {form.formState.errors.fullNames && <p className="text-sm text-destructive">{form.formState.errors.fullNames.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" {...form.register("age")} data-testid="input-age" />
                  {form.formState.errors.age && <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (+27)</Label>
                  <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="+27..." data-testid="input-phone" />
                  {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form.register("email")} data-testid="input-email" />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City/Location</Label>
                <Input id="city" {...form.register("city")} data-testid="input-city" />
                {form.formState.errors.city && <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentStatus">Current Status</Label>
                <Select onValueChange={(value) => form.setValue("currentStatus", value)} value={form.watch("currentStatus")}>
                  <SelectTrigger data-testid="select-current-status">
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school_student">High School Student</SelectItem>
                    <SelectItem value="high_school_graduate">High School Graduate</SelectItem>
                    <SelectItem value="university_student">University Student</SelectItem>
                    <SelectItem value="university_graduate">University Graduate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.currentStatus && <p className="text-sm text-destructive">{form.formState.errors.currentStatus.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whoInfluences">Who currently influences you most?</Label>
                <Textarea id="whoInfluences" {...form.register("whoInfluences")} placeholder="Parent, friend, teacher, mentor, no one?" data-testid="input-who-influences" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Describe your environment in one line</Label>
                <Textarea id="environment" {...form.register("environment")} placeholder="Are you surrounded by pressure, support, or distractions?" data-testid="input-environment" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Mindset & Mission */}
        {currentStep === 2 && (
          <Card data-testid="step-mindset">
            <CardHeader>
              <CardTitle>Mindset & Mission</CardTitle>
              <CardDescription>Help us understand your motivations and beliefs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whyTutor">Why do you want to become a tutor at TT?</Label>
                <Textarea id="whyTutor" {...form.register("whyTutor")} rows={3} data-testid="input-why-tutor" />
                {form.formState.errors.whyTutor && <p className="text-sm text-destructive">{form.formState.errors.whyTutor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatIsConfidenceMentor">What do you think a "Confidence Mentor" really does?</Label>
                <Textarea id="whatIsConfidenceMentor" {...form.register("whatIsConfidenceMentor")} rows={3} data-testid="input-confidence-mentor" />
                {form.formState.errors.whatIsConfidenceMentor && <p className="text-sm text-destructive">{form.formState.errors.whatIsConfidenceMentor.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resilienceStory">One moment where you had to rebuild your confidence after failure</Label>
                <Textarea id="resilienceStory" {...form.register("resilienceStory")} rows={3} data-testid="input-resilience-story" />
                {form.formState.errors.resilienceStory && <p className="text-sm text-destructive">{form.formState.errors.resilienceStory.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reactionToStudent">If a student says "I hate math, I'll never get it," what is your first emotional reaction?</Label>
                <Textarea id="reactionToStudent" {...form.register("reactionToStudent")} placeholder="Not what you'd say, but what you feel" rows={3} data-testid="input-reaction-student" />
                {form.formState.errors.reactionToStudent && <p className="text-sm text-destructive">{form.formState.errors.reactionToStudent.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="beliefInConfidence">TT believes "confidence can be taught." Do you agree or disagree? Why?</Label>
                <Textarea id="beliefInConfidence" {...form.register("beliefInConfidence")} rows={3} data-testid="input-belief-confidence" />
                {form.formState.errors.beliefInConfidence && <p className="text-sm text-destructive">{form.formState.errors.beliefInConfidence.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>When you're under pressure, what usually cracks first?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("pressureWeak", value as any)} value={form.watch("pressureWeak")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="focus" id="focus" data-testid="radio-pressure-focus" />
                    <Label htmlFor="focus">My focus</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="confidence" id="confidence" data-testid="radio-pressure-confidence" />
                    <Label htmlFor="confidence">My confidence</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="discipline" id="discipline" data-testid="radio-pressure-discipline" />
                    <Label htmlFor="discipline">My discipline</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.pressureWeak && <p className="text-sm text-destructive">{form.formState.errors.pressureWeak.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Which quote represents you best?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("motivationQuote", value as any)} value={form.watch("motivationQuote")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prove" id="prove" data-testid="radio-quote-prove" />
                    <Label htmlFor="prove">I want to prove I'm capable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grow" id="grow" data-testid="radio-quote-grow" />
                    <Label htmlFor="grow">I want to grow and learn</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="impact" id="impact" data-testid="radio-quote-impact" />
                    <Label htmlFor="impact">I want to make an impact</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.motivationQuote && <p className="text-sm text-destructive">{form.formState.errors.motivationQuote.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Academic Confidence */}
        {currentStep === 3 && (
          <Card data-testid="step-academic">
            <CardHeader>
              <CardTitle>Academic Confidence</CardTitle>
              <CardDescription>Tell us about your academic readiness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Which grades do you feel best equipped to mentor?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["Grade 6", "Grade 7", "Grade 8", "Grade 9"].map((grade) => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={grade}
                        checked={form.watch("gradesEquipped")?.includes(grade)}
                        onCheckedChange={(checked) => {
                          const current = form.watch("gradesEquipped") || [];
                          if (checked) {
                            form.setValue("gradesEquipped", [...current, grade]);
                          } else {
                            form.setValue("gradesEquipped", current.filter(g => g !== grade));
                          }
                        }}
                        data-testid={`checkbox-${grade.toLowerCase().replace(" ", "-")}`}
                      />
                      <Label htmlFor={grade}>{grade}</Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.gradesEquipped && <p className="text-sm text-destructive">{form.formState.errors.gradesEquipped.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Can you explain a concept clearly without big words or confusion?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("canExplainClearly", value as any)} value={form.watch("canExplainClearly")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes_definitely" id="yes_def" data-testid="radio-explain-yes" />
                    <Label htmlFor="yes_def">Yes, definitely</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="i_think_so" id="think_so" data-testid="radio-explain-think" />
                    <Label htmlFor="think_so">I think so</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="need_guidance" id="need_guide" data-testid="radio-explain-guidance" />
                    <Label htmlFor="need_guide">I'd need guidance</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.canExplainClearly && <p className="text-sm text-destructive">{form.formState.errors.canExplainClearly.message}</p>}
              </div>

              <div className="space-y-3">
                <Label>How confident are you with these tools? (1 = Not confident, 5 = Very confident)</Label>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="googleMeet">Google Meet</Label>
                    <span className="text-sm font-medium">{form.watch("googleMeetConfidence")}/5</span>
                  </div>
                  <Input
                    id="googleMeet"
                    type="range"
                    min="1"
                    max="5"
                    {...form.register("googleMeetConfidence")}
                    data-testid="slider-google-meet"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="onenote">OneNote / Google Sheets</Label>
                    <span className="text-sm font-medium">{form.watch("onenoteConfidence")}/5</span>
                  </div>
                  <Input
                    id="onenote"
                    type="range"
                    min="1"
                    max="5"
                    {...form.register("onenoteConfidence")}
                    data-testid="slider-onenote"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="screenShare">Screen Sharing / Teaching Online</Label>
                    <span className="text-sm font-medium">{form.watch("screenShareConfidence")}/5</span>
                  </div>
                  <Input
                    id="screenShare"
                    type="range"
                    min="1"
                    max="5"
                    {...form.register("screenShareConfidence")}
                    data-testid="slider-screen-share"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>If a student doesn't improve after 3 sessions, what's your first step?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("studentNotImproving", value as any)} value={form.watch("studentNotImproving")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="change_teaching" id="change_teach" data-testid="radio-improve-change" />
                    <Label htmlFor="change_teach">Change how I teach</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="encourage" id="encourage" data-testid="radio-improve-encourage" />
                    <Label htmlFor="encourage">Encourage them emotionally</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ask_help" id="ask_help" data-testid="radio-improve-help" />
                    <Label htmlFor="ask_help">Ask for help from my mentor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="assume_not_serious" id="assume" data-testid="radio-improve-assume" />
                    <Label htmlFor="assume">Assume they aren't serious</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.studentNotImproving && <p className="text-sm text-destructive">{form.formState.errors.studentNotImproving.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Psychological Fit */}
        {currentStep === 4 && (
          <Card data-testid="step-psychological">
            <CardHeader>
              <CardTitle>Psychological Fit</CardTitle>
              <CardDescription>Answer honestly - no right or wrong answers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Which statement hits you hardest?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("statementHits", value as any)} value={form.watch("statementHits")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="underestimated" id="underest" data-testid="radio-statement-underestimated" />
                    <Label htmlFor="underest">I often feel underestimated</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enjoy_challenge" id="challenge" data-testid="radio-statement-challenge" />
                    <Label htmlFor="challenge">I enjoy being challenged even if I fail</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="struggle_discipline" id="discipline2" data-testid="radio-statement-discipline" />
                    <Label htmlFor="discipline2">I struggle with discipline but I want structure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="help_others" id="help" data-testid="radio-statement-help" />
                    <Label htmlFor="help">I like helping others overcome what I've already overcome</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.statementHits && <p className="text-sm text-destructive">{form.formState.errors.statementHits.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>How do you respond to feedback that exposes your mistakes?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("feedbackResponse", value as any)} value={form.watch("feedbackResponse")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="defensive" id="defensive" data-testid="radio-feedback-defensive" />
                    <Label htmlFor="defensive">I get defensive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="listen_fix" id="listen" data-testid="radio-feedback-listen" />
                    <Label htmlFor="listen">I listen and fix it</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reflect_need_time" id="reflect" data-testid="radio-feedback-reflect" />
                    <Label htmlFor="reflect">I reflect but need time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ignore" id="ignore" data-testid="radio-feedback-ignore" />
                    <Label htmlFor="ignore">I ignore it if I don't agree</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.feedbackResponse && <p className="text-sm text-destructive">{form.formState.errors.feedbackResponse.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>What would make you quit TT if it happened?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("quitReason", value as any)} value={form.watch("quitReason")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="workload" id="workload" data-testid="radio-quit-workload" />
                    <Label htmlFor="workload">Too much workload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recognition" id="recognition" data-testid="radio-quit-recognition" />
                    <Label htmlFor="recognition">Lack of recognition</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" data-testid="radio-quit-personal" />
                    <Label htmlFor="personal">Personal issues</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="would_not_quit" id="not_quit" data-testid="radio-quit-adapt" />
                    <Label htmlFor="not_quit">I wouldn't quit — I'd adapt</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.quitReason && <p className="text-sm text-destructive">{form.formState.errors.quitReason.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>What does "team" mean to you?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("teamMeaning", value as any)} value={form.watch("teamMeaning")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shared_responsibility" id="shared" data-testid="radio-team-shared" />
                    <Label htmlFor="shared">Shared responsibility</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="family" id="family" data-testid="radio-team-family" />
                    <Label htmlFor="family">Family</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="performance_group" id="performance" data-testid="radio-team-performance" />
                    <Label htmlFor="performance">Performance group</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="accountability" id="account" data-testid="radio-team-accountability" />
                    <Label htmlFor="account">Accountability system</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.teamMeaning && <p className="text-sm text-destructive">{form.formState.errors.teamMeaning.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatScares">What scares you most about this opportunity?</Label>
                <Textarea id="whatScares" {...form.register("whatScares")} rows={3} data-testid="input-what-scares" />
                {form.formState.errors.whatScares && <p className="text-sm text-destructive">{form.formState.errors.whatScares.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Vision & Long-term */}
        {currentStep === 5 && (
          <Card data-testid="step-vision">
            <CardHeader>
              <CardTitle>Vision & Long-Term Thinking</CardTitle>
              <CardDescription>Tell us about your aspirations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="futurePersonality">What kind of person do you want to become by the end of your journey at TT?</Label>
                <Textarea id="futurePersonality" {...form.register("futurePersonality")} rows={3} data-testid="input-future-personality" />
                {form.formState.errors.futurePersonality && <p className="text-sm text-destructive">{form.formState.errors.futurePersonality.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="earningsUse">How would you use your earnings if you made R42,000 in a year tutoring?</Label>
                <Textarea id="earningsUse" {...form.register("earningsUse")} rows={3} data-testid="input-earnings-use" />
                {form.formState.errors.earningsUse && <p className="text-sm text-destructive">{form.formState.errors.earningsUse.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentRemembrance">What do you want your students to remember you for?</Label>
                <Textarea id="studentRemembrance" {...form.register("studentRemembrance")} rows={3} data-testid="input-student-remembrance" />
                {form.formState.errors.studentRemembrance && <p className="text-sm text-destructive">{form.formState.errors.studentRemembrance.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>If TT gave you a choice: "Impact 10 students deeply" or "Teach 100 students lightly," which would you choose?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("impactVsScale", value as any)} value={form.watch("impactVsScale")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="impact_10" id="impact10" data-testid="radio-impact-10" />
                    <Label htmlFor="impact10">Impact 10 students deeply</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teach_100" id="teach100" data-testid="radio-teach-100" />
                    <Label htmlFor="teach100">Teach 100 students lightly</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.impactVsScale && <p className="text-sm text-destructive">{form.formState.errors.impactVsScale.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="impactVsScaleReason">Why did you choose that option?</Label>
                <Textarea id="impactVsScaleReason" {...form.register("impactVsScaleReason")} rows={3} data-testid="input-impact-reason" />
                {form.formState.errors.impactVsScaleReason && <p className="text-sm text-destructive">{form.formState.errors.impactVsScaleReason.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Video Introduction */}
        {currentStep === 6 && (
          <Card data-testid="step-video">
            <CardHeader>
              <CardTitle>Video Introduction</CardTitle>
              <CardDescription>Share a video introducing yourself (optional but recommended)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (Google Photos or Drive link)</Label>
                <Input 
                  id="videoUrl" 
                  {...form.register("videoUrl")} 
                  placeholder="https://drive.google.com/..." 
                  data-testid="input-video-url" 
                />
                {form.formState.errors.videoUrl && <p className="text-sm text-destructive">{form.formState.errors.videoUrl.message}</p>}
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">What to include in your video (3 min max):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Who you are</li>
                  <li>Why you want to be part of TT's Founding Team</li>
                  <li>A challenge you overcame</li>
                  <li>What excites you about transforming confidence</li>
                  <li>A fun or unique personal trait</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 7: Availability & Commitment */}
        {currentStep === 7 && (
          <Card data-testid="step-availability">
            <CardHeader>
              <CardTitle>Availability & Commitment</CardTitle>
              <CardDescription>Let us know about your availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Are you available for TT's Founding Team Bootcamp (Prep Phase)?</Label>
                <RadioGroup onValueChange={(value) => form.setValue("bootcampAvailable", value as any)} value={form.watch("bootcampAvailable")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="boot_yes" data-testid="radio-bootcamp-yes" />
                    <Label htmlFor="boot_yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="boot_maybe" data-testid="radio-bootcamp-maybe" />
                    <Label htmlFor="boot_maybe">Maybe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="boot_no" data-testid="radio-bootcamp-no" />
                    <Label htmlFor="boot_no">No</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.bootcampAvailable && <p className="text-sm text-destructive">{form.formState.errors.bootcampAvailable.message}</p>}
              </div>

              <div className="space-y-2 bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="commitToTrial"
                    checked={form.watch("commitToTrial")}
                    onCheckedChange={(checked) => form.setValue("commitToTrial", checked as boolean)}
                    data-testid="checkbox-commit-trial"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="commitToTrial" className="font-medium">
                      I commit to the 2-month transformation trial before earnings begin
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      This is part of TT's Founding Phase to prove the Confidence Method works
                    </p>
                  </div>
                </div>
                {form.formState.errors.commitToTrial && <p className="text-sm text-destructive">{form.formState.errors.commitToTrial.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralSource">Where did you hear about this opportunity?</Label>
                <Select onValueChange={(value) => form.setValue("referralSource", value)} value={form.watch("referralSource")}>
                  <SelectTrigger data-testid="select-referral">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Final Statement</h4>
                <p className="text-sm">
                  This is a founding opportunity — not a casual job. We're looking for young people who want to prove that confidence can be taught, replicated, and scaled ethically.
                </p>
                <p className="text-sm font-medium italic">
                  "If you can't believe in transformation, you can't lead transformation."
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : prevStep}
            disabled={isSubmitting}
            data-testid="button-previous"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={nextStep} data-testid="button-next">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
