import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Territorial Tutoring - Calm Execution Under Pressure</title>
        <meta name="description" content="Territorial Tutoring trains students to think clearly, execute accurately, and stay composed under pressure. Confidence becomes inevitable." />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className="min-h-screen bg-[#FFF5ED] font-sans">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logos/tt-monogram.png" alt="TT Logo" width={40} height={40} />
              <span className="text-2xl lg:text-4xl font-bold tracking-tight text-[#1A1A1A]">RESPONSE-FIRST TRAINING</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/client/signup" className="text-sm sm:text-base font-medium px-2 sm:px-4 text-[#1A1A1A]">Log In</Link>
              <Link href="/client/signup" className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg transition-all bg-[#E63946] text-white">Get Started</Link>
            </div>
          </div>
        </header>
        <div className="h-16 sm:h-20" />
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-4 sm:pt-8 md:pt-16 pb-12 sm:pb-20">
          <div className="md:hidden text-center mb-6">
            <span className="text-2xl font-bold tracking-tight text-[#1A1A1A]">RESPONSE-FIRST TRAINING</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-5 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FFF0F0]">
                <span className="text-xs sm:text-sm font-medium text-[#E63946]">For Parents of Grade 6–9 Students</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#1A1A1A]">
                Calm Execution<br />
                <span className="text-[#E63946]">Under Pressure.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#5A5A5A]">
                Most students don’t struggle because they don’t understand math.<br />
                They struggle because pressure disrupts their response.<br /><br />
                We train students to think clearly, execute accurately, and stay composed - so confidence becomes inevitable.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Link href="/client/signup" className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg transition-all border-0 bg-[#E63946] text-white flex items-center justify-center">
                  Start Your Child’s Journey
                  <span className="ml-2">→</span>
                </Link>
              </div>
              <div className="hidden md:block pt-2">
                <div className="flex items-center gap-4 mb-2">
                  {["Connection", "Mastery", "Reflection"].map((pillar) => (
                    <div key={pillar} className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#FFF0F0] text-[#E63946]">{pillar}</div>
                  ))}
                </div>
                <p className="text-sm text-[#5A5A5A]">A system built around how confidence actually forms - through structure, repetition, and standards.</p>
              </div>
            </div>
            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl transform rotate-3 bg-[#FFF0F0]" />
              <Image src="/images/Benefits-of-Online-Tutoring-1-1080x589.png" alt="Student training calm focus" width={540} height={400} className="relative rounded-3xl shadow-2xl w-full object-cover" style={{ aspectRatio: "4/3" }} />
              <div className="absolute -bottom-4 sm:-bottom-6 left-2 sm:-left-6 md:-left-12 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-xl bg-white">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#FFF0F0]">
                    <span className="text-[#E63946] text-xl">♥</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm sm:text-lg text-[#1A1A1A]">Calm First</p>
                    <p className="text-xs sm:text-sm text-[#5A5A5A]">Confidence follows naturally</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile-only: Pillars section after hero image */}
            <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-6">
              <div className="flex items-center gap-4 justify-center mb-2">
                {["Connection", "Mastery", "Reflection"].map((pillar) => (
                  <div key={pillar} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF0F0] text-[#E63946]">{pillar}</div>
                ))}
              </div>
              <p className="text-xs text-center text-[#5A5A5A]">A system built around how confidence actually forms - through structure, repetition, and standards.</p>
            </div>
          </div>
        </section>
        {/* How It Works */}
        <section className="py-12 sm:py-20 bg-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">How It Works</h2>
              <p className="text-base sm:text-lg text-[#A0A0A0]">A repeatable system that turns understanding into reliable performance.</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                { number: "1", title: "Structured Mentorship", description: "Students are paired with trained tutors who follow a clear system - not improvisation." },
                { number: "2", title: "Pressure-Ready Training", description: "We simulate controlled academic pressure so calm response becomes familiar and automatic." },
                { number: "3", title: "Measured Progress", description: "Execution improves first. Confidence becomes inevitable. Results stay predictable." }
              ].map((item, index) => (
                <div key={index} className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-[#2A2A2A]">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 sm:mb-6 bg-[#E63946] text-white text-2xl font-serif italic font-bold">{item.number}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{item.title}</h3>
                  <p className="text-sm sm:text-base text-[#A0A0A0]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="py-8 sm:py-12 bg-[#FFF5ED]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <Image src="/logos/tt-monogram.png" alt="TT Logo" width={32} height={32} />
              <p className="text-center md:text-right text-xs sm:text-sm text-[#5A5A5A]">
                © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd<br />
                <span className="text-xs sm:text-sm">Confidence, made inevitable.</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
