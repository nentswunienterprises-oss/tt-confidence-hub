import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TerritorialTutoringLogoSVG } from "@/components/TerritorialTutoringLogoSVG";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Instagram } from "lucide-react";
function PortalLanding() {
    var navigate = useNavigate();
    // Read affiliate and tracking parameters from URL (silent tracking)
    var urlParams = new URLSearchParams(window.location.search);
    var affiliateCode = urlParams.get('affiliate') || '';
    var trackingSource = urlParams.get('utm_source') || '';
    var trackingCampaign = urlParams.get('utm_campaign') || '';
    // Build signup URL with all parameters preserved
    var buildSignupUrl = function () {
        var params = new URLSearchParams();
        if (affiliateCode)
            params.append('affiliate', affiliateCode);
        if (trackingSource)
            params.append('utm_source', trackingSource);
        if (trackingCampaign)
            params.append('utm_campaign', trackingCampaign);
        return "/client/signup".concat(params.toString() ? "?".concat(params.toString()) : '');
    };
    // If you use useAuth or other hooks, initialize them here
    // const { ... } = useAuth();
    // If wallpaperSvg is defined elsewhere, ensure it's present. Otherwise, define it or import it.
    var wallpaperSvg = '';
    var svgEncoded = encodeURIComponent(wallpaperSvg);
    var wallpaperCss = "\n.math-wallpaper {\n  background-image: url(\"data:image/svg+xml;utf8,".concat(svgEncoded, "\");\n  background-repeat: repeat;\n  background-size: 160px 160px;\n}\n@media (min-width: 768px) {\n  .math-wallpaper { background-size: 240px 240px; }\n}\n");
    return (<div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      <style dangerouslySetInnerHTML={{ __html: wallpaperCss }}/>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <TerritorialTutoringLogoSVG width={190}/>

          <div className="hidden md:block">
            <span className="text-2xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              RESPONSE  TRAINING
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" className="text-sm sm:text-base font-medium hover:bg-transparent px-2 sm:px-4" style={{ color: "#1A1A1A" }} onClick={function () { return navigate("/client/signup?mode=login"); }}>
              Log In
            </Button>
            <Button className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: "#E63946", color: "white" }} onClick={function () { return navigate(buildSignupUrl()); }}>
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="h-16 sm:h-20"/>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-4 sm:pt-8 md:pt-16 md:-mt-12 lg:-mt-14 xl:-mt-16 pb-12 sm:pb-20">
        <div className="md:hidden text-center mb-6">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            RESPONSE  TRAINING
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-5 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
              <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
                For Parents of Grade 6-9 Students
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
              Calm Execution
              <br />
              <span style={{ color: "#E63946" }}>Under Pressure.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
              Most students don’t struggle because they're bad at math or not intelligent.
              <br />
              They struggle because pressure disrupts their response.
              <br /><br />
              TT focuses on training how students respond when math gets hard... eliminating surprises through pattern and calm execution.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button size="lg" className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all border-0" style={{ backgroundColor: "#E63946", color: "white" }} onClick={function () { return navigate(buildSignupUrl()); }}>
                Start Your Child’s Journey
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2"/>
              </Button>
            </div>


          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl transform rotate-3" style={{ backgroundColor: "#FFF0F0" }}/>
            <img src="/images/Benefits-of-Online-Tutoring-1-1080x589.png" alt="Student training calm focus" className="relative rounded-3xl shadow-2xl w-full object-cover" style={{ aspectRatio: "4/3" }}/>

            <div className="absolute -bottom-4 sm:-bottom-6 left-2 sm:-left-6 md:-left-12 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-xl" style={{ backgroundColor: "white" }}>
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

      {/* How It Works */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "white" }}>
              How It Works
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#A0A0A0" }}>
              We train calm execution to be a normal response.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
            {
                number: "1",
                title: "Pattern Gets Trained",
                description: "When certainty disappears, your child stays oriented. They don't freeze. They execute."
            },
            {
                number: "2",
                title: "Calm Becomes Automatic",
                description: "Through repetition under controlled pressure, executing clearly and moving forward without emotional negotiation becomes habit."
            },
            {
                number: "3",
                title: "Identity Shifts",
                description: "Your child stops being someone who panics. They become someone who performs."
            }
        ].map(function (item, index) { return (<div key={index} className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl" style={{ backgroundColor: "#2A2A2A" }}>
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: "#E63946", color: "white", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {item.number}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: "white" }}>
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base" style={{ color: "#A0A0A0" }}>
                  {item.description}
                </p>
              </div>); })}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-12 sm:py-20 math-wallpaper" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "#1A1A1A" }}>
              Who Your Child Becomes
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#5A5A5A" }}>
              
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="p-5 sm:p-6 md:p-8 border-0 shadow-lg" style={{ backgroundColor: "white" }}>
              <div className="space-y-4 sm:space-y-6">
                {[
            { title: "Someone Who Doesn't Freeze", desc: "When the question breaks expectation, they stay calm and execute their trained response." },
            { title: "Someone Parents Trust", desc: "You stop micromanaging. Their ability to handle pressure becomes predictable." },
            { title: "Someone Who Belongs", desc: "Part of a system that values discipline over motivation. Clarity over chaos." }
        ].map(function (item, i) { return (<div key={i} className="flex gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0F0" }}>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#E63946" }}/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1" style={{ color: "#1A1A1A" }}>{item.title}</h4>
                      <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>{item.desc}</p>
                    </div>
                  </div>); })}
              </div>
            </Card>

            <Card className="p-5 sm:p-6 md:p-8 border-0 shadow-lg" style={{ backgroundColor: "white" }}>
              <div className="space-y-4 sm:space-y-6">
                {[
            { title: "Someone Exams Don't Ambush", desc: "Pressure feels familiar. Performance stays stable across terms." },
            { title: "Someone Who Stops Self-Labeling", desc: "No more 'I'm bad at math.' Just 'I know how to respond when it gets hard.'" },
            { title: "Someone Ready For What's Next", desc: "Academic pressure becomes manageable, not traumatic. The future stops feeling uncertain." }
        ].map(function (item, i) { return (<div key={i} className="flex gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0F0" }}>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "#E63946" }}/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1" style={{ color: "#1A1A1A" }}>{item.title}</h4>
                      <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>{item.desc}</p>
                    </div>
                  </div>); })}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "white" }}>
            Ready to Build Confidence the Right Way?
          </h2>
          <p className="text-base sm:text-lg mb-8 sm:mb-10" style={{ color: "#A0A0A0" }}>
            Pressure being familiar creates calm. Calm creates confidence. Confidence creates results.
          </p>
          <Button size="lg" className="text-base sm:text-lg font-semibold px-6 sm:px-10 py-4 sm:py-6 rounded-full border-0 outline-none" style={{ backgroundColor: "#E63946", color: "white" }} onClick={function () { return navigate("/client/signup"); }}>
            Start Your Child’s Journey
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2"/>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pb-6 sm:pb-8 mb-6 sm:mb-8 border-b" style={{ borderColor: "#E5E5E5" }}>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-sm sm:text-base" style={{ color: "#1A1A1A" }}>About TT</h4>
              <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                Territorial Tutoring is a performance-first math mentorship system built on clarity, repetition, and standards.
              </p>
              <div className="space-y-2 pt-2">
                <button onClick={function () { return navigate("/privacy-policy"); }} className="text-xs sm:text-sm block hover:underline" style={{ color: "#5A5A5A" }}>
                  Privacy Policy
                </button>
                <button onClick={function () { return navigate("/terms-of-use"); }} className="text-xs sm:text-sm block hover:underline" style={{ color: "#5A5A5A" }}>
                  Terms of Use
                </button>
                <button onClick={function () { return navigate("/aboutTT"); }} className="text-xs sm:text-sm block hover:underline" style={{ color: "#5A5A5A" }}>
                  More About TT
                </button>
              </div>
            </div>



            <div className="space-y-3 sm:space-y-4 sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold text-sm sm:text-base" style={{ color: "#1A1A1A" }}>FAQ</h4>
              <a href="/faq" className="text-xs sm:text-sm block text-blue-600 hover:underline" style={{ color: "#2563eb" }}>
                Have a question?
              </a>
              <div className="flex justify-center mt-2">
                <a 
                  href="https://www.instagram.com/territorialtutoring/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram" 
                  className="hover:opacity-80 transition-opacity"
                >
                  <Instagram size={24} color="#E63946" style={{ verticalAlign: "middle" }} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 ml-16 md:ml-0">
              <TerritorialTutoringLogoSVG width={150}/>
            </div>
            <p className="text-center md:text-right text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br />
              <span className="text-xs sm:text-sm">Confidence, made inevitable.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>);
}
export default PortalLanding;
