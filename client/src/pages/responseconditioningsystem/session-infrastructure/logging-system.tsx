import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function ResponseConditioningLoggingSystem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
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
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Logging System
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 md:p-8 border-2 border-primary/20 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Training Record</Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">How We Record and Log Every Session</h2>
            <p className="text-muted-foreground max-w-3xl">
              This is a reader-friendly TT interpretation of the live tutor session form. The layout below mirrors
              the real structure, but it is filled with sample content so the logic of each section is obvious.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/60 p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Log New Session</h3>
                <p className="text-sm text-muted-foreground">
                  Record the session using the 3-Layer Lens Teaching Model
                </p>
              </div>
              <Badge variant="outline">Demo entry</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Input readOnly value="Maya R. - Grade 7" />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input readOnly value="55" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Notes</Label>
              <Textarea
                readOnly
                rows={4}
                value="Covered multiplying fractions. Student understood the method after modelling, but initially rushed the second step and skipped simplification. Stability improved after guided correction."
              />
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">3-Layer Solutions Implemented</p>
                  <p className="text-sm text-muted-foreground">Core intervention record</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">On</span>
                  <Switch checked disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>What solution (describe the purpose)?</Label>
                <Textarea
                  readOnly
                  rows={3}
                  value="Step-by-step fraction multiplication script. Purpose: stop random skipping of steps and stabilize the execution sequence when the student sees multiple moving parts."
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Vocabulary Notes</Label>
                  <Textarea
                    readOnly
                    rows={5}
                    value="Taught numerator, denominator, reciprocal, simplify. Student confused reciprocal with inverse and could not define denominator clearly at first."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method Notes</Label>
                  <Textarea
                    readOnly
                    rows={5}
                    value="Method taught: multiply numerators, multiply denominators, simplify final answer. Student remembered steps 1 and 2 but forgot to simplify unless prompted."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason Notes</Label>
                  <Textarea
                    readOnly
                    rows={5}
                    value="Explained that multiplying fractions scales one quantity by part of another. Student could follow the steps but could not explain why cross-cancellation works."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Student Response</Label>
              <Textarea
                readOnly
                rows={3}
                value="Student was hesitant at first and kept asking for confirmation before each step. Became more stable after the second guided attempt. Did not freeze during Boss Battle, but slowed noticeably."
              />
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Any Challenges?</p>
                  <p className="text-sm text-muted-foreground">Mini diagnostic record</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">On</span>
                  <Switch checked disabled />
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>1. What was misunderstood?</Label>
                  <Textarea
                    readOnly
                    rows={4}
                    value="Student thought dividing fractions means dividing top numbers and bottom numbers separately."
                  />
                </div>
                <div className="space-y-2">
                  <Label>2. What correction helped?</Label>
                  <Textarea
                    readOnly
                    rows={4}
                    value="Using the reciprocal rule visually and repeating the written method line by line helped stabilize execution."
                  />
                </div>
                <div className="space-y-2">
                  <Label>3. What needs to be reinforced?</Label>
                  <Textarea
                    readOnly
                    rows={4}
                    value="Student still needs reinforcement on when to simplify before versus after multiplying."
                  />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Boss Battles / Practice Problems</Label>
                <Textarea
                  readOnly
                  rows={4}
                  value="Boss Battle completed on multiplying fractions with mixed numbers. Student completed independently but hesitated on conversion step. Assigned 4 follow-up problems focused on mixed number conversion."
                />
              </div>
              <div className="rounded-xl border border-dashed bg-background p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Supporting fields in live form</Badge>
                  <Badge variant="secondary">Not part of TT spine</Badge>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Also present in the live /sessions form:</p>
                  <ul className="space-y-1 pl-4 text-sm text-muted-foreground">
                    <li>Tech challenges</li>
                    <li>Tutor growth reflection</li>
                    <li>Administrative metadata like student and duration</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  Useful, and still required, but secondary. The TT core is the training record: what was trained, what broke,
                  what corrected it, and what happens next.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">TT Logging System</h2>
          <h3 className="text-xl font-bold">Purpose</h3>
          <p className="font-medium">The logging system exists to do 5 things:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>Preserve what happened in the session</li>
            <li>Identify what actually worked</li>
            <li>Track where the student broke down</li>
            <li>Define what must be reinforced next</li>
            <li>Give the next session a clear starting point</li>
          </ul>
          <p className="font-semibold">
            If a tutor cannot log clearly, they are not operating the system properly.
          </p>
        </Card>

        <Card className="p-6 space-y-4 border-2 border-primary/20">
          <h2 className="text-2xl font-bold">The Core Rule</h2>
          <p className="font-medium">A TT log must answer this:</p>
          <p className="text-xl font-semibold">
            What was trained, what broke, what corrected it, and what happens next?
          </p>
          <p className="font-medium">That's the whole point.</p>
          <p className="text-muted-foreground">Not a diary.</p>
          <p className="text-muted-foreground">Not a story.</p>
          <p className="text-muted-foreground">Not random notes.</p>
          <p className="text-lg font-semibold">A training record.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Structure of the Log</h2>
          <p className="text-muted-foreground"></p>
          <p className="font-semibold">The log has 8 functional parts.</p>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">1. Session Notes</h2>
            <p className="font-medium">What this section is for</p>
            <p className="text-muted-foreground">A short factual summary of what happened in the session.</p>
            <p className="font-medium">What belongs here</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>topic covered</li>
              <li>key skill trained</li>
              <li>major breakthrough or major difficulty</li>
              <li>whether the student was stable, hesitant, rushed, or confused</li>
            </ul>
            <p className="font-medium">What good looks like</p>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              "Covered multiplying fractions. Student understood the method after modelling, but initially
              rushed the second step and skipped simplification. Stability improved after guided correction."
            </p>
            <p className="font-medium">What bad looks like</p>
            <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
              "We had a nice session and did fractions."
            </p>
            <p className="text-muted-foreground">Too vague. Useless.</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">2. 3-Layer Solutions Implemented</h2>
            <p className="font-semibold">This is one of the most important sections in the whole system.</p>
            <p className="font-medium">What this section is for</p>
            <p className="text-muted-foreground">To record the actual intervention used.</p>
            <p className="text-muted-foreground">Not just what topic was taught. What solution was applied to fix the student's breakdown.</p>
            <p className="font-medium">What belongs here</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>the teaching solution used</li>
              <li>the purpose of that solution</li>
              <li>the problem it was solving</li>
            </ul>
            <p className="font-medium">Example</p>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
              <p>Solution: Step-by-step fraction multiplication script</p>
              <p>Purpose: To stop random skipping of steps</p>
              <p>Problem solved: Student knew the terms but had no stable method sequence</p>
            </div>
            <p className="font-semibold">This section answers: What did the tutor do on purpose?</p>
            <p className="text-muted-foreground">Because TT is not freestyle tutoring. It is intervention-based tutoring.</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">3. Vocabulary Notes</h2>
            <p className="font-medium">What this section is for</p>
            <p className="text-muted-foreground">To record the language layer.</p>
            <p className="font-medium">What belongs here</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>terms taught</li>
              <li>terms misunderstood</li>
              <li>terms that need reinforcement</li>
            </ul>
            <p className="font-medium">Example</p>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              "Taught numerator, denominator, reciprocal, simplify. Student confused reciprocal with inverse
              and could not define denominator clearly at first."
            </p>
            <p className="text-muted-foreground">
              This matters because vocabulary errors often look like weak math, when actually the student just
              does not understand the language of the problem.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">4. Method Notes</h2>
            <p className="font-medium">What this section is for</p>
            <p className="text-muted-foreground">To record the step-by-step process taught in session.</p>
            <p className="font-medium">What belongs here</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>exact sequence used</li>
              <li>where the student broke in the sequence</li>
              <li>whether the student could repeat the method independently</li>
            </ul>
            <p className="font-medium">Example</p>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              "Method taught: multiply numerators, multiply denominators, simplify final answer. Student
              remembered step 1 and 2 but forgot to simplify unless prompted."
            </p>
            <p className="font-semibold">This is critical.</p>
            <p className="text-muted-foreground">Because method is where execution becomes repeatable.</p>
            <p className="text-muted-foreground">If method notes are weak, next session starts blind.</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">5. Reason Notes</h2>
            <p className="font-medium">What this section is for</p>
            <p className="text-muted-foreground">To record the logic layer.</p>
            <p className="font-medium">What belongs here</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>the why explained</li>
              <li>whether the student could justify the method</li>
              <li>where reasoning broke down</li>
            </ul>
            <p className="font-medium">Example</p>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              "Explained that multiplying fractions scales one quantity by part of another. Student could follow
              steps but could not explain why cross-cancellation works."
            </p>
            <p className="text-muted-foreground">This section separates memorization from mastery.</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">6. Student Response</h2>
            <p className="font-semibold">This is not about feelings in a soft sense. It is about performance posture.</p>
            <p className="font-medium">What this section is for</p>
            <p className="text-muted-foreground">To record how the student responded during the session.</p>
            <p className="font-medium">What belongs here</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>calm / stable / hesitant / avoidant / rushed / frozen</li>
              <li>how they reacted to difficulty</li>
              <li>whether they recovered after correction</li>
            </ul>
            <p className="font-medium">Example</p>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              "Student was hesitant at first and kept asking for confirmation before each step. Became more
              stable after second guided attempt. Did not freeze during Boss Battle, but slowed noticeably."
            </p>
            <p className="font-semibold">This is huge for TT.</p>
            <p className="text-muted-foreground">Because TT is not just tracking correctness. It is tracking response behavior.</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">7. Any Challenges?</h2>
            <p className="font-semibold">This section is the breakdown record.</p>
            <p className="text-muted-foreground">It should be treated like a mini diagnostic report.</p>
            <p className="font-medium">It has 3 parts.</p>
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="font-semibold">A. What was misunderstood?</p>
                <p className="text-sm text-muted-foreground">Record the exact misunderstanding.</p>
                <p className="text-sm">Example: "Student thought dividing fractions means dividing top numbers and bottom numbers separately."</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="font-semibold">B. What correction helped?</p>
                <p className="text-sm text-muted-foreground">Record the exact intervention that moved the student.</p>
                <p className="text-sm">Example: "Using the reciprocal rule visually and repeating the written method line by line helped stabilize execution."</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="font-semibold">C. What needs to be reinforced?</p>
                <p className="text-sm text-muted-foreground">Record the next focus point.</p>
                <p className="text-sm">Example: "Student still needs reinforcement on when to simplify before versus after multiplying."</p>
              </div>
            </div>
            <p className="font-semibold">This section is where future training is born.</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">8. Boss Battles / Practice Problems</h2>
            <p className="font-medium">What this section is for</p>
            <p className="text-muted-foreground">To record independent execution.</p>
            <p className="font-medium">What belongs here</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>whether a Boss Battle was attempted</li>
              <li>whether it was passed, struggled through, or failed</li>
              <li>what practice was assigned</li>
            </ul>
            <p className="font-medium">Example</p>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              "Boss Battle completed on multiplying fractions with mixed numbers. Student completed independently
              but hesitated on conversion step. Assigned 4 follow-up problems focused on mixed number conversion."
            </p>
            <p className="text-muted-foreground">This tells you if the concept is actually stabilizing.</p>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Hidden Logic of the Whole Logging System</h2>
          <p className="font-medium">Every log should move through this sequence:</p>
          <ol className="space-y-1 pl-4">
            <li>1. What did we train?</li>
            <li>2. What happened when the student tried?</li>
            <li>3. What corrected the breakdown?</li>
            <li>4. What remains unstable?</li>
            <li>5. What happens next?</li>
          </ol>
          <p className="text-muted-foreground">Topic, skill, layer, solution</p>
          <p className="text-muted-foreground">Response, confusion, stability, mistakes</p>
          <p className="text-muted-foreground">Specific teaching move</p>
          <p className="text-muted-foreground">Reinforcement point</p>
          <p className="text-muted-foreground">Boss Battle, practice, next session focus</p>
          <p className="font-semibold">That's the TT logging rhythm.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Standard for Good Logs</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-green-500/5 border-green-500/20 p-4 space-y-2">
              <p className="font-semibold">A good log is:</p>
              <ul className="space-y-1 pl-4 text-muted-foreground">
                <li>specific</li>
                <li>diagnostic</li>
                <li>useful for the next tutor or next session</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-red-500/5 border-red-500/20 p-4 space-y-2">
              <p className="font-semibold">A bad log is:</p>
              <ul className="space-y-1 pl-4 text-muted-foreground">
                <li>emotional</li>
                <li>vague</li>
                <li>descriptive without conclusions</li>
                <li>full of filler</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-primary/5 border-primary/30 border-2 space-y-4">
          <h2 className="text-2xl font-bold">The TT Logging Formula</h2>
          <p className="font-medium">Every tutor should mentally log using this formula:</p>
          <p className="text-xl font-semibold">
            Skill trained
            <br />-&gt; layer broken
            <br />-&gt; correction used
            <br />-&gt; response observed
            <br />-&gt; reinforcement needed
          </p>
          <p className="font-semibold">That's the spine.</p>
        </Card>
      </div>
    </div>
  );
}