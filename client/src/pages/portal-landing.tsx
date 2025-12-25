import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Zap, Check, Heart, Sparkles, Star } from "lucide-react";

export default function ClientLanding() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(250, 248, 245, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              TERRITORIAL TUTORING
            </span>
            <span className="text-xl font-bold" style={{ color: "#E85A2C" }}>+</span>
          </div>
          
          {/* App Name - Center */}
          <div className="hidden md:block">
            <span className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              THE CONFIDENCE HUB
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-base font-medium hover:bg-transparent"
              style={{ color: "#1A1A1A" }}
              onClick={() => navigate("/client/signup")}
            >
              Log In
            </Button>
            <Button
              className="text-base font-semibold px-6 py-5 rounded-full"
              style={{ backgroundColor: "#E85A2C", color: "white" }}
              onClick={() => navigate("/client/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#FEF3EE" }}>
              <span className="text-sm font-medium" style={{ color: "#E85A2C" }}>
                For Parents of Grade 6–9 Students
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
              We Don't Just Tutor.
              <br />
              <span style={{ color: "#E85A2C" }}>We Build Confidence.</span>
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
              Give your child the gift of mathematical confidence. Through our Pods, 
              students don't just learn math - they learn to <span className="font-semibold" style={{ color: "#1A1A1A" }}>believe in themselves</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="text-lg font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "#E85A2C", color: "white" }}
                onClick={() => navigate("/client/signup")}
              >
                Start Your Child's Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium"
                    style={{ 
                      backgroundColor: i % 2 === 0 ? "#FEF3EE" : "#E85A2C", 
                      borderColor: "#FAF8F5",
                      color: i % 2 === 0 ? "#E85A2C" : "white"
                    }}
                  >
                    {i % 2 === 0 ? "★" : "✓"}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#1A1A1A" }}>Trusted by 500+ families</p>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>across South Africa</p>
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-3xl transform rotate-3"
              style={{ backgroundColor: "#FEF3EE" }}
            />
            <img
              src="/images/Benefits-of-Online-Tutoring-1-1080x589.png"
              alt="Student learning with confidence"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
              style={{ aspectRatio: "4/3" }}
            />
            
            {/* Floating card */}
            <div 
              className="absolute -bottom-6 -left-6 md:-left-12 p-4 md:p-6 rounded-2xl shadow-xl"
              style={{ backgroundColor: "white" }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#FEF3EE" }}
                >
                  <Heart className="w-6 h-6 fill-current" style={{ color: "#E85A2C" }} />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: "#1A1A1A" }}>Confidence First</p>
                  <p className="text-sm" style={{ color: "#5A5A5A" }}>Grades follow naturally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "white" }}>
              How It Works
            </h2>
            <p className="text-lg" style={{ color: "#A0A0A0" }}>
              Our approach to building your child's confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                className="p-8 rounded-2xl"
                style={{ backgroundColor: "#2A2A2A" }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#E85A2C", color: "white", fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: "500", fontStyle: "italic" }}
                >
                  {item.number}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "white" }}>
                  {item.title}
                </h3>
                <p style={{ color: "#A0A0A0" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#1A1A1A" }}>
              What You Get
            </h2>
            <p className="text-lg" style={{ color: "#5A5A5A" }}>
              Everything your child needs to succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card 
              className="p-8 border-0 shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <div className="space-y-6">
                {[
                  { title: "Weekly Progress Updates", desc: "Real-time insights into your child's growth and next steps" },
                  { title: "Structured Sessions", desc: "Consistent, predictable tutoring schedule that fits your family" },
                  { title: "Expert Support", desc: "Territory Directors who ensure tutor quality and consistency" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#FEF3EE" }}
                    >
                      <Check className="w-4 h-4" style={{ color: "#E85A2C" }} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: "#1A1A1A" }}>{item.title}</h4>
                      <p className="text-sm" style={{ color: "#5A5A5A" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card 
              className="p-8 border-0 shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <div className="space-y-6">
                {[
                  { title: "Limited Trial (First 6-8 Weeks)", desc: "Join an experimental phase at no cost - see if it's right for your family" },
                  { title: "Accountability & Growth", desc: "Reflections, feedback loops, and celebration of wins" },
                  { title: "Confidence Blueprint", desc: "Psychologically-designed system that proves confidence is teachable" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#FEF3EE" }}
                    >
                      <Check className="w-4 h-4" style={{ color: "#E85A2C" }} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: "#1A1A1A" }}>{item.title}</h4>
                      <p className="text-sm" style={{ color: "#5A5A5A" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16" style={{ backgroundColor: "#E85A2C" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 fill-current text-white" />
            ))}
          </div>
          <p className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
            "My daughter went from hiding in the back of class to raising her hand every day. That's our real win."
          </p>
          <p className="text-white/80">
            - Nomsa M., Parent from Johannesburg
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "white" }}>
            Ready to Transform Your Child's Confidence?
          </h2>
          <p className="text-lg mb-10" style={{ color: "#A0A0A0" }}>
            Join hundreds of families across South Africa who chose confidence first.
          </p>
          <Button
            size="lg"
            className="text-lg font-semibold px-10 py-6 rounded-full border-0 outline-none"
            style={{ backgroundColor: "#E85A2C", color: "white" }}
            onClick={() => navigate("/client/signup")}
          >
            Start Your Child's Journey Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8 pb-8 mb-8 border-b" style={{ borderColor: "#E5E5E5" }}>
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: "#1A1A1A" }}>About TT</h4>
              <p className="text-sm" style={{ color: "#5A5A5A" }}>
                Territorial Tutoring is reimagining mathematics education through confidence-first mentorship.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: "#1A1A1A" }}>Get Involved</h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/operational/landing")}
                  className="text-sm block transition hover:underline"
                  style={{ color: "#5A5A5A" }}
                >
                  Become a Tutor
                </button>
                <button
                  onClick={() => navigate("/affiliate/landing")}
                  className="text-sm block transition hover:underline"
                  style={{ color: "#5A5A5A" }}
                >
                  Affiliate Program
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: "#1A1A1A" }}>Contact</h4>
              <p className="text-sm" style={{ color: "#5A5A5A" }}>
                Questions? We're here to help.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                TERRITORIAL TUTORING
              </span>
              <span className="text-xl font-bold" style={{ color: "#E85A2C" }}>+</span>
            </div>
            <p className="text-center md:text-right" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br />
              <span className="text-sm">The Confidence Company.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
