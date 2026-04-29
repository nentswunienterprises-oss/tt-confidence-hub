import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  age: z.coerce.number().min(18, "You must be at least 18"),
  city: z.string().min(2, "City is required"),
  phone: z.string().min(10, "Phone number is required"),
  idType: z.enum(["sa_id", "passport"]),
  idNumber: z.string().min(6, "Identification number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  taughtOrMentoredBefore: z.enum(["yes", "no"]),
  ledOrSupervisedOthers: z.enum(["yes", "no"]),
  hoursAvailablePerWeek: z.coerce.number().min(6, "Minimum 6 hours required"),
  systemUnderstandingDifference: z.string().min(20, "Be specific"),
  studentFreezesBreak: z.string().min(20, "Be specific"),
  explainingBetterNotEnough: z.string().min(20, "Be specific"),
  supervisingTutorAction: z.string().min(20, "Be specific"),
  frustrationResponse: z.string().min(20, "Be specific"),
  adjustSystemAnswer: z.string().min(10, "Be explicit"),
  highToMediumCauses: z.string().min(20, "Be specific"),
  highScoresNoImprovement: z.string().min(20, "Be specific"),
  sharedTutorMistakeMeaning: z.string().min(20, "Be specific"),
  correctOlderTutor: z.string().min(20, "Be specific"),
  pushbackResponse: z.string().min(20, "Be specific"),
  unpopularEnforcementCase: z.string().min(20, "Be specific"),
  noRescueExplanation: z.string().min(20, "Be structured"),
  moreDangerousTutor: z.string().min(20, "Be specific"),
  systemDestructionFactors: z.string().min(20, "Be specific"),
  commitmentToStandard: z.enum(["yes", "no"]),
  trustReason: z.string().min(20, "Be specific"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const questionFields: Array<{ key: keyof ApplicationFormData; label: string }> = [
  { key: "systemUnderstandingDifference", label: "Q1. What is the difference between teaching content and training response?" },
  { key: "studentFreezesBreak", label: "Q2. A student understands a topic but freezes during tests. What is actually broken?" },
  { key: "explainingBetterNotEnough", label: "Q3. Why is explaining better often not enough?" },
  { key: "supervisingTutorAction", label: "Q4. A tutor explains too much, helps too early, and avoids struggle. What do you do?" },
  { key: "frustrationResponse", label: 'Q5. The tutor says "I did not want the student to feel frustrated." How do you respond?' },
  { key: "adjustSystemAnswer", label: "Q6. Would you allow a tutor to adjust the system to suit their style? Why or why not?" },
  { key: "highToMediumCauses", label: "Q7. A student moves from High to Medium. What are 3 possible causes?" },
  { key: "highScoresNoImprovement", label: "Q8. A tutor gets high session scores but students are not improving long-term. What could be wrong?" },
  { key: "sharedTutorMistakeMeaning", label: "Q9. If multiple tutors show the same mistake, what does that indicate?" },
  { key: "correctOlderTutor", label: "Q10. You must correct someone older than you who is not following the system. How do you handle it?" },
  { key: "pushbackResponse", label: "Q11. A tutor disagrees with your correction and pushes back. What do you do?" },
  { key: "unpopularEnforcementCase", label: "Q12. Describe a situation where you had to enforce something unpopular. What happened?" },
  { key: "noRescueExplanation", label: 'Q13. Explain in a structured way: "Why must a student not be rescued during difficulty?"' },
  { key: "moreDangerousTutor", label: 'Q14. What is more dangerous: a weak tutor, or a slightly wrong tutor who seems "good"?' },
  { key: "systemDestructionFactors", label: "Q15. What would slowly destroy a system like TT over time?" },
  { key: "trustReason", label: "Q17. Why should you be trusted to protect a system like this?" },
];

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

function deriveDateOfBirthFromSouthAfricanId(idNumber: string) {
  const digits = String(idNumber || "").replace(/\D/g, "");
  if (digits.length < 6) return "";
  const yy = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));
  if (!yy || mm < 1 || mm > 12 || dd < 1 || dd > 31) return "";

  const now = new Date();
  const currentTwoDigitYear = now.getFullYear() % 100;
  const fullYear = yy <= currentTwoDigitYear ? 2000 + yy : 1900 + yy;
  const date = new Date(fullYear, mm - 1, dd);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== fullYear ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return "";
  }

  return `${fullYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function TdApplicationForm({ onSuccess, onCancel }: Props) {
  const STORAGE_KEY = "tt_td_application_draft";
  const AUTOSAVE_DELAY_MS = 400;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValuesRef = useRef<Partial<ApplicationFormData>>({});
  const restoredDraftRef = useRef(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      age: 18,
      city: "",
      phone: "",
      idType: "sa_id",
      idNumber: "",
      dateOfBirth: "",
      taughtOrMentoredBefore: "yes",
      ledOrSupervisedOthers: "yes",
      hoursAvailablePerWeek: 6,
      systemUnderstandingDifference: "",
      studentFreezesBreak: "",
      explainingBetterNotEnough: "",
      supervisingTutorAction: "",
      frustrationResponse: "",
      adjustSystemAnswer: "",
      highToMediumCauses: "",
      highScoresNoImprovement: "",
      sharedTutorMistakeMeaning: "",
      correctOlderTutor: "",
      pushbackResponse: "",
      unpopularEnforcementCase: "",
      noRescueExplanation: "",
      moreDangerousTutor: "",
      systemDestructionFactors: "",
      commitmentToStandard: "yes",
      trustReason: "",
    },
  });
  const watchedValues = useWatch({ control: form.control });
  latestValuesRef.current = watchedValues || {};
  const watchedIdType = form.watch("idType");
  const watchedIdNumber = form.watch("idNumber");

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    const draft = window.localStorage.getItem(STORAGE_KEY);
    restoredDraftRef.current = true;
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft) as Partial<ApplicationFormData>;
      form.reset({
        ...form.getValues(),
        ...parsed,
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [form]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (submitting) return;
    if (!restoredDraftRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
      } catch {
        // Ignore storage failures and keep the form usable.
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(latestValuesRef.current));
      } catch {
        // Ignore storage failures and keep the form usable.
      }
    };
  }, [watchedValues, submitting]);

  useEffect(() => {
    if (watchedIdType !== "sa_id") return;
    const derived = deriveDateOfBirthFromSouthAfricanId(watchedIdNumber || "");
    form.setValue("dateOfBirth", derived, { shouldValidate: true, shouldDirty: true });
  }, [watchedIdNumber, watchedIdType, form]);

  const onSubmit = async (data: ApplicationFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("POST", "/api/td/application", data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/td/application-status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/td/gateway-session"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/coo/td-applications"] }),
      ]);
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      onSuccess?.();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 rounded-2xl border border-[#F1D2C7] bg-[#FFF6F1] p-5 text-sm text-[#5A5A5A]">
        <p>This is not a tutoring role. This is a system leadership role.</p>
        <p className="mt-3">TT is looking for calm, structured operators who can enforce standards directly and think in systems, not sessions.</p>
        <p className="mt-3 font-semibold text-[#1A1A1A]">If you avoid conflict or soften standards, this role is not for you.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error ? (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <div className="rounded-md border border-[#F1D2C7] bg-[#FFF6F1] px-3 py-2 text-xs text-[#7A675B]">
          Draft saves automatically on this device and restores when you return.
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Territory Director Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...form.register("fullName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" {...form.register("age")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountEmail">Account email</Label>
                <Input id="accountEmail" type="email" value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idType">Identification type</Label>
                <select id="idType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register("idType")}>
                  <option value="sa_id">South African ID</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">{form.watch("idType") === "passport" ? "Passport number" : "SA ID number"}</Label>
                <Input id="idNumber" {...form.register("idNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register("dateOfBirth")}
                  readOnly={watchedIdType === "sa_id"}
                />
                <p className="text-xs text-muted-foreground">
                  {watchedIdType === "passport"
                    ? "Enter your date of birth exactly as it appears on your passport."
                    : "Auto-derived from your South African ID number."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursAvailablePerWeek">Hours available per week</Label>
                <Input id="hoursAvailablePerWeek" type="number" {...form.register("hoursAvailablePerWeek")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taughtOrMentoredBefore">Have you taught or mentored before?</Label>
                <select id="taughtOrMentoredBefore" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register("taughtOrMentoredBefore")}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ledOrSupervisedOthers">Have you led or supervised others?</Label>
                <select id="ledOrSupervisedOthers" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register("ledOrSupervisedOthers")}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {questionFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Textarea id={field.key} rows={4} {...form.register(field.key)} />
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="commitmentToStandard">Q16. Are you willing to correct directly, enforce strict rules, and reject when necessary?</Label>
              <select id="commitmentToStandard" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register("commitmentToStandard")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          ) : <div />}
          <Button type="submit" disabled={submitting} className="gap-2" style={{ backgroundColor: "#E63946" }}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
