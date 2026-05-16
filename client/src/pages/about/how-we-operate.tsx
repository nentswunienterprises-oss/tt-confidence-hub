import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponseIntegrityLogo } from "@/components/ResponseIntegrityLogo";

export default function HowWeOperate() {
  return (
    <div className="min-h-screen bg-[#FCF6F2] text-[#1A1A1A]">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <ResponseIntegrityLogo size="xl" variant="integrity" />
        <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#E63946]">How We Operate</p>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">Structure, cadence, and the discipline to prepare before pressure.</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Our operating model is designed around cadence, conditioning windows, and consistent rhythms. We do not build academic response the way reactive tutoring does.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="prose prose-slate max-w-none p-10 sm:p-12">
            <p>Response Integrity is built to operate like a conditioning system, not an emergency tutoring service.</p>
            <p>That means we organise each student’s progress around rhythm, cadence, and intentional timing. We do not rely on last-minute urgency or reactive intervention.</p>
            <h2>Our Operating Principles</h2>
            <ul>
              <li>Conditioning windows are the primary enrolment periods.</li>
              <li>Development is paced across consistent, deliberate sessions.</li>
              <li>Progress is measured in response stability, not short-term spikes.</li>
              <li>Difficulty is introduced intentionally, with support, so students learn to remain functional under pressure.</li>
              <li>We avoid panic-driven exam preparation and short-term cramming.</li>
            </ul>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm sm:text-base text-slate-600">
                Our system is not built to be convenient. It is built to be effective. That means enrolment, pacing, and practice are planned to strengthen response before pressure arrives.
              </p>
            </div>

            <h2>Why cadence matters</h2>
            <p>Stable academic performance is created through repetition, structure, and timing. Random sessions, inconsistent exposure, and emergency learning undermine the response patterns we are trying to build.</p>
            <p>So our model emphasises:</p>
            <ul>
              <li>regular practice windows,</li>
              <li>guided execution habits,</li>
              <li>progressive challenge,</li>
              <li>and recovery between conditioning cycles.</li>
            </ul>

            <h2>What this looks like</h2>
            <p>In practice, Response Integrity operates with:</p>
            <ul>
              <li>structured enrolment cycles,</li>
              <li>consistent development rhythms,</li>
              <li>controlled exposure to difficult questions,</li>
              <li>and a focus on long-term capability over quick fixes.</li>
            </ul>
            <p>This is why our work is intentionally different from traditional tutoring. Our system is designed to make calm execution habitual, not occasional.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
