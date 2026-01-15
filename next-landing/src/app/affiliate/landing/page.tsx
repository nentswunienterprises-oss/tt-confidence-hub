import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function AffiliateLanding() {
  return (
    <>
      <Head>
        <title>Affiliate Landing - Territorial Tutoring</title>
        <meta name="description" content="Affiliate program portal for Territorial Tutoring. Join, refer, and earn by helping students succeed." />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className="min-h-screen bg-[#F5F7FA] font-sans">
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(245, 247, 250, 0.95)" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logos/tt-monogram.png" alt="TT Logo" width={40} height={40} />
              <span className="text-2xl lg:text-4xl font-bold tracking-tight text-[#1A1A1A]">AFFILIATE PORTAL</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/client/signup" className="text-sm sm:text-base font-medium px-2 sm:px-4 text-[#1A1A1A]">Log In</Link>
              <Link href="/client/signup" className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg transition-all bg-[#E63946] text-white">Get Started</Link>
            </div>
          </div>
        </header>
        <div className="h-16 sm:h-20" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 pt-24 pb-12">
          <h1 className="text-4xl font-bold mb-6 text-[#1A1A1A]">Join the Affiliate Program</h1>
          <p className="text-lg text-[#5A5A5A] mb-8">Refer families, earn rewards, and help students achieve confidence and mastery in math.</p>
          <div className="flex flex-col gap-4">
            <Link href="/affiliate/signup" className="bg-[#E63946] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg w-fit">Become an Affiliate</Link>
            <Link href="/" className="text-[#E63946] underline font-medium w-fit">Back to Main Site</Link>
          </div>
        </main>
        <footer className="py-8 sm:py-12 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <Image src="/logos/tt-monogram.png" alt="TT Logo" width={32} height={32} />
            <p className="text-center md:text-right text-xs sm:text-sm text-[#5A5A5A]">
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd<br />
              <span className="text-xs sm:text-sm">Confidence, made inevitable.</span>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
