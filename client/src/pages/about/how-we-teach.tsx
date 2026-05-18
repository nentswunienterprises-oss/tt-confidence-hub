import { Card, CardContent } from "@/components/ui/card";
import { ResponseIntegrityLogo } from "@/components/ResponseIntegrityLogo";

export default function HowWeTeach() {
  return (
    <div className="min-h-screen bg-[#FCF6F2] text-[#1A1A1A]">
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <ResponseIntegrityLogo size="lg" variant="integrity" />
        <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#E63946]">How We Teach</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <Card className="rounded-2xl border border-slate-200 bg-[#F7F0EA] shadow-sm">
          <CardContent className="prose prose-slate max-w-none p-10 sm:p-12">
            <p>Response Integrity helps students stay calm, structured, and reliable when math gets difficult - especially under exam pressure.</p>
            <p>We help students build understanding first, then condition what they do when certainty disappears.</p>
            <p>That's the difference.</p>

            <h2>The Real Problem</h2>
            <p>Most students don't struggle because they're bad at math. They struggle because:</p>
            <ul>
              <li>they panic when questions look unfamiliar</li>
              <li>they forget steps under pressure</li>
              <li>they second-guess themselves</li>
              <li>they rush or freeze in tests</li>
            </ul>
            <p>Traditional tutoring focuses on more practice. We focus on how students respond when things feel hard.</p>

            <h2>At Response Integrity, students are trained to:</h2>
            <ul>
              <li>recognize what type of situation they're facing</li>
              <li>use clear mathematical language</li>
              <li>follow a reliable step-by-step process</li>
              <li>understand why each step works</li>
              <li>stay composed when difficulty increases</li>
            </ul>
            <p>This approach helps students perform consistently, not just when questions are easy.</p>

            <h2>Our Teaching Structure</h2>
            <p>Every concept is taught in three parts:</p>
            <h3>1. Clear Language</h3>
            <p>Students learn the correct mathematical terms and how to use them properly. This removes confusion and builds precision.</p>
            <h3>2. Clear Steps</h3>
            <p>Students are shown a consistent, repeatable way to approach each type of problem. No guessing. No randomness.</p>
            <h3>3. Clear Understanding</h3>
            <p>Students learn why each step works, so they don't rely on memorisation alone.</p>
            <p>This structure helps students think clearly - even when things feel unstable.</p>

            <h2>Our Conditioning Progression</h2>
            <p>Each topic is developed through a structured progression.</p>
            <h3>1. Clarity</h3>
            <p>Students learn the language, structure, and logic of the topic clearly.</p>
            <h3>2. Structured Execution</h3>
            <p>Students practice a repeatable way of responding, so they are not guessing when uncertainty appears.</p>
            <h3>3. Controlled Difficulty</h3>
            <p>Difficulty is introduced deliberately so students learn to remain grounded when the work stops feeling easy.</p>
            <h3>4. Pressure Stability</h3>
            <p>As execution improves, students are trained to stay structured under time and assessment pressure.</p>
            <p>Teaching is one layer of this system. Conditioning the response is the larger goal.</p>
            <p>Not every session is the same. The learner's phase determines the drill, the level of support, and when speed or pressure are introduced.</p>

            <h2>Controlled Pressure</h2>
            <p>As students improve, we intentionally introduce more challenging questions during sessions.</p>
            <p>This is not random difficulty. It is introduced phase by phase so pressure becomes familiar rather than destabilizing.</p>
            <p>Why? Because exams don't warn students when difficulty increases.</p>
            <p>By practicing harder questions in a supported environment, students learn that:</p>
            <ul>
              <li>difficulty doesn't mean failure</li>
              <li>pausing is okay</li>
              <li>there is always a first step</li>
            </ul>
            <p>Over time, students stop panicking and start executing calmly.</p>

            <h2>What This Builds</h2>
            <p>Parents typically notice:</p>
            <ul>
              <li>improved confidence in tests</li>
              <li>fewer careless mistakes</li>
              <li>better time management</li>
              <li>clearer explanations from their child</li>
              <li>less anxiety around math</li>
            </ul>
            <p>Confidence isn't forced or hyped. It develops naturally as students gain clarity and consistency.</p>

            <h2>Consistency Across Tutors</h2>
            <p>All Response Integrity tutors follow the same structured approach. This means:</p>
            <ul>
              <li>no random teaching styles</li>
              <li>no guessing what a tutor "feels like doing"</li>
              <li>clear phase-appropriate standards across every session</li>
            </ul>
            <p>The child doesn't depend on a tutor's personality - they benefit from a proven system.</p>

            <h2>What We Don't Do</h2>
            <ul>
              <li>we don't rush students before the phase requires speed</li>
              <li>we don't rely on motivation speeches</li>
              <li>we don't lower standards to make students feel good</li>
              <li>we don't overwhelm students with shortcuts</li>
            </ul>
            <p>We build understanding, structure, and calm execution.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
