import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningTopicConditioning() {
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
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Topic Conditioning
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">What It Is</h2>
          <p className="text-muted-foreground">
            Topic Conditioning is the process of using real school topics as arenas to train stable academic
            response through TT-OS.
          </p>
          <p className="font-semibold">Topic is the arena. TT-OS is the conditioning process.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Core Structure</h2>
          <p className="text-muted-foreground">Every active topic is tracked through this map:</p>
          <p className="text-lg font-semibold">Topic + Phase + Stability</p>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Topic</th>
                  <th className="text-left font-semibold px-4 py-3">Phase</th>
                  <th className="text-left font-semibold px-4 py-3">Stability</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">Algebraic expressions</td>
                  <td className="px-4 py-3">Structured Execution</td>
                  <td className="px-4 py-3">Low</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">Fractions</td>
                  <td className="px-4 py-3">Controlled Discomfort</td>
                  <td className="px-4 py-3">Medium</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">Exponents</td>
                  <td className="px-4 py-3">Time Pressure Stability</td>
                  <td className="px-4 py-3">High</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Phase Logic Inside a Topic</h2>
          <ol className="space-y-2 pl-4 text-muted-foreground">
            <li>1. Clarity: can the student name and see what they are dealing with in this topic?</li>
            <li>2. Structured Execution: can the student start and execute without being carried?</li>
            <li>3. Controlled Discomfort: can the student stay stable when certainty disappears?</li>
            <li>4. Time Pressure Stability: can the student stay structured under time?</li>
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Major Insight</h2>
          <p className="text-muted-foreground">A student does not have one global phase.</p>
          <p className="font-semibold">They have a phase per topic.</p>
          <p className="text-muted-foreground">
            Conditioned in one arena does not imply conditioned in all arenas.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">How Topic Is Chosen</h2>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>Parent-reported struggle topics</li>
            <li>Current school class topic</li>
            <li>Exam and test focus</li>
            <li>Tutor session logs and repeated breakdown patterns</li>
          </ul>
          <p className="font-semibold">TT conditions what school is already testing.</p>
        </Card>

        <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
          <h2 className="text-2xl font-bold">Cadence Meaning</h2>
          <p className="text-muted-foreground">8 sessions per month is not just teaching time.</p>
          <p className="font-semibold">It is 8 conditioning windows.</p>
          <p className="text-muted-foreground">
            Repetition, exposure, correction, and pressure are applied at fixed cadence until stability improves.
          </p>
        </Card>

        <Card className="p-6 space-y-4 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold">Final Rule</h2>
          <p className="text-muted-foreground">
            Do not move topics for volume. Move topics only when response is stable in the current arena.
          </p>
          <p className="font-semibold">
            Topic Conditioning is what turns TT from content coverage into response-conditioning infrastructure.
          </p>
        </Card>
      </div>
    </div>
  );
}
