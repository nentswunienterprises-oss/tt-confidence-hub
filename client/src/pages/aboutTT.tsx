import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutTT() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">About TT</CardTitle>
            <CardDescription className="text-center">Learn more about how Territorial Tutoring teaches</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p>
              Territorial Tutoring helps students stay calm, structured, and confident when math gets difficult - especially under exam pressure.
            </p>

            <p>
              We don’t just help students “understand” work.
              <br />
              We help them know what to do when they feel stuck.
            </p>

            <p>
              That’s the difference.
            </p>

            <h2>The Real Problem</h2>

            <p>Most students don’t struggle because they’re bad at math.
            <br />
            They struggle because:</p>

            <ul>
              <li>They panic when questions look unfamiliar</li>
              <li>They forget steps under pressure</li>
              <li>They second-guess themselves</li>
              <li>They rush or freeze in tests</li>
            </ul>

            <p>
              Traditional tutoring focuses on more practice.
              <br />
              We focus on how students respond when things feel hard.
            </p>

            <h2>At TT, students are trained to:</h2>

            <ul>
              <li>Recognize what type of situation they’re facing</li>
              <li>Use clear mathematical language</li>
              <li>Follow a reliable step-by-step process</li>
              <li>Understand why each step works</li>
              <li>Stay composed when difficulty increases</li>
            </ul>

            <p>
              This approach helps students perform consistently, not just when questions are easy.
            </p>

            <h2>Our Teaching Structure</h2>

            <p>Every concept is taught in three parts:</p>

            <h3>1. Clear Language</h3>
            <p>
              Students learn the correct mathematical terms and how to use them properly.
              <br />
              This removes confusion and builds precision.
            </p>

            <h3>2. Clear Steps</h3>
            <p>
              Students are shown a consistent, repeatable way to approach each type of problem.
              <br />
              No guessing. No randomness.
            </p>

            <h3>3. Clear Understanding</h3>
            <p>
              Students learn why each step works, so they don’t rely on memorisation alone.
            </p>

            <p>
              This structure helps students think clearly - even when things feel unstable.
            </p>

            <h2>Controlled Pressure</h2>

            <p>
              As students improve, we intentionally introduce more challenging questions during sessions.
            </p>

            <p>
              Why?
            </p>

            <p>
              Because exams don’t warn students when difficulty increases.
            </p>

            <p>
              By practicing harder questions in a supported environment, students learn that:
            </p>

            <ul>
              <li>Difficulty doesn’t mean failure</li>
              <li>Pausing is okay</li>
              <li>There is always a first step</li>
            </ul>

            <p>
              Over time, students stop panicking and start executing calmly.
            </p>

            <h2>What This Builds</h2>

            <p>Parents typically notice:</p>
            <ul>
              <li>Improved confidence in tests</li>
              <li>Fewer careless mistakes</li>
              <li>Better time management</li>
              <li>Clearer explanations from their child</li>
              <li>Less anxiety around math</li>
            </ul>

            <p>
              Confidence isn’t forced or hyped.
              <br />
              It develops naturally as students gain clarity and consistency.
            </p>

            <h2>Consistency Across Tutors</h2>

            <p>All TT tutors follow the same structured approach.</p>

            <p>This means:</p>
            <ul>
              <li>No random teaching styles</li>
              <li>No guessing what a tutor “feels like doing”</li>
              <li>Clear standards across every session</li>
            </ul>

            <p>
              The child doesn’t depend on a tutor’s personality - they benefit from a proven system.
            </p>

            <h2>What We Don’t Do</h2>

            <ul>
              <li>We don’t rush students through work</li>
              <li>We don’t rely on motivation speeches</li>
              <li>We don’t lower standards to make students feel good</li>
              <li>We don’t overwhelm students with shortcuts</li>
            </ul>

            <p>
              We build understanding, structure, and calm execution.
            </p>

            <h2>Why This Works</h2>

            <p>
              When students know:
            </p>

            <ul>
              <li>what the question is asking</li>
              <li>what steps to take</li>
              <li>and why those steps are valid</li>
            </ul>

            <p>
              confidence follows naturally.
            </p>

            <h2></h2>

            <h3>Level 1 - The Surface</h3>
            <p>What parents think they’re buying:</p>
            <ul>
              <li>Online math sessions</li>
              <li>A tutor</li>
              <li>An app</li>
              <li>A schedule</li>
            </ul>
            <p></p>

            <h3>Level 2 - The Capability</h3>
            <p>What TT actually enables:</p>
            <ul>
              <li>Step-by-step problem solving</li>
              <li>Structured thinking</li>
              <li>Familiarity with question types</li>
              <li>Exposure to curriculum</li>
            </ul>
            <p></p>

            <h3>Level 3 - The Emotional State</h3>
            <p>TT does not chase confidence.</p>
            <p>TT produces:</p>
            <ul>
              <li>Cognitive stability under uncertainty</li>
            </ul>
            <p>The emotional state is:</p>
            <ul>
              <li>Calm</li>
              <li>Oriented</li>
              <li>Non-panicked</li>
              <li>Neutral</li>
            </ul>
            <p>Confidence is an indicator, not our focus.</p>

            <h3>Level 4 - The Behavior Change</h3>
            <p></p>
            <p>Students trained by TT do one thing differently:</p>
            <p>They do not freeze when the question breaks expectation.</p>
            <p>They:</p>
            <ul>
              <li>Read the question fully</li>
              <li>Identify what is known</li>
              <li>Execute a trained response pattern</li>
              <li>Move forward without emotional negotiation</li>
            </ul>
            <p>This behavior change is:</p>
            <ul>
              <li>Observable</li>
              <li>Trainable</li>
              <li>Repeatable</li>
              <li>Testable under pressure</li>
            </ul>
            <p>This is response integrity.</p>

            <h3>Level 5 - The Transformed Future</h3>
            <p>What that behavior makes possible:</p>
            <ul>
              <li>Exams stop feeling like ambushes</li>
              <li>Performance stabilizes across terms</li>
              <li>Parents stop micromanaging</li>
              <li>Students stop self-labeling as “bad at math”</li>
              <li>Academic pressure becomes manageable, not traumatic</li>
            </ul>
            <p>The future TT represents is:</p>
            <p>“My child can handle pressure without falling apart.”</p>
            <p>That is priceless to the right parent.</p>

            <p>
              Our role is to create those conditions  consistently.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
