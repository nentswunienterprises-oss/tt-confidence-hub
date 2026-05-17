import { Card, CardContent } from "@/components/ui/card";
import { ResponseIntegrityLogo } from "@/components/ResponseIntegrityLogo";

export default function HowWeOperate() {
  return (
    <div className="min-h-screen bg-[#FCF6F2] text-[#1A1A1A]">
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <ResponseIntegrityLogo size="lg" variant="integrity" />
        <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#E63946]">How We Operate</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <Card className="rounded-2xl border border-slate-200 bg-[#F7F0EA] shadow-sm">
          <CardContent className="prose prose-slate max-w-none p-10 sm:p-12">
            <h2>Preparation Before Pressure</h2>
            <p>Response Integrity does not wait for pressure before preparing students.</p>
            <p>We believe stable academic performance is built before:</p>
            <ul>
              <li>exams,</li>
              <li>deadlines,</li>
              <li>classroom pressure,</li>
              <li>and emotional urgency appear.</li>
            </ul>
            <p>For this reason, Response Integrity operates through a conditioning-based academic model rather than a reactive tutoring model.</p>

            <h2>Ahead-Of-Class Conditioning</h2>
            <p>Whenever possible, Response Integrity works from the student's yearly, termly, or upcoming school topic scope.</p>
            <p>This allows students to begin conditioning before topics become high-pressure classroom or exam environments.</p>
            <p>By the time a topic becomes heavily emphasized at school:</p>
            <ul>
              <li>the student has already seen the structures,</li>
              <li>practiced the execution patterns,</li>
              <li>built familiarity,</li>
              <li>and begun stabilizing their response inside the topic.</li>
            </ul>
            <p>School then becomes:</p>
            <ul>
              <li>reinforcement,</li>
              <li>repetition,</li>
              <li>and deeper exposure,</li>
              <li>rather than first contact under pressure.</li>
            </ul>

            <h2>Topic Conditioning Cadence</h2>
            <p>Response Integrity uses Topic Conditioning.</p>
            <p>This means we condition students topic-by-topic using:</p>
            <ul>
              <li>structured repetition,</li>
              <li>execution practice,</li>
              <li>controlled difficulty,</li>
              <li>and progressive pressure exposure.</li>
            </ul>
            <p>Students move through topics using Response Integrity cadence rather than emergency-based academic urgency.</p>
            <p>Conditioning is paced intentionally according to:</p>
            <ul>
              <li>the student's stability,</li>
              <li>response quality,</li>
              <li>execution consistency,</li>
              <li>and conditioning phase inside each topic.</li>
            </ul>
            <p>That also means we do not view the student as one global state across every topic.</p>
            <p className="text-muted-foreground">A student can be strong in one topic and unstable in another, so we track topic-specific response state instead of one-size-fits-all labels like "weak" or "behind."</p>

            <h2>Conditioning Windows</h2>
            <p>Response Integrity operates through conditioning windows rather than last-minute intervention cycles.</p>
            <p>This means preparation begins before pressure peaks.</p>
            <p>Students are gradually conditioned across the academic cycle so that:</p>
            <ul>
              <li>exams feel familiar,</li>
              <li>execution feels practiced,</li>
              <li>and pressure feels manageable.</li>
            </ul>
            <p>The goal is not to "save" students shortly before assessments.</p>
            <p>The goal is to build students who can remain calm, structured, and functional when assessments arrive.</p>

            <h2>Our Academic Conditioning Cycle</h2>
            <p>Response Integrity works best when the year is approached as a conditioning cycle rather than a series of emergency tutoring moments.</p>
            <h3>Early Conditioning Window</h3>
            <p>Preparation begins before pressure peaks. Students start building familiarity and response stability before topics become stressful.</p>
            <h3>Reinforcement Cadence</h3>
            <p>Across the term, repeated structured exposure strengthens familiarity, execution habits, and calmer behavior under difficulty.</p>
            <h3>Pressure Stability Window</h3>
            <p>As assessments approach, execution is trained under greater time and pressure demands so urgency does not immediately destabilize performance.</p>
            <h3>Reflection And Reconditioning</h3>
            <p>After pressure events, patterns are reviewed, weaknesses are identified, and the next cycle begins with more clarity.</p>

            <h2>Anti-Adhoc Philosophy</h2>
            <p>Stable response cannot be built through inconsistent exposure.</p>
            <p>For this reason, Response Integrity does not operate around chaotic, panic-driven academic intervention.</p>
            <p>We believe:</p>
            <ul>
              <li>consistency builds stability,</li>
              <li>repetition builds familiarity,</li>
              <li>and familiarity reduces emotional collapse under pressure.</li>
            </ul>
            <p>Conditioning requires cadence.</p>

            <h2>The Response Integrity Environment</h2>
            <p>Response Integrity aims to create a calm-performance culture.</p>
            <p>Inside this environment:</p>
            <ul>
              <li>pressure is normalized,</li>
              <li>difficulty is expected,</li>
              <li>structure is reinforced,</li>
              <li>and preparation happens early.</li>
            </ul>
            <p>Students are not trained to fear exams.</p>
            <p>They are conditioned to experience exams as another execution environment.</p>

            <h2>What Response Integrity Truly Optimizes For</h2>
            <p>Response Integrity is not optimizing for temporary academic spikes alone.</p>
            <p>We are optimizing for:</p>
            <ul>
              <li>stable response patterns,</li>
              <li>calm execution,</li>
              <li>long-term academic resilience,</li>
              <li>and reliable performance under pressure.</li>
            </ul>
            <p>Mathematics is the training arena.</p>
            <p>But the deeper objective is helping students develop stronger cognitive and emotional stability when difficulty appears.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
