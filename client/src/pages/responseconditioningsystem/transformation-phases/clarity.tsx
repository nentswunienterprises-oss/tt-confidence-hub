import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningClarity() {
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
                The 3-Layer Lens
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2">
                Clarity under Transformation Phases
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What It Is</h2>
          <p className="text-muted-foreground">The 3-Layer Lens is the system used to:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>model every concept</li>
            <li>diagnose every error</li>
            <li>correct every breakdown</li>
          </ul>
          <p className="font-medium">There is no teaching outside this lens.</p>
          <p className="font-medium">If you are not using the 3-Layer Lens, you are not running TT-OS.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Structure</h2>
          <p className="text-muted-foreground">Every problem exists across three layers:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Vocabulary - What things are called</li>
            <li>Method - What steps are taken</li>
            <li>Reason - Why the steps are valid</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Why This Matters</h2>
          <p className="text-muted-foreground">Most students fail because:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>they skip language</li>
            <li>they guess steps</li>
            <li>they do not understand validity</li>
          </ul>
          <p className="text-muted-foreground">So when pressure appears:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>vocabulary collapses - confusion</li>
            <li>method collapses - guessing</li>
            <li>reason collapses - doubt</li>
          </ul>
          <p className="font-medium">The 3-Layer Lens prevents collapse.</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Layer 1 - Vocabulary</h2>
          <h3 className="text-lg font-semibold">Definition</h3>
          <p className="text-muted-foreground">Precise naming of components.</p>

          <h3 className="text-lg font-semibold">What You Are Looking For</h3>
          <p className="text-muted-foreground">Does the student:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>use correct terms?</li>
            <li>recognize structures?</li>
            <li>identify what they are seeing?</li>
          </ul>

          <h3 className="text-lg font-semibold">Failure Signals</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"that thing"</li>
            <li>"the small number"</li>
            <li>"I do not know what this is"</li>
          </ul>
          <p className="font-medium">This is not a method problem.</p>
          <p className="font-medium">It is a naming problem.</p>

          <h3 className="text-lg font-semibold">Your Response</h3>
          <p className="text-muted-foreground">You correct immediately.</p>
          <p className="text-muted-foreground">Not later. Not softly.</p>
          <p className="text-muted-foreground">You enforce:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>correct term</li>
            <li>correct usage</li>
            <li>repetition</li>
          </ul>

          <h3 className="text-lg font-semibold">Execution</h3>
          <p className="text-muted-foreground">You say:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"That is the coefficient."</li>
            <li>"Say it."</li>
            <li>"Use it."</li>
          </ul>

          <h3 className="text-lg font-semibold">Rule</h3>
          <p className="font-medium">If vocabulary is weak:</p>
          <p className="font-medium">method and reason cannot stabilize</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Layer 2 - Method</h2>
          <h3 className="text-lg font-semibold">Definition</h3>
          <p className="text-muted-foreground">The step-by-step procedure.</p>

          <h3 className="text-lg font-semibold">What You Are Looking For</h3>
          <p className="text-muted-foreground">Does the student:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>know the sequence?</li>
            <li>follow the order?</li>
            <li>execute without skipping?</li>
          </ul>

          <h3 className="text-lg font-semibold">Failure Signals</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>skipping steps</li>
            <li>jumping ahead</li>
            <li>incorrect order</li>
            <li>"I forgot what to do next"</li>
          </ul>

          <h3 className="text-lg font-semibold">Your Response</h3>
          <p className="text-muted-foreground">You do not re-teach the whole concept.</p>
          <p className="text-muted-foreground">You locate the missing step.</p>
          <p className="text-muted-foreground">Then enforce the sequence.</p>

          <h3 className="text-lg font-semibold">Execution</h3>
          <p className="text-muted-foreground">You say:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"What is the next step?"</li>
            <li>"Execute it."</li>
            <li>"Follow the method."</li>
          </ul>

          <h3 className="text-lg font-semibold">Rule</h3>
          <p className="font-medium">Same problem type:</p>
          <p className="font-medium">same method, every time</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Layer 3 - Reason</h2>
          <h3 className="text-lg font-semibold">Definition</h3>
          <p className="text-muted-foreground">The law or logic that validates the step.</p>

          <h3 className="text-lg font-semibold">What You Are Looking For</h3>
          <p className="text-muted-foreground">Does the student:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>know why the step works?</li>
            <li>understand the rule behind it?</li>
          </ul>

          <h3 className="text-lg font-semibold">Failure Signals</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"because that is what you do"</li>
            <li>inability to explain</li>
            <li>robotic execution</li>
          </ul>

          <h3 className="text-lg font-semibold">Your Response</h3>
          <p className="text-muted-foreground">You anchor the step to a law.</p>

          <h3 className="text-lg font-semibold">Execution</h3>
          <p className="text-muted-foreground">You say:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"Why does this work?"</li>
            <li>"What law allows this?"</li>
          </ul>
          <p className="text-muted-foreground">Then:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>name the law</li>
            <li>make them repeat it</li>
          </ul>

          <h3 className="text-lg font-semibold">Rule</h3>
          <p className="font-medium">If reason is missing:</p>
          <p className="font-medium">confidence becomes fragile</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">How the Layers Work Together</h2>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Layer</th>
                  <th className="text-left font-semibold px-4 py-3">Role</th>
                  <th className="text-left font-semibold px-4 py-3">If Broken</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">Vocabulary</td>
                  <td className="px-4 py-3 text-muted-foreground">Orientation</td>
                  <td className="px-4 py-3 text-muted-foreground">Confusion</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">Method</td>
                  <td className="px-4 py-3 text-muted-foreground">Execution</td>
                  <td className="px-4 py-3 text-muted-foreground">Guessing</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">Reason</td>
                  <td className="px-4 py-3 text-muted-foreground">Stability</td>
                  <td className="px-4 py-3 text-muted-foreground">Doubt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Two Modes of the Lens</h2>

          <h3 className="text-xl font-semibold">1. Modeling Mode (Teaching)</h3>
          <p className="text-muted-foreground">You always go in order:</p>
          <p className="font-medium">Vocabulary - Method - Reason</p>
          <p className="text-muted-foreground">Example:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"This is a quadratic equation." (Vocabulary)</li>
            <li>"Step 1: Factor. Step 2: Set equal to zero..." (Method)</li>
            <li>"This works because of the zero product property..." (Reason)</li>
          </ul>

          <h3 className="text-xl font-semibold">2. Diagnostic Mode (Guiding)</h3>
          <p className="text-muted-foreground">You go backwards:</p>
          <p className="font-medium">Error - Identify layer - Fix layer</p>
          <p className="text-muted-foreground">Example:</p>
          <p className="text-muted-foreground">Student gets wrong answer.</p>
          <p className="text-muted-foreground">You check:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Do they know the terms?</li>
            <li>Did they follow the steps?</li>
            <li>Do they understand why?</li>
          </ul>
          <p className="text-muted-foreground">Then fix only the broken layer.</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Critical Rule</h2>
          <p className="text-muted-foreground">Do NOT:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>re-teach everything</li>
            <li>overwhelm the student</li>
            <li>jump layers randomly</li>
          </ul>
          <p className="text-muted-foreground">You fix:</p>
          <p className="font-medium">the exact point of failure</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Most Important Discipline</h2>
          <p className="text-muted-foreground">When a student is wrong:</p>
          <p className="text-muted-foreground">Do NOT say:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"That is wrong"</li>
            <li>"Let me show you"</li>
          </ul>
          <p className="text-muted-foreground">You say:</p>
          <p className="font-medium">"Where did it break?"</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Advanced Insight (What Most Tutors Miss)</h2>
          <p className="text-muted-foreground">Most tutors operate like this:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>explain more</li>
            <li>give more examples</li>
            <li>simplify endlessly</li>
          </ul>
          <p className="text-muted-foreground">This creates dependency.</p>
          <p className="text-muted-foreground">TT operates like this:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>identify the layer</li>
            <li>correct the layer</li>
            <li>return control to the student</li>
          </ul>
          <p className="text-muted-foreground">This creates independence.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Mastery Looks Like</h2>
          <p className="text-muted-foreground">A trained student:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>names what they see</li>
            <li>follows a clear process</li>
            <li>understands why it works</li>
          </ul>
          <p className="text-muted-foreground">So when pressure appears:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>They do not panic.</li>
            <li>They execute.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Real Function of the 3-Layer Lens</h2>
          <p className="text-muted-foreground">It is not a teaching tool.</p>
          <p className="text-muted-foreground">It is:</p>
          <p className="font-medium">a stability system</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Final Rule</h2>
          <p className="text-muted-foreground">Every:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>concept</li>
            <li>explanation</li>
            <li>correction</li>
          </ul>
          <p className="text-muted-foreground">must pass through:</p>
          <p className="font-medium">Vocabulary - Method - Reason</p>
          <p className="font-medium">No exceptions.</p>
        </Card>
      </div>
    </div>
  );
}
