import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningWhatNotToDo() {
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
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                What Not To Do
              </h1>
              <p className="text-muted-foreground mt-1">under Execution Standards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Purpose */}
        <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Purpose</h2>
          <p className="text-muted-foreground">This is not a suggestion list.</p>
          <p className="text-muted-foreground">This is:</p>
          <p className="font-medium">what breaks the TT system</p>
          <p className="text-muted-foreground">If these behaviors appear consistently:</p>
          <p className="font-semibold">you are not running TT-OS</p>
        </Card>

        {/* 1. Do Not Rescue */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">1. Do Not Rescue</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">giving answers too early</p>
            <p className="text-muted-foreground">stepping in at the first sign of struggle</p>
            <p className="text-muted-foreground">finishing the student's thinking</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">discomfort feels uncomfortable</p>
            <p className="text-muted-foreground">tutor wants to help</p>
            <p className="text-muted-foreground">tutor wants progress to look smooth</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">dependency</p>
            <p className="text-muted-foreground">weak response patterns</p>
            <p className="text-muted-foreground">inability to handle difficulty alone</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">If you remove the struggle, you remove the training.</p>
          </div>
        </Card>

        {/* 2. Do Not Over-Explain */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">2. Do Not Over-Explain</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">long explanations mid-problem</p>
            <p className="text-muted-foreground">repeating concepts multiple times</p>
            <p className="text-muted-foreground">talking more than the student executes</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">tutor wants clarity</p>
            <p className="text-muted-foreground">tutor fears confusion</p>
            <p className="text-muted-foreground">tutor tries to "cover everything"</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">passive learning</p>
            <p className="text-muted-foreground">cognitive overload</p>
            <p className="text-muted-foreground">reduced execution</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">If the student is not doing, they are not learning.</p>
          </div>
        </Card>

        {/* 3. Do Not Take Over */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">3. Do Not Take Over</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">writing for the student</p>
            <p className="text-muted-foreground">solving steps yourself</p>
            <p className="text-muted-foreground">controlling the entire process</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">impatience</p>
            <p className="text-muted-foreground">desire for correct answers</p>
            <p className="text-muted-foreground">need to "move the session forward"</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">zero ownership</p>
            <p className="text-muted-foreground">no skill development</p>
            <p className="text-muted-foreground">false progress</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">The student must remain the one doing the work.</p>
          </div>
        </Card>

        {/* 4. Do Not Skip the 3-Layer Lens */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">4. Do Not Skip the 3-Layer Lens</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">teaching only steps</p>
            <p className="text-muted-foreground">ignoring vocabulary</p>
            <p className="text-muted-foreground">ignoring reasoning</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">rushing</p>
            <p className="text-muted-foreground">assuming understanding</p>
            <p className="text-muted-foreground">focusing on speed</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">confusion under pressure</p>
            <p className="text-muted-foreground">fragile knowledge</p>
            <p className="text-muted-foreground">inability to adapt</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">Every concept must pass through Vocabulary, Method, and Reason.</p>
          </div>
        </Card>

        {/* 5. Do Not Accept Vague Language */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">5. Do Not Accept Vague Language</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">"this thing"</p>
            <p className="text-muted-foreground">"that number"</p>
            <p className="text-muted-foreground">incomplete explanations</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">tutor lets it slide</p>
            <p className="text-muted-foreground">avoids correction</p>
            <p className="text-muted-foreground">prioritizes flow over precision</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">weak clarity</p>
            <p className="text-muted-foreground">poor communication</p>
            <p className="text-muted-foreground">unstable thinking</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">If language is imprecise, thinking is imprecise.</p>
          </div>
        </Card>

        {/* 6. Do Not Interrupt Thinking */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">6. Do Not Interrupt Thinking</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">speaking immediately when the student pauses</p>
            <p className="text-muted-foreground">filling silence</p>
            <p className="text-muted-foreground">guiding too quickly</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">silence feels uncomfortable</p>
            <p className="text-muted-foreground">tutor assumes they are stuck</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">no independent thinking</p>
            <p className="text-muted-foreground">no discomfort tolerance</p>
            <p className="text-muted-foreground">weak response conditioning</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">Silence is part of the system.</p>
          </div>
        </Card>

        {/* 7. Do Not Turn the Session into a Lecture */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">7. Do Not Turn the Session into a Lecture</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">tutor speaking most of the time</p>
            <p className="text-muted-foreground">student listening instead of executing</p>
            <p className="text-muted-foreground">long explanations without application</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">tutor feels responsible for "teaching"</p>
            <p className="text-muted-foreground">confusion about role</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">passive students</p>
            <p className="text-muted-foreground">no execution training</p>
            <p className="text-muted-foreground">poor retention</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">TT sessions are execution environments, not lectures.</p>
          </div>
        </Card>

        {/* 8. Do Not Prioritize Comfort */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">8. Do Not Prioritize Comfort</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">softening every difficult moment</p>
            <p className="text-muted-foreground">reassuring excessively</p>
            <p className="text-muted-foreground">avoiding challenge</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">desire to be liked</p>
            <p className="text-muted-foreground">fear of student frustration</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">avoidance habits</p>
            <p className="text-muted-foreground">emotional dependency</p>
            <p className="text-muted-foreground">inability to handle pressure</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">Comfort does not build capability.</p>
          </div>
        </Card>

        {/* 9. Do Not Chase Speed */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">9. Do Not Chase Speed</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">pushing students to go faster</p>
            <p className="text-muted-foreground">rushing through steps</p>
            <p className="text-muted-foreground">focusing on finishing quickly</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">pressure to show progress</p>
            <p className="text-muted-foreground">misunderstanding efficiency</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">careless errors</p>
            <p className="text-muted-foreground">skipped structure</p>
            <p className="text-muted-foreground">unstable execution</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">Stability first. Speed follows.</p>
          </div>
        </Card>

        {/* 10. Do Not Ignore Breakdown Patterns */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">10. Do Not Ignore Breakdown Patterns</h2>

          <div>
            <p className="font-semibold mb-2">What It Looks Like</p>
            <p className="text-muted-foreground">repeating the same correction</p>
            <p className="text-muted-foreground">ignoring recurring mistakes</p>
            <p className="text-muted-foreground">not diagnosing patterns</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Why It Happens</p>
            <p className="text-muted-foreground">lack of observation</p>
            <p className="text-muted-foreground">focus on immediate task</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What It Causes</p>
            <p className="text-muted-foreground">no real improvement</p>
            <p className="text-muted-foreground">repeated failure</p>
            <p className="text-muted-foreground">wasted sessions</p>
          </div>

          <div className="bg-muted rounded p-3">
            <p className="font-semibold text-sm uppercase tracking-wide mb-1">Rule</p>
            <p className="text-muted-foreground">Every repeated mistake is a signal.</p>
          </div>
        </Card>

        {/* The Pattern Behind All Failures */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Pattern Behind All Failures</h2>
          <p className="text-muted-foreground">Every mistake above comes from:</p>
          <p className="font-bold text-lg">prioritizing short-term ease over long-term capability</p>
        </Card>

        {/* The Standard */}
        <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Standard</h2>
          <p className="text-muted-foreground">TT prioritizes:</p>
          <ul className="space-y-2 pl-4 font-medium">
            <li>structure over comfort</li>
            <li>process over speed</li>
            <li>execution over explanation</li>
          </ul>
        </Card>

        {/* Final Principle */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Final Principle</h2>
          <p className="text-muted-foreground">Most tutors try to make sessions feel successful.</p>
          <p className="text-muted-foreground">TT ensures:</p>
          <p className="font-bold text-lg">students become capable</p>
        </Card>

        {/* Final Rule */}
        <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Final Rule</h2>
          <p className="text-muted-foreground">If your session feels:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>smooth</li>
            <li>easy</li>
            <li>fast</li>
          </ul>
          <p className="text-muted-foreground">But the student cannot:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>start independently</li>
            <li>follow steps</li>
            <li>stay calm under difficulty</li>
          </ul>
          <p className="text-muted-foreground">Then:</p>
          <p className="font-semibold">the system was not executed</p>
        </Card>

      </div>
    </div>
  );
}
