import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Shield, Target, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TTLogo } from "@/components/TTLogo";

const fitSignals = [
  "You can correct directly without emotional leakage.",
  "You can hold a system line even when a tutor pushes back.",
  "You think in patterns, drift, and enforcement loops rather than isolated sessions.",
];

const disqualifiers = [
  "You want to coach around the system instead of enforcing it.",
  "You avoid conflict when standards must be held.",
  "You soften truth to protect relationships.",
  "You prefer flexibility over system integrity.",
];

const roleBlocks = [
  {
    title: "What this role is",
    body: "A Territory Director is the system enforcement layer between COO and tutors. You audit execution, identify drift, and force correction.",
  },
  {
    title: "What this role is not",
    body: "This is not tutoring, not mentoring, and not a soft leadership badge. It is quality control with authority.",
  },
  {
    title: "What TT needs from you",
    body: "Structured judgment, direct correction, truthful audits, and the ability to protect TT-OS even when it is uncomfortable.",
  },
  {
    title: "What breaks the fit",
    body: "Hesitation, emotional bias, selective enforcement, and any tendency to let people bend the system.",
  },
];

export default function TdLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F6EFE8] text-[#1A1A1A]">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 12% 12%, rgba(230,57,70,0.12) 0%, rgba(230,57,70,0) 30%), radial-gradient(circle at 86% 10%, rgba(21,36,59,0.10) 0%, rgba(21,36,59,0) 24%), linear-gradient(180deg, #FFF8F2 0%, #F6EFE8 48%, #EFE3D8 100%)",
        }}
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5D6C9] backdrop-blur-md" style={{ backgroundColor: "rgba(246, 239, 232, 0.9)" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6 md:px-12">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 text-sm font-medium hover:bg-transparent sm:px-4 sm:text-base"
            style={{ color: "#1A1A1A" }}
            onClick={() => navigate("/operational/landing")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8A4B35]">Operational Gateway</p>
            <p className="mt-0.5 text-sm font-bold tracking-tight text-[#1A1A1A] sm:text-xl">Territory Director</p>
          </div>

          <Button
            className="rounded-full px-4 text-sm font-semibold sm:px-6 sm:text-base"
            style={{ backgroundColor: "#E63946", color: "white" }}
            onClick={() => navigate("/operational/td/signup")}
          >
            Sign In
          </Button>
        </div>
      </header>

      <div className="h-16 sm:h-20" />

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 md:px-12 md:pb-16 md:pt-10">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="overflow-hidden rounded-[34px] border border-[#E5D3C5] bg-[linear-gradient(135deg,#FFF9F3_0%,#F4E6D9_45%,#EEDBCE_100%)] shadow-[0_28px_90px_rgba(84,45,22,0.09)]">
              <div className="p-6 sm:p-7 lg:p-9 xl:p-10">
                <div className="inline-flex rounded-full border border-[#E9CFC2] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A3024] shadow-sm">
                  System enforcement role
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.05em] text-[#171311] sm:text-5xl lg:text-[4.1rem] xl:text-[4.55rem]">
                  This is not a tutoring role.
                  <span className="mt-2 block max-w-3xl text-[#7C2D21]">It is a system authority role.</span>
                </h1>
                <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
                  <div className="max-w-2xl space-y-3 text-base leading-7 text-[#534A43] sm:text-[17px]">
                    <p>Territorial Tutoring does not need soft managers here. It needs operators who can hold TT-OS exactly, audit truthfully, and stop drift before it compounds.</p>
                    <p>The value of a TD is not personality. It is system protection under pressure.</p>
                  </div>
                  <div className="rounded-[24px] border border-[#E0CCBE] bg-white/58 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A4B35]">Role core</p>
                    <p className="mt-3 text-base font-semibold leading-7 text-[#1A1A1A]">
                      Audit clearly.
                      <br />
                      Correct directly.
                      <br />
                      Protect TT-OS.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="rounded-full px-8 shadow-sm" style={{ backgroundColor: "#B9382F" }} onClick={() => navigate("/operational/td/signup")}>
                    Apply for TD Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-[#D7C0AF] bg-white/70 px-8 text-[#1A1A1A] hover:bg-white"
                    onClick={() => document.getElementById("fit-check")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    See If You Fit
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:content-start">
              <Card className="rounded-[28px] border border-[#2A211D] bg-[#1F1814] p-5 text-white shadow-[0_18px_50px_rgba(25,19,16,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-bold uppercase tracking-tight text-[#E63946]">ENFORCEMENT</span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75">
                    TT-OS layer
                  </span>
                </div>
                <div className="mt-7 space-y-3 text-sm text-white/82">
                  <div className="flex items-center gap-3"><Shield className="h-4 w-4 text-[#FF917B]" />Strict adherence</div>
                  <div className="flex items-center gap-3"><Target className="h-4 w-4 text-[#FF917B]" />Audit accuracy</div>
                  <div className="flex items-center gap-3"><Users className="h-4 w-4 text-[#FF917B]" />Tutor correction loop</div>
                </div>
              </Card>

              <Card className="rounded-[28px] border border-[#E5D3C5] bg-white/82 p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">Filter logic</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[#1A1A1A]">No authority.</p>
                <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]">No fit.</p>
                <p className="mt-3 text-sm leading-6 text-[#5D5550]">This role is for system protectors, not comfort managers.</p>
              </Card>
            </div>
          </div>
        </section>

        <section id="fit-check" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:px-12">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-[30px] border border-[#E5D3C5] bg-white/86 p-7 shadow-sm sm:p-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">Fit check</p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A1A]">Who this is for</h2>
              </div>
              <div className="mt-7 space-y-4">
                {fitSignals.map((item) => (
                  <div key={item} className="rounded-[22px] border border-[#EEDFD3] bg-[#FFF8F3] p-5">
                    <div className="flex items-start gap-3">
                      <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#B9382F]" />
                      <p className="text-sm leading-7 text-[#4F4742]">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[30px] border border-[#2F2621] bg-[#201916] p-7 text-white shadow-sm sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFB5A6]">Disqualifiers</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Who this is not for</h2>
              <div className="mt-7 space-y-4">
                {disqualifiers.map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start gap-3">
                      <X className="mt-1 h-4 w-4 flex-shrink-0 text-[#FF9A84]" />
                      <p className="text-sm leading-7 text-white/82">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:px-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {roleBlocks.map((item) => (
              <Card key={item.title} className="rounded-[26px] border border-[#E4D2C4] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold tracking-tight text-[#1A1A1A]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#574F49]">{item.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:px-12 md:py-20">
          <div className="rounded-[32px] border border-[#E5D3C5] bg-white/82 px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">Final filter</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#1A1A1A] sm:text-4xl">
              TT does not need softer leadership.
              <span className="block text-[#7C2D21]">It needs cleaner enforcement.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#57504B] sm:text-lg">
              If the role feels harsh, it is likely the wrong fit. If it feels clean, structured, and necessary, enter the TD sign-in flow and let the application filter decide.
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-full px-8 shadow-sm"
              style={{ backgroundColor: "#B9382F" }}
              onClick={() => navigate("/operational/td/signup")}
            >
              Enter TD Sign In
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row md:px-12">
          <TTLogo size="md" />
          <p className="text-center text-xs text-[#5A5A5A] md:text-right">
            © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
            <br />
            Territory Director Gateway
          </p>
        </div>
      </footer>
    </div>
  );
}
