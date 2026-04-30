import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const handoverRules = [
  "Keep the student's original intro diagnosis as history.",
  "Preserve the active topic-state unless verification proves it is wrong.",
  "Use handover to verify continuity, not to restart the student.",
  "Reopen full training systems only after the continuity check is complete.",
];

const outcomes = [
  {
    title: "State holds",
    detail: "Continue training from the inherited topic, phase, and stability.",
  },
  {
    title: "State needs adjustment",
    detail: "Adjust stability or tighten the next topic action without resetting onboarding.",
  },
  {
    title: "State is clearly mismatched",
    detail: "Run more targeted verification before continuing.",
  },
];

export default function ResponseConditioningHandoverVerification() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/responseconditioningsystem")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Response Conditioning System
          </Button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <RefreshCcw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Handover Verification
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-4 border-2 border-primary/20 bg-primary/5">
          <h2 className="text-2xl font-bold">What This Session Is</h2>
          <p className="text-muted-foreground">
            Handover verification happens when a student moves to a new tutor after already entering
            training. It exists to verify continuity, not to wipe history.
          </p>
          <p className="text-lg font-semibold">
            The student is continuing. The new tutor is verifying where to continue from.
          </p>
          <p className="font-semibold">
            In handover, the tutor does not choose the student's state by instinct. The tutor runs
            the verification block, logs honestly, and follows the verification result.
          </p>
          <p className="text-sm text-muted-foreground">
            See <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/drill-library">Drill Library</Link> for the verification structure and{" "}
            <Link className="underline underline-offset-2" to="/responseconditioningsystem/session-infrastructure/logging-system">Logging System</Link> for how continuity-check evidence is recorded.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Why It Exists</h2>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            <li>Protects inherited topic-state from being ignored.</li>
            <li>Protects the student from being re-onboarded unnecessarily.</li>
            <li>Gives the new tutor enough proof to continue with confidence.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            That proof is not for free interpretation. It is there so the tutor can follow the
            verification outcome cleanly.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Live Handover Flow</h2>
          <ol className="space-y-1 pl-5 text-muted-foreground">
            <li>1. Review the inherited topic, phase, and stability.</li>
            <li>2. Confirm the continuity-check booking.</li>
            <li>3. Run the short verification on the active topic-state.</li>
            <li>4. Follow the verification result: the inherited state either holds, needs tightening, or needs deeper verification.</li>
            <li>5. Mark handover complete so normal training systems reopen.</li>
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">What The Tutor Must Preserve</h2>
          <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
            {handoverRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Possible Outcomes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {outcomes.map((outcome) => (
              <div key={outcome.title} className="rounded-xl border bg-card p-4">
                <h3 className="text-lg font-semibold">{outcome.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-2 border-primary/20 space-y-4">
          <h2 className="text-2xl font-bold">Tutor Standard</h2>
          <p className="text-muted-foreground">
            If a tutor change happens, the system should still feel continuous for the student and
            defensible for the tutor.
          </p>
          <p className="font-semibold">
            Handover verification protects continuity without pretending the student is brand new.
          </p>
          <p className="text-sm text-muted-foreground">
            The tutor's job is not to re-judge the student from scratch. The tutor's job is to run
            the continuity check properly and follow what it shows.
          </p>
        </Card>
      </div>
    </div>
  );
}
