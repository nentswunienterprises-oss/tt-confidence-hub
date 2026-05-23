import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponseIntegrityLogo } from "@/components/ResponseIntegrityLogo";
import {
  getFastTrackBadgeLabel,
  getFastTrackDescription,
  getFastTrackExtraParams,
  isFastTrackAccessEnabled,
} from "@/lib/fastTrackAccess";
import { buildTrackedPath, buildTrackedReturnTo } from "@/lib/publicTracking";
import { ArrowRight, Check, Instagram } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function PortalLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const landingReturnTo = buildTrackedReturnTo(location.pathname, location.search);
  const fastTrackEnabled = isFastTrackAccessEnabled(location.search);
  const fastTrackBadge = getFastTrackBadgeLabel(location.search);
  const fastTrackDescription = getFastTrackDescription(location.search);
  const fastTrackParams = getFastTrackExtraParams(location.search);

  const buildParentIntakeUrl = () =>
    buildTrackedPath("/client/intake", location.search, {
      returnTo: landingReturnTo,
      ...fastTrackParams,
    });

  const buildLoginUrl = () =>
    buildTrackedPath("/client/signup", location.search, {
      mode: "login",
      lock: "login",
      returnTo: landingReturnTo,
      ...fastTrackParams,
    });

  const buildDirectSignupUrl = () =>
    buildTrackedPath("/client/signup", location.search, {
      mode: "signup",
      returnTo: landingReturnTo,
      ...fastTrackParams,
    });

  const privacyPolicyUrl = buildTrackedPath("/privacy-policy", location.search, {
    returnTo: landingReturnTo,
  });

  const termsOfUseUrl = buildTrackedPath("/terms-of-use", location.search, {
    returnTo: landingReturnTo,
  });

  const aboutUrl = buildTrackedPath("/about", location.search, {
    returnTo: landingReturnTo,
  });

  const wallpaperSvg = "";
  const svgEncoded = encodeURIComponent(wallpaperSvg);
  const wallpaperCss = `
.math-wallpaper {
  background-image: url("data:image/svg+xml;utf8,${svgEncoded}");
  background-repeat: repeat;
  background-size: 160px 160px;
}
@media (min-width: 768px) {
  .math-wallpaper { background-size: 240px 240px; }
}
`;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#FFF5ED" }}>
      <style dangerouslySetInnerHTML={{ __html: wallpaperCss }} />

      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-center sm:justify-between">
          <div className="flex-shrink-0 scale-90 origin-center sm:origin-left">
            <ResponseIntegrityLogo size="lg" variant="integrity" />
          </div>

          <div className="hidden md:block">
            <span className="text-2xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              RESPONSE TRAINING
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="text-sm sm:text-base font-medium hover:bg-transparent px-2 sm:px-4"
              style={{ color: "#1A1A1A" }}
              onClick={() => navigate(buildLoginUrl())}
            >
              Log In
            </Button>
            <Button
              className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: "#E63946", color: "white" }}
              onClick={() => navigate(buildParentIntakeUrl())}
            >
              <span className="hidden sm:inline">Check Intake</span>
              <span className="sm:hidden">Intake</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="h-16 sm:h-20" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-4 sm:pt-8 md:pt-16 md:-mt-12 lg:-mt-14 xl:-mt-16 pb-12 sm:pb-20">
        <div className="md:hidden text-center mb-6">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            RESPONSE TRAINING
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-5 sm:space-y-8 max-w-[calc(100vw-32px)]">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full px-3 py-1.5 sm:mx-0 sm:px-4 sm:py-2" style={{ backgroundColor: "#FFF0F0" }}>
              <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
                For Parents of Grade 6-9 Students
              </span>
            </div>

            <h1 className="text-center sm:text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
              Calm Execution
              <br />
              <span style={{ color: "#E63946" }}>Under Pressure.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
              Some students do not struggle because they are bad at math or not intelligent.
              <br />
              They struggle because pressure disrupts the way they respond.
              <br />
              Response Integrity trains that response directly.
            </p>

            <div className="w-full pt-2 sm:pt-4">
              <Button
                size="lg"
                className="w-full text-base sm:text-lg font-semibold px-4 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all border-0 flex items-center justify-center gap-3 leading-tight"
                style={{ backgroundColor: "#E63946", color: "white" }}
                onClick={() => navigate(buildParentIntakeUrl())}
              >
                <span>Check Current Intake Window</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          <div className="relative overflow-visible w-full max-w-full">
            <div className="absolute inset-0 rounded-3xl hidden sm:block transform sm:rotate-3" style={{ backgroundColor: "#FFF0F0" }} />
            <img
              src="/images/Benefits-of-Online-Tutoring-1-1080x589.png"
              alt="Student training calm focus"
              className="relative rounded-3xl shadow-2xl w-full object-cover max-w-[calc(100vw-32px)]"
              style={{ aspectRatio: "4/3" }}
            />

            <div className="absolute -bottom-4 sm:-bottom-6 left-2 sm:left-2 md:-left-12 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-xl" style={{ backgroundColor: "white" }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div>
                  <p className="font-bold text-sm sm:text-lg" style={{ color: "#1A1A1A" }}>Calm First</p>
                  <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>Confidence follows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="rounded-[30px] border border-[#E5D3C5] bg-white/82 p-5 sm:p-6 md:p-8 shadow-sm">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#8A4B35" }}>
                Protected Rhythm
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                Two annual intakes. One standard.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-7" style={{ color: "#5A5A5A" }}>
                Families enter through a defined intake and continue on a cadence that prepares response ahead of pressure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {fastTrackEnabled ? (
        <section className="pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <div className="rounded-[30px] border border-dashed border-[#D9B8AA] bg-[#FFF8F4] p-5 sm:p-6 md:p-8 shadow-sm">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#8A4B35" }}>
                  {fastTrackBadge}
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                  Direct parent signup is unlocked.
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-7" style={{ color: "#5A5A5A" }}>
                  {fastTrackDescription}
                </p>
                <div className="mt-6">
                  <Button
                    className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: "#1A1A1A", color: "white" }}
                    onClick={() => navigate(buildDirectSignupUrl())}
                  >
                    Direct Parent Signup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "white" }}>
              How It Works
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#A0A0A0" }}>
              A conditioning system that builds stable response through cadence, repetition, and preparation before pressure peaks, not casual last-minute tutoring.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                number: "1",
                title: "Preparation Starts Early",
                description: "Students begin building response patterns before tests, exams, and classroom urgency take over.",
              },
              {
                number: "2",
                title: "Patterns Get Repeated",
                description: "Through consistent weekly exposure, structure becomes familiar and calm execution stops depending on mood or confidence.",
              },
              {
                number: "3",
                title: "Pressure Feels Familiar",
                description: "Controlled difficulty is introduced gradually, so your child learns to stay unshaken when uncertainty and time pressure appear.",
              },
            ].map((item) => (
              <div key={item.number} className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl" style={{ backgroundColor: "#2A2A2A" }}>
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 sm:mb-6"
                  style={{ backgroundColor: "#E63946", color: "white", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}
                >
                  {item.number}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: "white" }}>
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base" style={{ color: "#A0A0A0" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 math-wallpaper" style={{ backgroundColor: "#FFF0F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "#1A1A1A" }}>
              What This Conditioning Builds
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#5A5A5A" }}>
              These changes come from repeated exposure, structured progression, and preparation before pressure peaks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="p-5 sm:p-6 md:p-8 border-0 shadow-lg" style={{ backgroundColor: "#FFF5ED" }}>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { title: "Someone Who Does Not Freeze", desc: "When the question breaks expectation, they stay calm and execute their trained response." },
                  { title: "Someone Parents Trust", desc: "Parents are able to step back from constant oversight. Their ability to handle pressure becomes more predictable." },
                  { title: "Someone Built Through Structure", desc: "Part of a system that values consistency, clarity, and structured preparation." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0F0" }}>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#E63946" }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1" style={{ color: "#1A1A1A" }}>{item.title}</h4>
                      <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6 md:p-8 border-0 shadow-lg" style={{ backgroundColor: "#FFF5ED" }}>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { title: "Someone Less Thrown by Exams", desc: "Pressure feels familiar. Performance stays stable across terms." },
                  { title: "Someone Less Defined by Setbacks", desc: "Instead of being defined by difficulty, they learn how to respond when it gets hard." },
                  { title: "Someone Ready For What Is Next", desc: "Academic pressure becomes more manageable. The future feels less uncertain." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0F0" }}>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#E63946" }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1" style={{ color: "#1A1A1A" }}>{item.title}</h4>
                      <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-8 sm:mt-10 grid gap-4 max-w-5xl mx-auto md:grid-cols-2 xl:grid-cols-[280px_1fr_1fr]">
            <Card className="border-[#EEDFD3] bg-white/84 p-5 sm:p-6 shadow-sm xl:h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#E63946" }}>
                Full-Year Conditioning Intake
              </p>
              <p className="mt-3 text-sm leading-7" style={{ color: "#5A5A5A" }}>
                Built for families preparing before the academic year becomes urgent.
              </p>
            </Card>

            <Card className="border-[#EEDFD3] bg-white/84 p-5 sm:p-6 shadow-sm xl:h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#E63946" }}>
                Mid-Year Conditioning Intake
              </p>
              <p className="mt-3 text-sm leading-7" style={{ color: "#5A5A5A" }}>
                Built for families who still have serious runway before final-year pressure peaks.
              </p>
            </Card>

            <Card className="border-[#EEDFD3] bg-white/84 p-5 sm:p-6 shadow-sm xl:h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#8A4B35" }}>
                Standard
              </p>
              <p className="mt-3 text-sm sm:text-base font-semibold leading-7" style={{ color: "#1A1A1A" }}>
                2 sessions per week.
                <br />
                8 sessions per month.
                <br />
                No panic enrollment.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "white" }}>
            Ready to Start With Intention?
          </h2>
          <p className="text-base sm:text-lg mb-8 sm:mb-10" style={{ color: "#A0A0A0" }}>
            Response Integrity works best when preparation begins early and continues through stable weekly cadence.
          </p>
          <div className="w-full">
            <Button
              size="lg"
              className="w-full text-base sm:text-lg font-semibold px-4 sm:px-10 py-4 sm:py-6 rounded-full border-0 outline-none flex items-center justify-center gap-3 leading-tight"
              style={{ backgroundColor: "#E63946", color: "white" }}
              onClick={() => navigate(buildParentIntakeUrl())}
            >
              <span>Check Current Intake Window</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 sm:py-12" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pb-6 sm:pb-8 mb-6 sm:mb-8 border-b" style={{ borderColor: "#E5E5E5" }}>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-sm sm:text-base" style={{ color: "#1A1A1A" }}>About Response Integrity</h4>
              <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                Response Integrity is built for families who believe in preparation before pressure arrives. Our system values cadence, consistency, and early conditioning. For this reason, enrollment happens through defined conditioning windows, and students are expected to maintain the training rhythm required for stable response development.
              </p>
              <div className="space-y-2 pt-2">
                <a href={privacyPolicyUrl} className="text-xs sm:text-sm block hover:underline" style={{ color: "#5A5A5A" }}>
                  Privacy Policy
                </a>
                <a href={termsOfUseUrl} className="text-xs sm:text-sm block hover:underline" style={{ color: "#5A5A5A" }}>
                  Terms of Use
                </a>
                <a href={aboutUrl} className="text-xs sm:text-sm block hover:underline" style={{ color: "#5A5A5A" }}>
                  More About Us
                </a>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold text-sm sm:text-base" style={{ color: "#1A1A1A" }}>FAQ</h4>
              <a href="/faq" className="text-xs sm:text-sm block text-blue-600 hover:underline" style={{ color: "#2563eb" }}>
                Have a question?
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 sm:gap-6">
            <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4">
              <div>
                <ResponseIntegrityLogo size="md" variant="integrity" />
              </div>
              <a
                href="https://www.instagram.com/responseintegritysa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Response Integrity on Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-80 md:ml-[8.75rem]"
                style={{ backgroundColor: "#FFF0F0", color: "#E63946" }}
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <p className="text-center md:text-right text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Response Integrity (Pty) Ltd
              <br />
              <span className="text-xs sm:text-sm">Math Pressure Response-Training.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PortalLanding;
