import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningStructuredExecution() {
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
                Phase 2 - Structured Execution
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What It Is</h2>
          <p className="text-muted-foreground">Structured Execution is the phase where:</p>
          <p className="font-medium">understanding is forced into action</p>
          <p className="text-muted-foreground">The student stops watching.</p>
          <p className="text-muted-foreground">Stops agreeing.</p>
          <p className="text-muted-foreground">Stops saying "I get it."</p>
          <p className="font-medium">They execute.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Shift</h2>
          <p className="text-muted-foreground">From:</p>
          <p className="font-medium">"I understand what you did"</p>
          <p className="text-muted-foreground">To:</p>
          <p className="font-medium">"I can do it myself, step-by-step"</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Tool</h2>
          <p className="font-medium">Model -&gt; Apply -&gt; Guide</p>
          <p className="text-muted-foreground">This is not a suggestion.</p>
          <p className="font-medium">It is the only sequence.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Why This Phase Exists</h2>
          <p className="text-muted-foreground">Most students:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>follow explanations</li>
            <li>recognize patterns</li>
            <li>feel confident</li>
          </ul>
          <p className="text-muted-foreground">But when left alone:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>hesitate</li>
            <li>forget steps</li>
            <li>guess</li>
          </ul>
          <p className="text-muted-foreground">Because:</p>
          <p className="text-muted-foreground">they were never forced to execute immediately</p>
          <p className="font-medium">Structured Execution fixes this</p>
          <p className="text-muted-foreground">By enforcing:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>immediate action</li>
            <li>repetition</li>
            <li>correction at point of failure</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">The Three Components</h2>

          <h3 className="text-xl font-semibold">1. Model (You Execute Clearly)</h3>
          <p className="text-muted-foreground">Purpose:</p>
          <p className="font-medium">Create a perfect reference</p>
          <p className="text-muted-foreground">What You Do:</p>
          <p className="text-muted-foreground">You solve one problem through:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Vocabulary</li>
            <li>Method</li>
            <li>Reason</li>
          </ul>
          <p className="text-muted-foreground">No shortcuts.</p>
          <p className="text-muted-foreground">No skipping.</p>
          <p className="text-muted-foreground">What You Are Creating:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>a visible structure</li>
            <li>a repeatable pattern</li>
            <li>a mental template</li>
          </ul>
          <p className="font-medium">Rule:</p>
          <p className="font-medium">If your model is unclear, their execution will collapse.</p>

          <h3 className="text-xl font-semibold">2. Apply (They Execute Immediately)</h3>
          <p className="text-muted-foreground">Purpose:</p>
          <p className="font-medium">Force action while the model is still fresh</p>
          <p className="text-muted-foreground">What You Do:</p>
          <p className="text-muted-foreground">You give:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>2-3 similar problems</li>
            <li>immediately</li>
          </ul>
          <p className="text-muted-foreground">No delay.</p>
          <p className="text-muted-foreground">No extra explanation.</p>
          <p className="text-muted-foreground">What You Say:</p>
          <p className="font-medium">"Now you do this one."</p>
          <p className="text-muted-foreground">Then:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>they name</li>
            <li>they execute</li>
            <li>they explain</li>
          </ul>
          <p className="text-muted-foreground">What You Are Watching:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>do they hesitate?</li>
            <li>do they follow steps?</li>
            <li>do they skip?</li>
          </ul>
          <p className="font-medium">Rule:</p>
          <p className="font-medium">No passive learning.</p>
          <p className="font-medium">If they are not executing:</p>
          <p className="font-medium">the system is not running</p>

          <h3 className="text-xl font-semibold">3. Guide (You Correct Precisely)</h3>
          <p className="text-muted-foreground">Purpose:</p>
          <p className="font-medium">Repair breakdowns in real-time</p>
          <p className="text-muted-foreground">What You Do:</p>
          <p className="text-muted-foreground">You do NOT:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>re-teach everything</li>
            <li>restart the lesson</li>
            <li>take over</li>
          </ul>
          <p className="text-muted-foreground">You:</p>
          <p className="text-muted-foreground">identify the exact layer that failed</p>
          <p className="text-muted-foreground">Then fix only that.</p>
          <p className="text-muted-foreground">Your Process:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Observe the error</li>
            <li>Diagnose the layer:</li>
            <li>Vocabulary</li>
            <li>Method</li>
            <li>Reason</li>
            <li>Correct the layer</li>
            <li>Return control</li>
          </ul>
          <p className="text-muted-foreground">Example:</p>
          <p className="text-muted-foreground">Student skips step.</p>
          <p className="text-muted-foreground">You say:</p>
          <p className="font-medium">"What is the next step?"</p>
          <p className="text-muted-foreground">Not:</p>
          <p className="font-medium">"Let me show you."</p>
          <p className="font-medium">Rule:</p>
          <p className="font-medium">Guide, do not replace.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Structured Execution Builds</h2>

          <h3 className="text-xl font-semibold">1. Repeatability</h3>
          <p className="font-medium">Same problem -&gt; same steps</p>
          <p className="text-muted-foreground">No guessing.</p>

          <h3 className="text-xl font-semibold">2. Speed Through Familiarity</h3>
          <p className="text-muted-foreground">Not rushing.</p>
          <p className="text-muted-foreground">But:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>faster recognition</li>
            <li>faster start</li>
          </ul>

          <h3 className="text-xl font-semibold">3. Error Awareness</h3>
          <p className="text-muted-foreground">Student starts seeing:</p>
          <p className="font-medium">"I skipped a step"</p>
          <p className="text-muted-foreground">Without you telling them.</p>

          <h3 className="text-xl font-semibold">4. Ownership</h3>
          <p className="text-muted-foreground">Student becomes:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>active</li>
            <li>responsible</li>
            <li>engaged</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Common Failure Modes (Critical)</h2>
          <p className="font-medium">Over-Explaining</p>
          <p className="text-muted-foreground">Tutor keeps talking.</p>
          <p className="text-muted-foreground">Student keeps listening.</p>
          <p className="text-muted-foreground">No execution.</p>

          <p className="font-medium">Delayed Application</p>
          <p className="text-muted-foreground">Tutor says:</p>
          <p className="font-medium">"Let us do one more example..."</p>
          <p className="font-medium">No.</p>
          <p className="text-muted-foreground">You already modeled.</p>
          <p className="text-muted-foreground">Now they execute.</p>

          <p className="font-medium">Taking Over</p>
          <p className="text-muted-foreground">Student struggles.</p>
          <p className="text-muted-foreground">Tutor jumps in.</p>
          <p className="text-muted-foreground">Execution is stolen.</p>

          <p className="font-medium">Ignoring the Lens</p>
          <p className="text-muted-foreground">Tutor says:</p>
          <p className="font-medium">"That is wrong"</p>
          <p className="text-muted-foreground">Instead of:</p>
          <p className="font-medium">"What layer broke?"</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What You Must Enforce</h2>
          <p className="font-medium">Rule 1:</p>
          <p className="text-muted-foreground">After modeling -&gt; they must act</p>
          <p className="font-medium">Rule 2:</p>
          <p className="text-muted-foreground">After error -&gt; you must diagnose</p>
          <p className="font-medium">Rule 3:</p>
          <p className="text-muted-foreground">After correction -&gt; they must re-execute</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Loop</h2>
          <p className="text-muted-foreground">This phase is not linear.</p>
          <p className="text-muted-foreground">It is a loop:</p>
          <p className="font-medium">Model</p>
          <p className="font-medium">-&gt; Apply</p>
          <p className="font-medium">-&gt; Guide</p>
          <p className="font-medium">-&gt; Apply again</p>
          <p className="font-medium">-&gt; Guide again</p>
          <p className="text-muted-foreground">Until:</p>
          <p className="font-medium">execution stabilizes</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Mastery Looks Like</h2>
          <p className="text-muted-foreground">You will see:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>less hesitation</li>
            <li>fewer skipped steps</li>
            <li>correct language</li>
            <li>cleaner structure</li>
          </ul>
          <p className="text-muted-foreground">The student begins to:</p>
          <p className="font-medium">trust the process instead of guessing</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Hidden Outcome</h2>
          <p className="text-muted-foreground">This phase quietly builds:</p>
          <p className="font-medium">discipline</p>
          <p className="text-muted-foreground">Not motivation.</p>
          <p className="text-muted-foreground">Not confidence.</p>
          <p className="font-medium">Discipline.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Relationship to Other Phases</h2>
          <p className="text-muted-foreground">Without Clarity:</p>
          <p className="font-medium">Execution becomes guessing</p>
          <p className="text-muted-foreground">Without Structured Execution:</p>
          <p className="font-medium">Boss Battles become overwhelming</p>
          <p className="text-muted-foreground">Without This Phase:</p>
          <p className="font-medium">Timed Execution collapses</p>
          <p className="font-medium">This is the bridge.</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Final Principle</h2>
          <p className="text-muted-foreground">Structured Execution is where:</p>
          <p className="font-medium">thinking becomes behaviour</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Final Rule</h2>
          <p className="text-muted-foreground">If the student is not:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>doing</li>
            <li>correcting</li>
            <li>repeating</li>
          </ul>
          <p className="text-muted-foreground">Then:</p>
          <p className="font-medium">you are teaching, not conditioning</p>
          <p className="text-muted-foreground">And TT is not teaching.</p>
          <p className="font-medium">It is conditioning.</p>
        </Card>
      </div>
    </div>
  );
}
