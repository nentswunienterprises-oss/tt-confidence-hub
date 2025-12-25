import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Zap, Check, Heart, Sparkles, Star } from "lucide-react";

export default function ClientLanding() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              TERRITORIAL TUTORING
            </span>
            <span className="text-sm sm:text-xl font-bold" style={{ color: "#E63946" }}>+</span>
          </div>
          
          {/* App Name - Center (hidden on mobile) */}
          <div className="hidden md:block">
            <span className="text-2xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              THE CONFIDENCE HUB
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="text-sm sm:text-base font-medium hover:bg-transparent px-2 sm:px-4"
              style={{ color: "#1A1A1A" }}
              onClick={() => navigate("/client/signup")}
            >
              Log In
            </Button>
            <Button
              className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full"
              style={{ backgroundColor: "#E63946", color: "white" }}
              onClick={() => navigate("/client/signup")}
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-4 sm:pt-8 md:pt-16 pb-12 sm:pb-20">
        {/* Mobile App Title */}
        <div className="md:hidden text-center mb-6">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            THE CONFIDENCE HUB
          </span>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="space-y-5 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
              <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
                For Parents of Grade 6–9 Students
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
              We Don't Just Tutor.
              <br />
              <span style={{ color: "#E63946" }}>We Build Confidence.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
              Give your child the gift of mathematical confidence. Through our Pods, 
              students don't just learn math - they learn to <span className="font-semibold" style={{ color: "#1A1A1A" }}>believe in themselves</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button
                size="lg"
                className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "#E63946", color: "white" }}
                onClick={() => navigate("/client/signup")}
              >
                Start Your Child's Journey
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-medium"
                    style={{ 
                      backgroundColor: i % 2 === 0 ? "#FFF0F0" : "#E63946", 
                      borderColor: "#FFF5ED",
                      color: i % 2 === 0 ? "#E63946" : "white"
                    }}
                  >
                    {i % 2 === 0 ? "★" : "✓"}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm sm:text-base font-semibold" style={{ color: "#1A1A1A" }}>Trusted by 500+ families</p>
                <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>across South Africa</p>
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-3xl transform rotate-3"
              style={{ backgroundColor: "#FFF0F0" }}
            />
            <img
              src="/images/Benefits-of-Online-Tutoring-1-1080x589.png"
              alt="Student learning with confidence"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
              style={{ aspectRatio: "4/3" }}
            />
            
            {/* Floating card */}
            <div 
              className="absolute -bottom-4 sm:-bottom-6 left-2 sm:-left-6 md:-left-12 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-xl"
              style={{ backgroundColor: "white" }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#FFF0F0" }}
                >
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" style={{ color: "#E63946" }} />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-lg" style={{ color: "#1A1A1A" }}>Confidence First</p>
                  <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>Grades follow naturally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "white" }}>
              How It Works
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#A0A0A0" }}>
              Our approach to building your child's confidence
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                number: "1",
                title: "Personalized Mentorship",
                description: "Your child gets matched with a trained tutor who meets them online, building a real connection."
              },
              {
                number: "2",
                title: "Proven Method",
                description: "Our Confidence Formula targets the root causes of math anxiety, not just test scores."
              },
              {
                number: "3",
                title: "Real Results",
                description: "Weekly progress tracking, honest feedback, and visible confidence growth you can see."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl"
                style={{ backgroundColor: "#2A2A2A" }}
              >
                <div 
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 sm:mb-6"
                  style={{ backgroundColor: "#E63946", color: "white", fontFamily: "Georgia, serif", fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: "500", fontStyle: "italic" }}
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

      {/* What You Get Section */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "#1A1A1A" }}>
              What You Get
            </h2>
            <p className="text-base sm:text-lg" style={{ color: "#5A5A5A" }}>
              Everything your child needs to succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card 
              className="p-5 sm:p-6 md:p-8 border-0 shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <div className="space-y-4 sm:space-y-6">
                {[
                  { title: "Weekly Progress Updates", desc: "Real-time insights into your child's growth and next steps" },
                  { title: "Structured Sessions", desc: "Consistent, predictable tutoring schedule that fits your family" },
                  { title: "Expert Support", desc: "Territory Directors who ensure tutor quality and consistency" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4">
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#FFF0F0" }}
                    >
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

            <Card 
              className="p-5 sm:p-6 md:p-8 border-0 shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <div className="space-y-4 sm:space-y-6">
                {[
                  { title: "Limited Trial (First 6-8 Weeks)", desc: "Join an experimental phase at no cost - see if it's right for your family" },
                  { title: "Accountability & Growth", desc: "Reflections, feedback loops, and celebration of wins" },
                  { title: "Confidence Blueprint", desc: "Psychologically-designed system that proves confidence is teachable" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4">
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#FFF0F0" }}
                    >
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
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: "#E63946" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <div className="flex justify-center gap-0.5 sm:gap-1 mb-4 sm:mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white" />
            ))}
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl font-medium text-white mb-4 sm:mb-6 leading-relaxed">
            "My daughter went from hiding in the back of class to raising her hand every day. That's our real win."
          </p>
          <p className="text-white/80 text-sm sm:text-base">
            - Nomsa M., Parent from Johannesburg
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: "white" }}>
            Ready to Transform Your Child's Confidence?
          </h2>
          <p className="text-base sm:text-lg mb-8 sm:mb-10" style={{ color: "#A0A0A0" }}>
            Join hundreds of families across South Africa who chose confidence first.
          </p>
          <Button
            size="lg"
            className="text-base sm:text-lg font-semibold px-6 sm:px-10 py-4 sm:py-6 rounded-full border-0 outline-none"
            style={{ backgroundColor: "#E63946", color: "white" }}
            onClick={() => navigate("/client/signup")}
          >
            Start Your Child's Journey Today
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
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
                Territorial Tutoring is reimagining mathematics education through confidence-first mentorship.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-sm sm:text-base" style={{ color: "#1A1A1A" }}>Get Involved</h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/operational/landing")}
                  className="text-xs sm:text-sm block transition hover:underline"
                  style={{ color: "#5A5A5A" }}
                >
                  Become a Tutor
                </button>
                <button
                  onClick={() => navigate("/affiliate/landing")}
                  className="text-xs sm:text-sm block transition hover:underline"
                  style={{ color: "#5A5A5A" }}
                >
                  Affiliate Program
                </button>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4 sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold text-sm sm:text-base" style={{ color: "#1A1A1A" }}>Contact</h4>
              <p className="text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
                Questions? We're here to help.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                TERRITORIAL TUTORING
              </span>
              <span className="text-base sm:text-xl font-bold" style={{ color: "#E63946" }}>+</span>
            </div>
            <p className="text-center md:text-right text-xs sm:text-sm" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br />
              <span className="text-xs sm:text-sm">The Confidence Company.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
