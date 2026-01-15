"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function PortalLanding() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <button
            className="text-sm sm:text-base font-medium hover:bg-transparent flex items-center gap-1 sm:gap-2 px-2 sm:px-4 bg-transparent border-none"
            style={{ color: "#1A1A1A" }}
            onClick={() => router.push("/")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            Back
          </button>
          <div className="hidden md:block">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              CONFIDENCE PODS FOR STUDENTS
            </span>
          </div>
          <button
            className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "#E63946", color: "white" }}
            onClick={() => router.push("/client/signup")}
          >
            Sign In
          </button>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 md:pt-20 pb-12 sm:pb-20">
        <div className="md:hidden text-center mb-6">
          <span className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            CONFIDENCE PODS FOR STUDENTS
          </span>
        </div>
        <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
            <span className="text-xs sm:text-sm font-medium" style={{ color: "#E63946" }}>
              For Parents & Students
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#1A1A1A" }}>
            Calm Execution<br />
            <span style={{ color: "#E63946" }}>Under Pressure.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: "#5A5A5A" }}>
            Most students don’t struggle because they don’t understand math.<br />
            They struggle because pressure disrupts their response.<br /><br />
            We train students to think clearly, execute accurately, and stay composed - so confidence becomes inevitable.
          </p>
          <button
            className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all border-0 bg-[#E63946] text-white flex items-center justify-center"
            onClick={() => router.push("/client/signup")}
          >
            Start Your Child’s Journey
            <span className="ml-2 material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        </div>
      </section>
      {/* Info Section */}
      <section className="py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "white" }}>
              How It Works
            </h2>
            <p className="text-lg" style={{ color: "#A0A0A0" }}>
              A repeatable system that turns understanding into reliable performance
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 border-0 shadow-lg bg-white rounded-2xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "#FFF0F0" }}>
                <span className="material-symbols-outlined" style={{ color: "#E63946", fontSize: 32 }}>school</span>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Structured Mentorship
              </h3>
              <p style={{ color: "#5A5A5A" }}>
                Students are paired with trained tutors who follow a clear system - not improvisation.
              </p>
            </div>
            <div className="p-8 border-0 shadow-lg bg-white rounded-2xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "#FFF0F0" }}>
                <span className="material-symbols-outlined" style={{ color: "#E63946", fontSize: 32 }}>psychology</span>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Pressure-Ready Training
              </h3>
              <p style={{ color: "#5A5A5A" }}>
                We simulate controlled academic pressure so calm response becomes familiar and automatic.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: "#E63946" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>favorite</span>
            </div>
          </div>
          <p className="text-sm uppercase tracking-wide mb-4 text-white/60 font-medium">
            Confidence is teachable
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Build Confidence?
          </h2>
          <p className="text-lg mb-10 text-white/80">
            Join our proven system and help your child thrive under pressure.
          </p>
          <button
            className="text-lg font-semibold px-10 py-6 rounded-full border-0 bg-white text-[#E63946]"
            onClick={() => router.push("/client/signup")}
          >
            Start Now
            <span className="ml-2 material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image src="/logos/tt-monogram.png" alt="TT Logo" width={40} height={40} />
            </div>
            <p className="text-center md:text-right" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br />
              <span className="text-sm">
                Confidence, made inevitable.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
