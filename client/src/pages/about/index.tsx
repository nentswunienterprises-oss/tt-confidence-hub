import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponseIntegrityLogo } from "@/components/ResponseIntegrityLogo";
import { ShieldCheck, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutIndex() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCF6F2] text-[#1A1A1A]">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <ResponseIntegrityLogo size="xl" variant="integrity" />
        <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#E63946]">
          About Response Integrity
        </p>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
          More About Us
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-slate-600">
          The deliberate entry point for our philosophy, our operating doctrine, and the teaching system we build around stable response.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            className="rounded-full px-8 py-4"
            style={{ backgroundColor: "#E63946", color: "white", borderColor: "transparent" }}
            onClick={() => navigate("/about/who-we-are")}
          >
            Start with Who We Are
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 py-4 border-[#1A1A1A] text-[#1A1A1A]"
            onClick={() => navigate("/about/how-we-teach")}
          >
            Explore How We Teach
          </Button>
        </div>
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
              description: "Discover our conditioning windows, enrollment cycles, and why we avoid reactive, panic-driven tutoring.",
              href: "/about/how-we-operate",
            },
            {
              title: "How We Teach",
              description: "Learn how our teaching structure builds clarity, calm execution, and durable response patterns under pressure.",
              href: "/about/how-we-teach",
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
                  {item.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-7">{item.description}</p>
                <Button
                  variant="outline"
                  className="mt-8 w-full rounded-full border-[#1A1A1A] text-[#1A1A1A] bg-white"
                  onClick={() => navigate(item.href)}
                >
                  Read {item.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Positioned Clearly",
              description: "This page helps visitors and search engines understand Response Integrity as a category, not another tutoring brand.",
            },
            {
              icon: Users,
              title: "Designed for Families",
              description: "Each entry point explains what parents should expect from our system and who it is built for.",
            },
            {
              icon: ShieldCheck,
              title: "Built to Last",
              description: "We emphasize rhythm, structure, and response stability instead of temporary tactics or exam panic.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0F0] text-[#E63946]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold" style={{ color: "#1A1A1A" }}>
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-6">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
