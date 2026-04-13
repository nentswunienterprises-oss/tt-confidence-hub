import { useNavigate } from "react-router-dom";
import { ArrowLeft, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningSessionFlowControl() {
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
              <Workflow className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Session Flow Control
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">THE TRANSFORMATION PROCESS</h2>
          <p className="text-muted-foreground">
            The Transformation Process is how TT conditions reliable responses to difficult math problems.
          </p>
          <p className="font-medium">It consists of four components.</p>
          <p className="text-lg font-semibold">
            3-Layer Lens (clarity)
            <br />+
            <br />Model - Apply - Guide (structured execution)
            <br />+
            <br />Boss Battles (controlled discomfort)
            <br />+
            <br />Timed Execution (pressure stability)
            <br />=
            <br />Conditioned Response
          </p>
          <p className="font-medium">Each component serves a specific purpose.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">1 - The 3-Layer Lens</h2>
          <p className="text-muted-foreground">The 3-Layer Lens is used to teach and diagnose every concept.</p>

          <div className="border-l-4 border-primary pl-4 space-y-2">
            <h3 className="text-xl font-bold">Vocabulary</h3>
            <p className="text-muted-foreground">Students must understand the terms used in the problem.</p>
            <p className="font-medium">Tutors ask:</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>"What is this part called?"</li>
              <li>"What does this term mean?"</li>
            </ul>
            <p className="font-semibold">
              Without vocabulary clarity, students cannot interpret the problem correctly.
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4 space-y-2">
            <h3 className="text-xl font-bold">Method</h3>
            <p className="text-muted-foreground">Students must follow a clear, repeatable sequence of steps.</p>
            <p className="font-medium">Tutor asks:</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>"What is the first step?"</li>
              <li>"What happens next?"</li>
            </ul>
            <p className="font-semibold">Students should learn methods as structured procedures, not guesses.</p>
          </div>

          <div className="border-l-4 border-primary pl-4 space-y-2">
            <h3 className="text-xl font-bold">Reason</h3>
            <p className="text-muted-foreground">Students must understand why the method works.</p>
            <p className="font-medium">Tutor questions:</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>"Why does this step work?"</li>
              <li>"Why do we divide here?"</li>
            </ul>
            <p className="font-semibold">Reasoning prevents blind memorization.</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">2 - Model, Apply, Guide</h2>
          <p className="text-muted-foreground">This loop is how skills are learned during the session.</p>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">Model</h3>
            <p className="text-muted-foreground">The tutor solves a problem out loud.</p>
            <p className="font-medium">The tutor clearly states:</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>the vocabulary</li>
              <li>the steps</li>
              <li>the reasoning</li>
            </ul>
            <p className="font-semibold">The student observes.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">Apply</h3>
            <p className="text-muted-foreground">The student attempts a similar problem.</p>
            <p className="font-medium">The tutor does not take over.</p>
            <p className="font-medium">Struggle is allowed.</p>
            <p className="font-semibold">This stage builds ownership of the method.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">Guide</h3>
            <p className="text-muted-foreground">The tutor corrects and refines the student's attempt.</p>
            <p className="font-medium">The tutor identifies which learning layer broke:</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>Vocabulary</li>
              <li>Method</li>
              <li>Reason</li>
            </ul>
            <p className="font-semibold">Then the tutor fixes that specific layer.</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">3 - Boss Battles</h2>
          <p className="text-muted-foreground">
            Once the student understands the concept, introduce a harder problem.
          </p>
          <p className="font-medium">This is called a Boss Battle.</p>
          <p className="font-medium">Boss Battles test whether the student can:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>recognize the concept</li>
            <li>follow the method</li>
            <li>explain the reasoning</li>
          </ul>
          <p className="font-semibold">without assistance.</p>
          <p className="text-muted-foreground">
            Boss Battles simulate the moment when difficulty increases unexpectedly.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">4 - Timed Execution</h2>
          <p className="text-muted-foreground">As students improve, Boss Battles become timed.</p>
          <p className="font-medium">This introduces controlled pressure.</p>
          <p className="font-medium">Students must:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>read the question carefully</li>
            <li>identify known information</li>
            <li>execute the method calmly</li>
          </ul>
          <p className="font-semibold">The goal is to train stable execution under pressure.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">THE SESSION OPERATING SYSTEM</h2>
          <p className="text-muted-foreground">Every TT tutoring session follows the same structure.</p>
          <ol className="space-y-1 pl-4">
            <li>1. Prepare</li>
            <li>2. Model</li>
            <li>3. Apply</li>
            <li>4. Guide</li>
            <li>5. Boss Battle</li>
          </ol>
          <p className="font-semibold">This sequence repeats every session.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Step 1 - Prepare</h2>
          <p className="font-medium">Before the session begins:</p>
          <p className="font-medium">The tutor reviews:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>the student's previous session notes</li>
            <li>previous Boss Battles</li>
            <li>areas needing reinforcement</li>
          </ul>
          <p className="font-semibold">The tutor selects one clear concept for the session.</p>
          <p className="text-muted-foreground">Preparation prevents improvisation.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Step 2 - Model</h2>
          <p className="text-muted-foreground">
            The tutor demonstrates the concept using the 3-Layer Lens.
          </p>
          <p className="font-medium">The tutor:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>writes the example clearly</li>
            <li>explains each step</li>
            <li>explains the reasoning</li>
          </ul>
          <p className="font-semibold">Students see exactly what correct execution looks like.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Step 3 - Apply</h2>
          <p className="text-muted-foreground">The student attempts a similar problem.</p>
          <p className="font-medium">The tutor observes carefully.</p>
          <p className="font-semibold">This is where learning actually happens.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Step 4 - Guide</h2>
          <p className="text-muted-foreground">The tutor corrects the student's work.</p>
          <p className="font-medium">The tutor identifies which layer broke:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>Vocabulary</li>
            <li>Method</li>
            <li>Reason</li>
          </ul>
          <p className="font-semibold">Then the tutor reinforces that layer.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Step 5 - Boss Battle</h2>
          <p className="text-muted-foreground">An intentionally more difficult challenge... still solvable.</p>
          <p className="font-medium">The student attempts it independently.</p>
          <p className="font-semibold">This confirms whether the skill is stabilizing.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">The Core Response Protocol</h2>
          <p className="text-muted-foreground">
            When a student encounters a difficult problem, they are trained to follow this sequence.
          </p>
          <ol className="space-y-1 pl-4">
            <li>1. Read the full question</li>
            <li>2. Identify what is known</li>
            <li>3. Select the first step of the method</li>
            <li>4. Execute calmly</li>
            <li>5. Continue step by step</li>
          </ol>
          <p className="font-medium">This response pattern is practiced repeatedly.</p>
          <p className="font-semibold">
            Over time, the student stops freezing and begins executing automatically.
          </p>
        </Card>

        <Card className="p-6 border-2 border-primary/20 space-y-4">
          <h2 className="text-2xl font-bold">The Standard</h2>
          <p className="font-medium">TT tutors are not improvising teachers.</p>
          <p className="font-semibold">They are operators of a system.</p>
          <p className="text-muted-foreground">Every session must follow the same structure.</p>
          <p className="text-muted-foreground">Every concept must be taught through the 3-Layer Lens.</p>
          <p className="text-muted-foreground">Every session must include independent execution.</p>
          <p className="font-semibold">Consistency is what produces reliable outcomes.</p>
        </Card>

        <Card className="p-6 bg-primary/5 border-primary/30 border-2 space-y-4">
          <h2 className="text-2xl font-bold">The TT Principle</h2>
          <p className="text-muted-foreground">Schools teach concepts.</p>
          <p className="text-muted-foreground">Tutors explain methods.</p>
          <p className="font-semibold">
            Territorial Tutoring trains execution when difficulty appears.
          </p>
          <p className="font-medium">Math is the arena.</p>
          <p className="font-medium">Pressure is the environment.</p>
          <p className="text-lg font-semibold">Response is the craft.</p>
        </Card>
      </div>
    </div>
  );
}
