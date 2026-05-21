import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageSeo, SITE_NAME, SITE_ORIGIN } from "@/components/PageSeo";
import { ResponseIntegrityLogo } from "@/components/ResponseIntegrityLogo";
import { useNavigate } from "react-router-dom";

export default function AboutIndex() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCF6F2] text-[#1A1A1A]">
      <PageSeo
        title="About Response Integrity | Academic Performance Conditioning"
        description="Learn who Response Integrity is, how we operate, and how we teach through a structured academic performance-conditioning system built to prepare students before pressure peaks."
        path="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Response Integrity",
          url: `${SITE_ORIGIN}/about`,
          description:
            "Overview of who Response Integrity is, how it operates, and how it teaches through academic performance conditioning.",
          about: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_ORIGIN,
          },
        }}
      />
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="mx-auto" style={{ transform: "scale(0.85)" }}>
          <ResponseIntegrityLogo size="lg" variant="integrity" />
        </div>
        <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#E63946]">
          More About Us
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Who We Are",
              description: "See the philosophy that makes Response Integrity a performance system, not a tutoring company.",
              href: "/about/who-we-are",
            },
            {
              title: "How We Operate",
              description: "Discover our conditioning windows, enrollment rhythm, and why we avoid reactive, panic-driven tutoring culture.",
              href: "/about/how-we-operate",
            },
            {
              title: "How We Teach",
              description: "Learn how our teaching structure and conditioning progression build clarity, calm execution, and durable response patterns under pressure.",
              href: "/about/how-we-teach",
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl border border-slate-200 bg-[#F7F0EA] shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
                  {item.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-7">{item.description}</p>
                <Button
                  variant="outline"
                  className="mt-8 w-full rounded-full border-[#1A1A1A] text-[#1A1A1A] bg-[#FCF6F2]"
                  onClick={() => navigate(item.href)}
                >
                  Read {item.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
