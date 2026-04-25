import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Dot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TTLogo } from "@/components/TTLogo";

const fitSignals = [
  "You can identify students who break under pressure in math.",
  "You can hear real need in a parent conversation without forcing the outcome.",
  "You can disqualify weak-fit families early instead of chasing volume.",
];

const disqualifiers = [
  "You want a salary instead of performance-linked earning.",
  "You rely on urgency, pressure, or persuasion tactics.",
  "You want easy money without system discipline.",
  "You want to position TT where genuine need is not present.",
];

const rolePoints = [
  "You identify real need.",
  "You qualify families accurately.",
  "You move the right students into the TT system.",
];

const nonRolePoints = [
  "You do not tutor.",
  "You do not over-explain the system.",
  "You do not force decisions.",
];

const earningPoints = [
  "Phase one is tied to pod activation and retention.",
  "R1500 is paid on confirmed fill contribution.",
  "Remaining earnings depend on retention.",
  "No salary. No entitlement. No cap.",
];

const operatorTraits = [
  "Need-first listening",
  "Early disqualification",
  "Clear positioning",
  "Locked-in follow-through where fit is real",
];

const principleCards = [
  {
    title: "What you get access to",
    body: "Defined positioning, a controlled system, real demand, and a structured earning model.",
  },
  {
    title: "What you are not doing",
    body: "You are not building your own thing, improvising the offer, or inventing your own pitch.",
  },
  {
    title: "How top operators win",
    body: "They run multiple pod pipelines, generate consistent placement flow, and become high-value distribution assets.",
  },
  {
    title: "Why this matters",
    body: "This is not short-term hustle energy. This is disciplined positioning inside a system that already knows what it is solving.",
  },
];

