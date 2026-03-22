import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningControlledDiscomfort() {
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Controlled Discomfort
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What It Is</h2>
          <p className="text-muted-foreground">Controlled Discomfort is where:</p>
          <p className="font-medium">the student encounters difficulty without being rescued</p>
          <p className="text-muted-foreground">This is not teaching.</p>
          <p className="font-medium">This is response training.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Shift</h2>
          <p className="text-muted-foreground">From:</p>
          <p className="font-medium">"I can do it when it is familiar"</p>
          <p className="text-muted-foreground">To:</p>
          <p className="font-medium">"I can stay stable when it is unfamiliar"</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Tool</h2>
          <p className="font-medium">Boss Battles</p>
          <p className="text-muted-foreground">This is the mechanism.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Why This Phase Exists</h2>
          <p className="text-muted-foreground">Most students collapse not because:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>they do not understand</li>
            <li>they did not practice</li>
          </ul>
          <p className="text-muted-foreground">They collapse because:</p>
          <p className="text-muted-foreground">their first reaction to difficulty is unstable</p>
          <p className="text-muted-foreground">They:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>panic</li>
            <li>rush</li>
            <li>freeze</li>
            <li>guess</li>
          </ul>
          <p className="text-muted-foreground">And traditional tutoring:</p>
          <p className="text-muted-foreground">removes the difficulty before the response can be trained</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">TT Does the Opposite</h2>
          <p className="text-muted-foreground">We:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>introduce difficulty deliberately</li>
            <li>control the environment</li>
            <li>train the response</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What a Boss Battle Is</h2>
          <p className="text-muted-foreground">A Boss Battle is:</p>
          <p className="font-medium">a problem designed to trigger uncertainty</p>
          <p className="text-muted-foreground">Not impossible.</p>
          <p className="text-muted-foreground">Not unfair.</p>
          <p className="text-muted-foreground">Just:</p>
          <p className="font-medium">slightly beyond comfort</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">When to Introduce It</h2>
          <p className="text-muted-foreground">Only after:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>3-4 correct executions</li>
            <li>visible confidence</li>
            <li>stable method</li>
          </ul>
          <p className="font-medium">Rule:</p>
          <p className="font-medium">Do NOT introduce difficulty during confusion.</p>
          <p className="text-muted-foreground">You introduce it during:</p>
          <p className="font-medium">false comfort</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Moment That Matters</h2>
          <p className="text-muted-foreground">The second the student sees the problem.</p>
          <p className="text-muted-foreground">Before they speak.</p>
          <p className="text-muted-foreground">Before they act.</p>
          <p className="text-muted-foreground">You are watching:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>pause</li>
            <li>facial reaction</li>
            <li>breathing</li>
            <li>body language</li>
            <li>first move</li>
          </ul>
          <p className="font-medium">This is the raw response pattern</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Most Important Rule</h2>
          <p className="font-medium">Do Not Rescue</p>
          <p className="text-muted-foreground">When discomfort appears:</p>
          <p className="font-medium">You do nothing.</p>
          <p className="font-medium">For 10-15 seconds.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Why This Matters</h2>
          <p className="text-muted-foreground">That silence is where:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>panic shows</li>
            <li>habits surface</li>
            <li>conditioning begins</li>
          </ul>
          <p className="text-muted-foreground">If you interrupt:</p>
          <p className="font-medium">you destroy the moment</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Weak Tutors Do</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"Let me help you..."</li>
            <li>"It is actually not that hard..."</li>
            <li>"Just do this first..."</li>
          </ul>
          <p className="text-muted-foreground">They remove pressure.</p>
          <p className="font-medium">They remove training.</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">What TT Tutors Do</h2>
          <p className="text-muted-foreground">They hold the space.</p>
          <p className="text-muted-foreground">Calm.</p>
          <p className="text-muted-foreground">Still.</p>
          <p className="font-medium">Observing.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">After the Pause</h2>
          <p className="text-muted-foreground">Now you guide.</p>
          <p className="text-muted-foreground">Not the solution.</p>
          <p className="font-medium">The first step.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What You Say</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"What do you know?"</li>
            <li>"What type of problem is this?"</li>
            <li>"Start with what you recognize."</li>
          </ul>
          <p className="text-muted-foreground">What You Are Doing</p>
          <p className="font-medium">You are teaching:</p>
          <p className="font-medium">movement under uncertainty</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What You Are NOT Doing</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>solving</li>
            <li>explaining everything</li>
            <li>reducing difficulty</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Student's Experience</h2>
          <p className="text-muted-foreground">At first:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>discomfort</li>
            <li>resistance</li>
            <li>hesitation</li>
          </ul>
          <p className="text-muted-foreground">Then:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>small movement</li>
            <li>first step</li>
            <li>partial clarity</li>
          </ul>
          <p className="text-muted-foreground">Then:</p>
          <p className="font-medium">continued execution</p>
          <p className="text-muted-foreground">This is the shift</p>
          <p className="text-muted-foreground">From:</p>
          <p className="font-medium">"I need help"</p>
          <p className="text-muted-foreground">To:</p>
          <p className="font-medium">"I can start"</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Debrief (Critical)</h2>
          <p className="text-muted-foreground">After the attempt:</p>
          <p className="text-muted-foreground">You do not just check the answer.</p>
          <p className="font-medium">You name the behaviour.</p>
          <p className="text-muted-foreground">What You Say</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"You paused."</li>
            <li>"You identified the problem type."</li>
            <li>"You started with what you knew."</li>
            <li>"That is the response."</li>
          </ul>
          <p className="text-muted-foreground">Why This Matters</p>
          <p className="font-medium">You are reinforcing:</p>
          <p className="font-medium">process over result</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What This Phase Builds</h2>
          <h3 className="text-xl font-semibold">1. Tolerance</h3>
          <p className="text-muted-foreground">They stay in difficulty longer</p>
          <h3 className="text-xl font-semibold">2. Initiation</h3>
          <p className="text-muted-foreground">They start without waiting</p>
          <h3 className="text-xl font-semibold">3. Control</h3>
          <p className="text-muted-foreground">They do not rush or panic</p>
          <h3 className="text-xl font-semibold">4. Trust in System</h3>
          <p className="text-muted-foreground">They rely on steps, not emotion</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Common Failure Modes</h2>
          <p className="font-medium">Early Rescue</p>
          <p className="text-muted-foreground">Tutor jumps in too fast.</p>
          <p className="text-muted-foreground">Training never happens.</p>
          <p className="font-medium">Over-Guiding</p>
          <p className="text-muted-foreground">Tutor gives too many hints.</p>
          <p className="text-muted-foreground">Student follows, but does not think.</p>
          <p className="font-medium">Emotional Softening</p>
          <p className="text-muted-foreground">Tutor says:</p>
          <p className="font-medium">"It is okay, do not stress..."</p>
          <p className="text-muted-foreground">This reinforces fragility.</p>
          <p className="font-medium">Wrong Timing</p>
          <p className="text-muted-foreground">Boss Battle introduced:</p>
          <p className="text-muted-foreground">too early -&gt; overwhelm</p>
          <p className="text-muted-foreground">too late -&gt; no impact</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Correct Behaviour</h2>
          <p className="text-muted-foreground">You are:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>calm</li>
            <li>observant</li>
            <li>minimal</li>
            <li>precise</li>
          </ul>
          <p className="text-muted-foreground">You are not:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>reactive</li>
            <li>talkative</li>
            <li>comforting</li>
            <li>rushing</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Core Principle</h2>
          <p className="font-medium">Controlled Discomfort is:</p>
          <p className="font-medium">pressure without chaos</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Relationship to Other Phases</h2>
          <p className="text-muted-foreground">Without Structured Execution:</p>
          <p className="font-medium">Student has nothing to rely on</p>
          <p className="text-muted-foreground">Without Controlled Discomfort:</p>
          <p className="font-medium">Execution remains fragile</p>
          <p className="text-muted-foreground">Without This Phase:</p>
          <p className="font-medium">Pressure will always break them</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Mastery Looks Like</h2>
          <p className="text-muted-foreground">You will see:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>shorter hesitation</li>
            <li>quicker first step</li>
            <li>less emotional reaction</li>
            <li>more stable execution</li>
          </ul>
          <p className="text-muted-foreground">The student begins to treat difficulty as:</p>
          <p className="font-medium">normal</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Hidden Outcome</h2>
          <p className="text-muted-foreground">This phase rewires:</p>
          <p className="font-medium">the meaning of difficulty</p>
          <p className="text-muted-foreground">From:</p>
          <p className="font-medium">"something is wrong"</p>
          <p className="text-muted-foreground">To:</p>
          <p className="font-medium">"execute the system"</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Final Principle</h2>
          <p className="text-muted-foreground">You are not making the student uncomfortable.</p>
          <p className="text-muted-foreground">You are:</p>
          <p className="font-medium">removing their dependence on comfort</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Final Rule</h2>
          <p className="text-muted-foreground">If the student never feels:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>uncertainty</li>
            <li>hesitation</li>
            <li>difficulty</li>
          </ul>
          <p className="text-muted-foreground">Then:</p>
          <p className="font-medium">you are not conditioning response</p>
          <p className="text-muted-foreground">You are just teaching.</p>
          <p className="text-muted-foreground">And TT is not teaching.</p>
          <p className="font-medium">It is conditioning.</p>
        </Card>
      </div>
    </div>
  );
}