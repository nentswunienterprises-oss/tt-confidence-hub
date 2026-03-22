import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningTimePressureStability() {
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
                Time Pressure Stability
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What It Is</h2>
          <p className="text-muted-foreground">Time Pressure Stability is where:</p>
          <p className="font-medium">execution is tested under constraint</p>
          <p className="text-muted-foreground">Not new learning.</p>
          <p className="text-muted-foreground">Not new teaching.</p>
          <p className="text-muted-foreground">This is:</p>
          <p className="font-medium">Can the student execute when time is limited and pressure is present?</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Shift</h2>
          <p className="text-muted-foreground">From:</p>
          <p className="font-medium">"I can do it when I have time"</p>
          <p className="text-muted-foreground">To:</p>
          <p className="font-medium">"I can do it when time is restricted"</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Tool</h2>
          <p className="font-medium">Timed Execution</p>
          <p className="text-muted-foreground">This is Boss Battles under time constraint.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Why This Phase Exists</h2>
          <p className="text-muted-foreground">Exams are not:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>open</li>
            <li>relaxed</li>
            <li>forgiving</li>
          </ul>
          <p className="text-muted-foreground">They are:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>timed</li>
            <li>silent</li>
            <li>high consequence</li>
          </ul>
          <p className="text-muted-foreground">Students do not fail because:</p>
          <p className="text-muted-foreground">they do not know</p>
          <p className="text-muted-foreground">They fail because:</p>
          <p className="font-medium">their execution breaks under time pressure</p>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">TT Trains This Directly</h2>
          <p className="text-muted-foreground">We do not wait for exams to expose this.</p>
          <p className="font-medium">We simulate it.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">When to Use Timed Execution</h2>
          <p className="text-muted-foreground">Only after:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Clarity is stable</li>
            <li>Method is repeatable</li>
            <li>Student can handle Boss Battles</li>
          </ul>
          <p className="font-medium">Rule:</p>
          <p className="font-medium">Do NOT introduce time pressure during instability.</p>
          <p className="text-muted-foreground">Time pressure amplifies everything.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Happens When Time Starts</h2>
          <p className="text-muted-foreground">The moment you say:</p>
          <p className="font-medium">"5 minutes. Start."</p>
          <p className="text-muted-foreground">Three things spike:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>urgency</li>
            <li>anxiety</li>
            <li>mental noise</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What You Are Watching</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>do they rush?</li>
            <li>do they freeze?</li>
            <li>do they skip steps?</li>
            <li>do they stay structured?</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">The Critical Reminder (Before Starting)</h2>
          <p className="text-muted-foreground">You say:</p>
          <p className="font-medium">"The goal is not speed.</p>
          <p className="font-medium">The goal is stable execution."</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What the Student Must Do</h2>
          <p className="text-muted-foreground">Under time:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>read fully</li>
            <li>identify type</li>
            <li>follow method</li>
            <li>execute step-by-step</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Weak Students Do</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>rush reading</li>
            <li>misidentify problem</li>
            <li>skip steps</li>
            <li>panic</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">What Trained Students Do</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>slow the start</li>
            <li>orient first</li>
            <li>execute method</li>
            <li>maintain structure</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Paradox</h2>
          <p className="text-muted-foreground">They appear slower at the start.</p>
          <p className="text-muted-foreground">But they:</p>
          <p className="font-medium">finish more accurately and more consistently</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Your Role During Timed Execution</h2>
          <p className="font-medium">Minimal.</p>
          <p className="text-muted-foreground">You do NOT:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>guide constantly</li>
            <li>interrupt</li>
            <li>correct mid-way</li>
          </ul>
          <p className="text-muted-foreground">You observe.</p>
          <p className="text-muted-foreground">Why</p>
          <p className="text-muted-foreground">Because:</p>
          <p className="font-medium">real pressure has no tutor</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">When You Intervene</h2>
          <p className="text-muted-foreground">Only if:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>complete breakdown</li>
            <li>no movement</li>
            <li>system abandoned</li>
          </ul>
          <p className="text-muted-foreground">Even then:</p>
          <p className="text-muted-foreground">You guide to:</p>
          <p className="font-medium">first step only</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">After Time Ends - Debrief</h2>
          <p className="text-muted-foreground">This is where the learning happens.</p>
          <p className="text-muted-foreground">You Do NOT Say</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"You got it wrong"</li>
            <li>"You need to be faster"</li>
          </ul>
          <p className="text-muted-foreground">You Do Say</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>"What happened when time started?"</li>
            <li>"Where did you lose structure?"</li>
            <li>"Did you follow the method?"</li>
          </ul>
          <p className="text-muted-foreground">What You Are Reinforcing</p>
          <p className="text-muted-foreground">Not result.</p>
          <p className="font-medium">process under pressure</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What You Log</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>response pattern</li>
            <li>stability level</li>
            <li>breakdown point</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What This Phase Builds</h2>
          <h3 className="text-xl font-semibold">1. Pressure Familiarity</h3>
          <p className="text-muted-foreground">Time pressure stops feeling foreign</p>
          <h3 className="text-xl font-semibold">2. Execution Stability</h3>
          <p className="text-muted-foreground">Steps remain intact under stress</p>
          <h3 className="text-xl font-semibold">3. Reduced Volatility</h3>
          <p className="text-muted-foreground">Less panic</p>
          <p className="text-muted-foreground">Less rushing</p>
          <p className="text-muted-foreground">Less collapse</p>
          <h3 className="text-xl font-semibold">4. Calm Under Constraint</h3>
          <p className="text-muted-foreground">Student begins to:</p>
          <p className="font-medium">trust structure over urgency</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Common Failure Modes</h2>
          <p className="font-medium">Speed Obsession</p>
          <p className="text-muted-foreground">Tutor pushes:</p>
          <p className="font-medium">"Go faster"</p>
          <p className="text-muted-foreground">This creates:</p>
          <p className="text-muted-foreground">rushing</p>
          <p className="text-muted-foreground">mistakes</p>
          <p className="text-muted-foreground">instability</p>

          <p className="font-medium">Over-Intervention</p>
          <p className="text-muted-foreground">Tutor keeps helping.</p>
          <p className="text-muted-foreground">Pressure becomes artificial.</p>

          <p className="font-medium">Early Timing</p>
          <p className="text-muted-foreground">Student not ready.</p>
          <p className="text-muted-foreground">Breakdown becomes chaos.</p>

          <p className="font-medium">Ignoring Process</p>
          <p className="text-muted-foreground">Focusing only on final answer.</p>
          <p className="text-muted-foreground">Misses the entire point.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Correct Behaviour</h2>
          <p className="text-muted-foreground">You are:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>calm</li>
            <li>observant</li>
            <li>non-reactive</li>
            <li>precise in debrief</li>
          </ul>
          <p className="text-muted-foreground">You are not:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>pushing speed</li>
            <li>panicking with them</li>
            <li>correcting every step live</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Relationship to Other Phases</h2>
          <p className="text-muted-foreground">Without Clarity:</p>
          <p className="font-medium">They misread under time</p>
          <p className="text-muted-foreground">Without Structured Execution:</p>
          <p className="font-medium">They forget steps</p>
          <p className="text-muted-foreground">Without Controlled Discomfort:</p>
          <p className="font-medium">They panic instantly</p>
          <p className="text-muted-foreground">This phase exposes:</p>
          <p className="font-medium">everything that is not stable</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">What Mastery Looks Like</h2>
          <p className="text-muted-foreground">You will see:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>steady start</li>
            <li>correct identification</li>
            <li>consistent steps</li>
            <li>controlled pace</li>
          </ul>
          <p className="text-muted-foreground">The student treats time as:</p>
          <p className="font-medium">a condition, not a threat</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The Hidden Outcome</h2>
          <p className="text-muted-foreground">This phase creates:</p>
          <p className="font-medium">exam readiness without needing exams</p>
        </Card>

        <Card className="p-6 space-y-5 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Final Principle</h2>
          <p className="text-muted-foreground">Time pressure does not create ability.</p>
          <p className="text-muted-foreground">It reveals:</p>
          <p className="font-medium">what has already been conditioned</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">Final Rule</h2>
          <p className="text-muted-foreground">If a student collapses under time:</p>
          <p className="text-muted-foreground">Do NOT say:</p>
          <p className="font-medium">"They need more practice"</p>
          <p className="text-muted-foreground">Say:</p>
          <p className="font-medium">"The system is not yet stable"</p>
          <p className="text-muted-foreground">And return to:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>clarity</li>
            <li>execution</li>
            <li>discomfort</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">End State of the System</h2>
          <p className="text-muted-foreground">When all phases are complete:</p>
          <p className="text-muted-foreground">The student:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>sees clearly</li>
            <li>executes reliably</li>
            <li>handles difficulty</li>
            <li>remains stable under time</li>
          </ul>
          <p className="text-muted-foreground">They do not rely on:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>confidence</li>
            <li>motivation</li>
            <li>luck</li>
          </ul>
          <p className="text-muted-foreground">They rely on:</p>
          <p className="font-medium">trained response</p>
          <p className="font-medium">That is TT.</p>
        </Card>
      </div>
    </div>
  );
}