export default function AffiliateLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7EFE7] text-[#1A1A1A]">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 8% 8%, rgba(230,57,70,0.12) 0%, rgba(230,57,70,0) 28%), radial-gradient(circle at 88% 12%, rgba(23,92,59,0.09) 0%, rgba(23,92,59,0) 24%), linear-gradient(180deg, #FFF7F0 0%, #F7EFE7 48%, #F1E5D9 100%)",
        }}
      />

      <div className="fixed inset-x-0 top-0 z-50 border-b border-[#E7D8CA] backdrop-blur-md" style={{ backgroundColor: "rgba(247, 239, 231, 0.88)" }}>
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-3 sm:h-20 sm:px-6 md:px-12">
          <Button variant="ghost" className="w-fit gap-1.5 rounded-full px-2 text-sm hover:bg-[#F3E5D9] sm:gap-2 sm:px-3" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#8A4B35] sm:text-[10px] sm:tracking-[0.28em]">Affiliate Gateway</p>
            <p className="mt-0.5 text-sm font-bold tracking-tight text-[#1A1A1A] sm:text-xl">Education Growth Partner</p>
          </div>
          <Button className="justify-self-end rounded-full px-3 text-xs shadow-sm sm:px-5 sm:text-sm" style={{ backgroundColor: "#B9382F" }} onClick={() => navigate("/affiliate/signup")}>
            Apply for Access
          </Button>
        </div>
      </div>

      <div className="h-16 sm:h-20" />

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 md:px-12 md:pb-16 md:pt-8">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="overflow-hidden rounded-[34px] border border-[#E5D3C5] bg-[linear-gradient(135deg,#FFF9F3_0%,#F8EBDD_45%,#F0DFD0_100%)] shadow-[0_28px_90px_rgba(84,45,22,0.09)]">
              <div className="p-6 sm:p-7 lg:p-9 xl:p-10">
                <div className="inline-flex rounded-full border border-[#E9CFC2] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A3024] shadow-sm">
                  Precision-first operator role
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.05em] text-[#171311] sm:text-5xl lg:text-[4.1rem] xl:text-[4.55rem]">
                  This is not a referral hustle.
                  <span className="mt-2 block max-w-3xl text-[#7C2D21]">It is controlled student placement.</span>
                </h1>
                <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
                  <div className="max-w-2xl space-y-3 text-base leading-7 text-[#534A43] sm:text-[17px]">
                    <p>Territorial Tutoring does not need hype operators. It needs disciplined people who can identify real academic breakdown and move the right families into the right system.</p>
                    <p>The role is selective because bad placement damages the system. Precision matters more than volume.</p>
                  </div>
                  <div className="rounded-[24px] border border-[#E0CCBE] bg-white/58 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A4B35]">Role core</p>
                    <p className="mt-3 text-base font-semibold leading-7 text-[#1A1A1A]">
                      Identify need.
                      <br />
                      Qualify families.
                      <br />
                      Place accurately.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="rounded-full px-8 shadow-sm" style={{ backgroundColor: "#B9382F" }} onClick={() => navigate("/affiliate/signup")}>
                    Apply for Access
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

                <div className="mt-7 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[22px] border border-[#E6D4C7] bg-white/72 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A4B35]">Screening</p>
                    <p className="mt-2 text-sm leading-6 text-[#4F4742]">Selective from the start. Weak-fit conversations end early.</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E6D4C7] bg-white/72 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A4B35]">Positioning</p>
                    <p className="mt-2 text-sm leading-6 text-[#4F4742]">You work inside a defined TT system, not an improvised pitch.</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E6D4C7] bg-white/72 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A4B35]">Earnings</p>
                    <p className="mt-2 text-sm leading-6 text-[#4F4742]">Performance-linked from real outcomes, not activity theatre.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:content-start">
              <Card className="rounded-[28px] border border-[#2A211D] bg-[#1F1814] p-5 text-white shadow-[0_18px_50px_rgba(25,19,16,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-bold uppercase tracking-tight text-[#E63946]">RESPONSE</span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75">
                    Frontline role
                  </span>
                </div>
                <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFB7A6]">What wins here</p>
                <div className="mt-4 space-y-2.5">
                  {operatorTraits.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-white/82">
                      <Dot className="h-5 w-5 text-[#FF917B]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[28px] border border-[#E5D3C5] bg-white/82 p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">Filter logic</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[#1A1A1A]">No need.</p>
                <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]">No placement.</p>
                <p className="mt-3 text-sm leading-6 text-[#5D5550]">This role rewards accurate qualification.</p>
              </Card>

              <Card className="rounded-[28px] border border-[#DEC9B9] bg-[#F3E3D5] p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">Earning model</p>
                <p className="mt-3 text-xl font-bold text-[#1A1A1A]">Activation first.</p>
                <p className="text-xl font-bold text-[#1A1A1A]">Retention after.</p>
                <p className="mt-3 text-sm leading-6 text-[#5B4E46]">Performance-linked from the start.</p>
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
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#5A524C]">You are not here to push harder. You are here to qualify more accurately and protect the quality of placement.</p>
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
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">If you need urgency, persuasion tricks, or emotional pressure to create movement, this role is the wrong fit.</p>
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
          <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
            <Card className="rounded-[30px] border border-[#E4D2C4] bg-white p-7 shadow-sm sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">Role definition</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1A1A1A]">Education Growth Partner</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#EFE1D6] bg-[#FFFAF6] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4B35]">You do</p>
                  <div className="mt-4 space-y-3">
                    {rolePoints.map((item) => (
                      <p key={item} className="text-sm leading-7 text-[#574F49]">{item}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#EFE1D6] bg-[#F8F1EB] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4B35]">You do not</p>
                  <div className="mt-4 space-y-3">
                    {nonRolePoints.map((item) => (
                      <p key={item} className="text-sm leading-7 text-[#574F49]">{item}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-[24px] border border-[#E6D1BF] bg-[#F7ECE1] px-5 py-4">
                <p className="text-sm leading-7 text-[#483E38]">You operate at the front of the TT system. Your value is not noise. It is accurate placement.</p>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-[30px] border border-[#E0D1C3] bg-[#F0E2D5] shadow-sm">
              <div className="border-b border-black/5 px-7 py-6 sm:px-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">How you earn</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1A1A1A]">Activation first. Retention after.</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#5B4E46]">The earning model is there to reward accurate placement, not activity theatre.</p>
              </div>
              <div className="grid gap-4 p-7 sm:p-8">
                {earningPoints.map((item, index) => (
                  <div key={item} className="grid grid-cols-[46px_1fr] gap-4 rounded-[22px] border border-white/55 bg-white/72 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B9382F] text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-[#4D4741]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-black/5 px-7 py-5 sm:px-8">
                <p className="text-sm font-semibold leading-7 text-[#1A1A1A]">No effort to outcome conversion means no income. No fit means no placement.</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="relative py-16 sm:py-20">
          <div className="absolute inset-0 bg-[#181412]" />
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(247,239,231,1)_0%,rgba(247,239,231,0)_100%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-7 text-white sm:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFB5A6]">Operating principle</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">If there is no need, you walk away.</h2>
                <p className="mt-5 max-w-xl text-sm leading-8 text-white/72 sm:text-base">
                  TT does not need more conversations. It needs the right conversations. The system works when operators listen properly, disqualify early, and stay locked in only where the fit is real.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {principleCards.map((item) => (
                  <Card key={item.title} className="rounded-[24px] border border-white/10 bg-[#221C18] p-6 text-white shadow-none">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{item.body}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:px-12 md:py-20">
          <div className="rounded-[32px] border border-[#E5D3C5] bg-white/82 px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A4B35]">Final filter</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#1A1A1A] sm:text-4xl">
              We are not looking for volume.
              <span className="block text-[#7C2D21]">We are looking for precision.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#57504B] sm:text-lg">
              If that feels constraining, this is not your lane. If that feels clean, then apply and let the screening process decide whether you belong inside the system.
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-full px-8 shadow-sm"
              style={{ backgroundColor: "#B9382F" }}
              onClick={() => navigate("/affiliate/signup")}
            >
              Apply for Access
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
            Education Growth Partner
          </p>
        </div>
      </footer>
    </div>
  );
}
