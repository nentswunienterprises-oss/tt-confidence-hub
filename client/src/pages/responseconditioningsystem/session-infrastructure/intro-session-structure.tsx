import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponseConditioningIntroSessionStructure() {
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
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                TT-OS Deep Dive
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Intro Session Structure
              </h1>
              <p className="text-muted-foreground mt-1">under Session Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">THE INTRO SESSION</h2>
          <h3 className="text-xl font-bold">Purpose</h3>
          <p className="font-medium">The Intro Session has only three objectives:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>Understand how the student currently responds to difficulty</li>
            <li>Identify the broken learning layer</li>
            <li>Establish the TT working structure</li>
          </ul>
          <p className="font-semibold">The Intro Session is diagnostic, not intensive teaching.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Intro Session Structure</h2>
          <p className="text-muted-foreground">The session runs in three phases.</p>
          <ol className="space-y-1 pl-4">
            <li>1. Orientation</li>
            <li>2. Surface the Pattern</li>
            <li>3. Diagnose the Layer</li>
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Phase 1 - Orientation</h2>
          <p className="font-medium">Goal: Establish the working tone and remove performance anxiety.</p>
          <p className="text-muted-foreground">Keep this section short and structured.</p>

          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">Example Questions</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>"Which math topics usually feel easiest for you?"</li>
              <li>"Which topics tend to confuse you the most?"</li>
              <li>"When a question looks unfamiliar, what usually happens first?"</li>
              <li>"Do you usually rush, freeze, or guess?"</li>
            </ul>
          </div>

          <p className="font-medium">You are identifying the student's default response pattern.</p>
          <p className="text-muted-foreground">Do not over-personalize this conversation.</p>
          <p className="font-semibold">The goal is clarity, not therapy.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Phase 2 - Surface the Pattern</h2>
          <p className="text-muted-foreground">Now focus directly on math.</p>

          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">Ask Questions Like</p>
            <ul className="space-y-1 pl-4 text-muted-foreground">
              <li>"Which math topic never quite made sense?"</li>
              <li>"Are there moments in math where your mind goes blank?"</li>
              <li>"Which type of question usually causes problems?"</li>
            </ul>
          </div>

          <p className="font-semibold">Write down two problem areas.</p>
          <p className="text-muted-foreground">These will guide the diagnostic.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Phase 3 - Diagnose the Layer</h2>
          <p className="text-muted-foreground">
            Give the student 1-2 short problems related to the topics they mentioned.
          </p>
          <p className="font-medium">Observe silently.</p>
          <p className="font-medium">Do not interrupt.</p>
          <p className="font-semibold">Your job is to identify which learning layer is unstable.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-2xl font-bold">The 3-Layer Lens</h2>
          <p className="text-muted-foreground">Every math concept has three layers.</p>

          <div className="border-l-4 border-primary pl-4 space-y-2">
            <h3 className="text-xl font-bold">Vocabulary</h3>
            <p className="text-muted-foreground">Do they understand the terms being used?</p>
            <p className="font-medium">Example failure:</p>
            <p className="font-semibold">"What is a denominator again?"</p>
          </div>

          <div className="border-l-4 border-primary pl-4 space-y-2">
            <h3 className="text-xl font-bold">Method</h3>
            <p className="text-muted-foreground">Do they know the correct sequence of steps?</p>
            <p className="font-medium">Example failure:</p>
            <p className="font-semibold">They jump between random operations.</p>
          </div>

          <div className="border-l-4 border-primary pl-4 space-y-2">
            <h3 className="text-xl font-bold">Reason</h3>
            <p className="text-muted-foreground">Do they understand why the steps work?</p>
            <p className="font-medium">Example failure:</p>
            <p className="font-semibold">They memorized a trick but cannot explain it.</p>
          </div>
        </Card>

        <Card className="p-6 border-2 border-primary/20 space-y-4">
          <h2 className="text-2xl font-bold">Outcome of the Intro Session</h2>
          <p className="font-medium">By the end of the session, the tutor must know:</p>
          <ul className="space-y-1 pl-4 text-muted-foreground">
            <li>The student's main difficulty topic</li>
            <li>Which learning layer is unstable</li>
            <li>How the student responds when confused</li>
          </ul>
          <p className="text-lg font-semibold">
            This becomes the starting point for the Transformation Process.
          </p>
        </Card>
      </div>
    </div>
  );
}