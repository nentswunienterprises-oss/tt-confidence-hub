import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(6, "ID number is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  reachIn7Days: z.string().min(20, "Be specific"),
  firstParents: z.string().min(20, "Be specific"),
  studentBreakdownCase: z.string().min(20, "Be specific"),
  marksSignal: z.string().min(20, "Please explain what it tells you"),
  extraLessonsResponse: z.string().min(20, "Please explain how you respond"),
  notRecommendCases: z.string().min(20, "Please explain when you would not recommend TT"),
  unclearProblemResponse: z.string().min(20, "Please explain what you do"),
  tenParentsFilter: z.string().min(20, "Please explain your filter"),
  firstAcademicQuestion: z.string().min(20, "Please explain what you want to understand first"),
  noEarningsResponse: z.string().min(20, "Please explain how your approach changes"),
  nextFiveDaysPlan: z.string().min(20, "Please be specific"),
  proceedReason: z.string().min(20, "Please explain why you still want to proceed"),
  trustReason: z.string().min(20, "Please explain why TT should trust you"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const sections: Array<{
  key: keyof ApplicationFormData;
  label: string;
  multiline?: boolean;
}> = [
  { key: "fullName", label: "Full name" },
  { key: "idNumber", label: "ID number" },
  { key: "phone", label: "Phone number" },
  { key: "email", label: "Email" },
  { key: "reachIn7Days", label: "Who exactly can you reach within the next 7 days? Be specific.", multiline: true },
  { key: "firstParents", label: "If you had to reach out to a few parents this week, who would come to mind first?", multiline: true },
  { key: "studentBreakdownCase", label: "Think of a student you've seen or heard about who struggles with school. What exactly was happening with them?", multiline: true },
  { key: "marksSignal", label: 'A parent says: "My child studies, but their marks don’t reflect it." What does this tell you?', multiline: true },
  { key: "extraLessonsResponse", label: 'A parent says: "We just want extra lessons to improve marks." How do you respond? Do you move forward or pause? Why?', multiline: true },
  { key: "notRecommendCases", label: "When would you NOT recommend a parent to Territorial Tutoring?", multiline: true },
  { key: "unclearProblemResponse", label: "If a parent is interested, but you cannot clearly identify a real problem, what do you do?", multiline: true },
  { key: "tenParentsFilter", label: "You speak to 10 parents. Only 2 clearly need help. What do you do with the other 8?", multiline: true },
  { key: "firstAcademicQuestion", label: "If you were speaking to a parent about their child’s academics, what would you want to understand first?", multiline: true },
  { key: "noEarningsResponse", label: "You haven’t earned anything in 2 weeks. What changes in your approach?", multiline: true },
  { key: "nextFiveDaysPlan", label: "In the next 5 days, how would you get 2–3 serious parent conversations? Be specific.", multiline: true },
  { key: "proceedReason", label: "This role has no salary, no guaranteed income, and payment only when students are accepted and retained. Do you still want to proceed? Why?", multiline: true },
  { key: "trustReason", label: "Why should TT trust you with access to parents?", multiline: true },
];

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AffiliateApplicationForm({ onSuccess, onCancel }: Props) {
  const STORAGE_KEY = "tt_affiliate_application_draft";
  const AUTOSAVE_DELAY_MS = 400;
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      phone: "",
      email: "",
      reachIn7Days: "",
      firstParents: "",
      studentBreakdownCase: "",
      marksSignal: "",
      extraLessonsResponse: "",
      notRecommendCases: "",
      unclearProblemResponse: "",
      tenParentsFilter: "",
      firstAcademicQuestion: "",
      noEarningsResponse: "",
      nextFiveDaysPlan: "",
      proceedReason: "",
      trustReason: "",
    },
  });
  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    const draft = window.localStorage.getItem(STORAGE_KEY);
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
    };
  }, [watchedValues, submitting]);

  const onSubmit = async (data: ApplicationFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("POST", "/api/affiliate/application", data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/affiliate/application-status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/affiliate/gateway-session"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/coo/affiliate-applications"] }),
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 rounded-2xl border border-[#F1D2C7] bg-[#FFF6F1] p-5">
        <p className="text-sm text-[#5A5A5A]">
          This is not a typical application. TT does not operate on volume. We operate on precision.
        </p>
        <p className="mt-3 text-sm text-[#5A5A5A]">
          We do not push services. We identify where students are already struggling and step in where there is real need.
        </p>
        <p className="mt-3 text-sm font-semibold text-[#1A1A1A]">
          This role is not a sales role.
        </p>
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
            <CardTitle>EGP Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {sections.map((section) => (
              <div key={section.key} className="space-y-2">
                <Label htmlFor={section.key}>{section.label}</Label>
                {section.multiline ? (
                  <Textarea id={section.key} rows={4} {...form.register(section.key)} />
                ) : (
                  <Input id={section.key} {...form.register(section.key)} />
                )}
              </div>
            ))}
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
