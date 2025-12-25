import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/images/logo.png" 
              alt="Territorial Tutoring" 
              className="h-12 md:h-14 object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist yet
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden">
              <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                TERRITORIAL TUTORING
              </span>
              <span className="text-xl font-bold" style={{ color: "#E85A2C" }}>+</span>
            </div>
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
              onClick={() => window.location.href = "/auth?mode=login"}
            >
              Log In
            </Button>
            <Button
              className="text-base font-semibold px-6 py-5 rounded-full"
              style={{ backgroundColor: "#E85A2C", color: "white" }}
              onClick={() => window.location.href = "/auth?mode=signup"}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-4 md:pt-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#FEF3EE" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#E85A2C" }} />
              <span className="text-sm font-medium" style={{ color: "#E85A2C" }}>
                Confidence-First Tutoring for Grades 6–9
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
              We Don't Just Tutor.
              <br />
              <span style={{ color: "#E85A2C" }}>We Build Confidence.</span>
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
              At Territorial Tutoring, we believe every child deserves to feel capable. 
              Our tutors work with <span className="font-semibold" style={{ color: "#1A1A1A" }}>Grade 6–9 students</span> to 
              ignite self-belief and transform how they see themselves.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="text-lg font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "#E85A2C", color: "white" }}
                onClick={() => window.location.href = "/auth?mode=signup"}
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg font-medium px-8 py-6 rounded-full border-2"
                style={{ borderColor: "#1A1A1A", color: "#1A1A1A", backgroundColor: "transparent" }}
                onClick={() => window.location.href = "/auth?mode=login"}
              >
                I'm Already a Member
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
                      borderColor: "#FFF5ED",
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
              onError={(e) => {
                // Fallback gradient if image doesn't exist
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div 
              className="hidden relative rounded-3xl w-full flex items-center justify-center"
              style={{ aspectRatio: "4/3", backgroundColor: "#FEF3EE" }}
            >
              <div className="text-center p-8">
                <GraduationCap className="w-20 h-20 mx-auto mb-4" style={{ color: "#E85A2C" }} />
                <p className="text-lg font-medium" style={{ color: "#5A5A5A" }}>
                  Add hero-student.jpg to<br />client/public/images/
                </p>
              </div>
            </div>
            
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

      {/* Philosophy Section */}
      <section className="py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "white" }}>
              The Territorial Tutoring Difference
            </h2>
            <p className="text-lg" style={{ color: "#A0A0A0" }}>
              We're not another tutoring company. We're a confidence transformation movement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Confidence Blueprint",
                description: "Our proprietary method focuses on building self-belief before tackling academics. When students believe in themselves, learning becomes natural."
              },
              {
                icon: Users,
                title: "Pod System",
                description: "Students learn in small, supportive groups called Pods. Each Pod is a community where growth is celebrated and struggles are shared."
              },
              {
                icon: Sparkles,
                title: "Real Transformation",
                description: "We measure success not just in grades, but in how students carry themselves. Confidence shows up in every area of life."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl"
                style={{ backgroundColor: "#2A2A2A" }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#E85A2C" }}
                >
                  <item.icon className="w-7 h-7 text-white" />
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

      {/* Stats Section */}
      <section className="py-16" style={{ backgroundColor: "#E85A2C" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Students Transformed" },
              { number: "50+", label: "Dedicated Tutors" },
              { number: "95%", label: "Parent Satisfaction" },
              { number: "4.9", label: "Average Rating" }
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </p>
                <p className="text-white/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#1A1A1A" }}>
              Stories of Transformation
            </h2>
            <p className="text-lg" style={{ color: "#5A5A5A" }}>
              Real families, real results, real confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "My daughter went from hiding in the back of class to raising her hand every day. That's the real win.",
                name: "Nomsa M.",
                role: "Parent, Johannesburg"
              },
              {
                quote: "TT didn't just help me with maths. They helped me believe I could actually do it.",
                name: "Thabo K.",
                role: "Grade 9 Student"
              },
              {
                quote: "Being a TT tutor changed how I see education. It's not about information transfer—it's about transformation.",
                name: "Lerato P.",
                role: "Territorial Tutor"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="p-8 border-0 shadow-lg"
                style={{ backgroundColor: "white" }}
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-current" style={{ color: "#E85A2C" }} />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed" style={{ color: "#1A1A1A" }}>
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold" style={{ color: "#1A1A1A" }}>{testimonial.name}</p>
                  <p className="text-sm" style={{ color: "#5A5A5A" }}>{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#1A1A1A" }}>
              Join the Movement
            </h2>
            <p className="text-lg" style={{ color: "#5A5A5A" }}>
              Whether you're a parent, a student, or want to become a tutor—there's a place for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Parent/Student */}
            <Card 
              className="p-8 border-2 hover:border-[#E85A2C] cursor-pointer transition-all hover:shadow-xl group"
              style={{ borderColor: "#E5E5E5" }}
              onClick={() => window.location.href = "/portal-landing"}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "#FEF3EE" }}
              >
                <Heart className="w-8 h-8" style={{ color: "#E85A2C" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Parents & Students
              </h3>
              <p className="mb-6" style={{ color: "#5A5A5A" }}>
                Enroll your Grade 6–9 child in our confidence-building tutoring program.
              </p>
              <ul className="space-y-3 mb-8">
                {["Access to dedicated tutors", "Track confidence growth", "Weekly progress updates", "Parent dashboard"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#E85A2C" }} />
                    <span style={{ color: "#5A5A5A" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full rounded-full py-6 font-semibold group-hover:shadow-lg transition-all"
                style={{ backgroundColor: "#E85A2C", color: "white" }}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            {/* Tutor */}
            <Card 
              className="p-8 border-2 hover:border-[#E85A2C] cursor-pointer transition-all hover:shadow-xl group"
              style={{ borderColor: "#E5E5E5" }}
              onClick={() => window.location.href = "/auth?mode=signup"}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "#FEF3EE" }}
              >
                <GraduationCap className="w-8 h-8" style={{ color: "#E85A2C" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Become a Tutor
              </h3>
              <p className="mb-6" style={{ color: "#5A5A5A" }}>
                Join our team of confidence-builders and transform lives while earning.
              </p>
              <ul className="space-y-3 mb-8">
                {["Flexible schedule", "Meaningful work", "Training provided", "Grow your income"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#E85A2C" }} />
                    <span style={{ color: "#5A5A5A" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full rounded-full py-6 font-semibold group-hover:shadow-lg transition-all"
                style={{ backgroundColor: "#E85A2C", color: "white" }}
              >
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            {/* Team */}
            <Card 
              className="p-8 border-2 hover:border-[#E85A2C] cursor-pointer transition-all hover:shadow-xl group"
              style={{ borderColor: "#E5E5E5" }}
              onClick={() => window.location.href = "/auth?mode=login"}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "#FEF3EE" }}
              >
                <Target className="w-8 h-8" style={{ color: "#E85A2C" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Team Login
              </h3>
              <p className="mb-6" style={{ color: "#5A5A5A" }}>
                For Territory Directors, Operations team, and existing tutors.
              </p>
              <ul className="space-y-3 mb-8">
                {["Manage your pods", "Track student progress", "Access broadcasts", "View analytics"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#E85A2C" }} />
                    <span style={{ color: "#5A5A5A" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline"
                className="w-full rounded-full py-6 font-semibold border-2 group-hover:shadow-lg transition-all"
                style={{ borderColor: "#1A1A1A", color: "#1A1A1A" }}
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "white" }}>
            Ready to Transform Confidence?
          </h2>
          <p className="text-lg mb-10" style={{ color: "#A0A0A0" }}>
            Join hundreds of families across South Africa who chose confidence first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg font-semibold px-10 py-6 rounded-full"
              style={{ backgroundColor: "#E85A2C", color: "white" }}
              onClick={() => window.location.href = "/auth?mode=signup"}
            >
              Start Your Journey Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
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
              <span className="text-sm">
                Manufacturing Confidence & Financial Independence in South African Youth.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
