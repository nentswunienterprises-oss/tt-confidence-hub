import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageSeo, SITE_ORIGIN } from "@/components/PageSeo";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  Megaphone,
  Network,
  Workflow,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ventures = [
  {
    name: "Accord Signal",
    role: "Capability Architecture",
    summary:
      "Accord Signal strengthens organisations before technology is introduced by designing the capability, programmes, journeys, and structures required for consistent delivery.",
    icon: Building2,
    website: "https://www.accordsignal.co.za",
    responsibilities: [
      "Institutional discovery",
      "Organisational capability assessment",
      "Programme architecture",
      "Operational design",
      "Learner and participant journeys",
      "Governance structures",
      "Scaling strategies",
      "Transformation planning",
    ],
  },
  {
    name: "Relief Works Technologies",
    role: "Technology & Digital Infrastructure",
    summary:
      "Relief Works translates designed organisational capability into practical software, platforms, infrastructure, and ongoing technical support that can operate at scale.",
    icon: Wrench,
    website: "https://www.reliefworks.tech",
    responsibilities: [
      "Software engineering",
      "Web and mobile applications",
      "Learning platforms",
      "Internal operational systems",
      "Reporting dashboards",
      "System integrations",
      "Cloud infrastructure",
      "Ongoing platform support",
    ],
  },
  {
    name: "Idea Gravity",
    role: "Institutional Positioning, Narrative & Public Presence",
    summary:
      "Idea Gravity helps organisations clarify how they are understood publicly so their mission, positioning, and institutional presence remain coherent and influential.",
    icon: Megaphone,
    website: "https://www.ideagravity.co.za",
    responsibilities: [
      "Institutional positioning",
      "Brand strategy",
      "Organisational narrative",
      "Public communication",
      "Thought leadership",
      "Strategic messaging",
      "Visual identity systems",
      "Campaign architecture",
    ],
  },
] as const;

const engagementFlow = [
  "Client",
  "Nenterprises",
  "Strategic Partner",
  "Specialist Ventures",
  "Unified Outcomes",
] as const;

const modelBenefits = [
  "Clear accountability",
  "Consistent communication",
  "Integrated planning",
  "Coordinated delivery",
  "Long-term strategic continuity",
] as const;

const transformationNeeds = [
  "clarity",
  "structure",
  "capability",
  "operational consistency",
] as const;

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCF6F2] text-[#1A1A1A]">
      <PageSeo
        title="Services | Nenterprises Specialist Ventures"
        description="Explore Nenterprises' institutional transformation model across capability architecture, digital infrastructure, and institutional positioning."
        path="/services"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Nenterprises Specialist Ventures",
          serviceType: "Institutional transformation and specialist capability delivery",
          provider: {
            "@type": "Organization",
            name: "Nenterprises (Pty) Ltd",
            url: SITE_ORIGIN,
          },
          areaServed: "South Africa",
          description:
            "Nenterprises coordinates specialist ventures across organisational capability, digital infrastructure, and institutional positioning to deliver unified transformation outcomes.",
          url: `${SITE_ORIGIN}/services`,
        }}
      />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[34rem] opacity-90"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(230,57,70,0.15), transparent 36%), radial-gradient(circle at top right, rgba(38,70,83,0.14), transparent 38%), linear-gradient(180deg, rgba(247,240,234,1) 0%, rgba(252,246,242,1) 72%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <Button
            variant="ghost"
            className="rounded-full px-0 text-sm font-medium text-[#5A5A5A] hover:bg-transparent hover:text-[#1A1A1A]"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#E63946]">
                Services
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Delivering institutional transformation through specialist capability.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#5A5A5A] sm:text-lg">
                Nenterprises serves as the strategic partner leading institutional
                transformation engagements. Rather than delivering every service directly,
                it assembles and coordinates specialist ventures so clients keep one
                strategic relationship while benefiting from focused expertise.
              </p>
            </div>

            <Card className="rounded-[2rem] border border-[#E8D7CB] bg-white/80 shadow-[0_28px_70px_rgba(26,26,26,0.08)]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#FFF0F0] p-3 text-[#E63946]">
                    <Network className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B776B]">
                      Engagement Model
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#1A1A1A]">
                      One strategic relationship. Unified outcomes.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {engagementFlow.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm font-medium text-[#5A5A5A]">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <Card className="rounded-[2rem] border border-[#E8D7CB] bg-[#F8F2EC] shadow-sm">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A4B35]">
                About Nenterprises
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A1A]">
                Specialist ventures working inside one transformation programme.
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-[#5A5A5A] sm:text-base">
              <p>
                Every specialist venture operates independently within its own area of
                expertise while contributing to a unified transformation engagement.
              </p>
              <p>
                This allows organisations to move from capability design to technology,
                positioning, and future specialist disciplines without having to stitch
                together disconnected providers on their own.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E63946]">
            Specialist Ventures
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
            Defined capability across organisational design, technology, and public presence.
          </h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {ventures.map((venture) => (
            <Card
              key={venture.name}
              className="rounded-[2rem] border border-[#E8D7CB] bg-white shadow-[0_18px_48px_rgba(26,26,26,0.06)]"
            >
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B776B]">
                      {venture.role}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#1A1A1A]">
                      {venture.name}
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-[#FFF0F0] p-3 text-[#E63946]">
                    <venture.icon className="h-6 w-6" />
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#5A5A5A] sm:text-base">
                  {venture.summary}
                </p>

                <div className="mt-6 grid gap-2">
                  {venture.responsibilities.map((item) => (
                    <div key={item} className="rounded-2xl bg-[#FCF6F2] px-4 py-3 text-sm text-[#5A5A5A]">
                      {item}
                    </div>
                  ))}
                </div>

                <a
                  href={venture.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#E63946]"
                >
                  Visit Website
                  <ArrowRight className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#1A1A1A] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E63946]">
              How They Work Together
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Each venture has a defined responsibility throughout the engagement.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Nenterprises",
                description:
                  "Provides strategic leadership, coordinates the engagement, and protects alignment with the client's long-term objectives.",
                icon: BriefcaseBusiness,
              },
              {
                title: "Accord Signal",
                description:
                  "Designs organisational capability, structures programmes, documents institutional knowledge, and creates the architecture for sustainable growth.",
                icon: Building2,
              },
              {
                title: "Relief Works Technologies",
                description:
                  "Builds and maintains the technology required for the designed capability to operate efficiently and at scale.",
                icon: Wrench,
              },
              {
                title: "Idea Gravity",
                description:
                  "Shapes external understanding, strengthens positioning and narrative, and aligns public communication with institutional purpose.",
                icon: Workflow,
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-[2rem] border border-white/10 bg-[#242424]">
                <CardContent className="p-8">
                  <div className="rounded-2xl bg-white/10 p-3 text-[#E63946] w-fit">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#B9B9B9] sm:text-base">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[2rem] border border-[#E8D7CB] bg-[#F8F2EC] shadow-sm">
            <CardContent className="p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A4B35]">
                Why This Model
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A1A]">
                Technology should not be the starting point.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#5A5A5A] sm:text-base">
                Institutional transformation rarely succeeds when technology is introduced
                before the organisation has a clear model for how it should operate.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {transformationNeeds.map((item) => (
                  <div
                    key={item}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A] shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-[#5A5A5A] sm:text-base">
                By separating organisational design from technical implementation, each
                discipline can operate within its area of expertise while contributing
                toward a common objective.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-[#E8D7CB] bg-white shadow-sm">
            <CardContent className="p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E63946]">
                A Single Strategic Relationship
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A1A]">
                Clients work directly with Nenterprises throughout.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#5A5A5A] sm:text-base">
                Nenterprises coordinates specialist expertise as required, so clients
                benefit from a unified engagement rather than managing multiple
                independent providers.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {modelBenefits.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#EFE2D7] bg-[#FCF6F2] px-4 py-4 text-sm font-medium text-[#5A5A5A]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <Card className="rounded-[2rem] border border-[#E8D7CB] bg-white shadow-[0_24px_60px_rgba(26,26,26,0.06)]">
            <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E63946]">
                  Our Commitment
                </p>
                <blockquote className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl">
                  Build institutions that become stronger, more capable and more enduring over time.
                </blockquote>
                <p className="mt-5 text-sm leading-7 text-[#5A5A5A] sm:text-base">
                  Whether the work centres on organisational capability or digital
                  infrastructure, every specialist venture exists to serve that shared mission.
                </p>
              </div>

              <div className="rounded-[1.75rem] bg-[#1A1A1A] p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E63946]">
                  Nenterprises (Pty) Ltd
                </p>
                <p className="mt-4 text-2xl font-semibold tracking-tight">
                  Building institutions that endure.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="rounded-full border-0 bg-[#E63946] text-white hover:bg-[#d2303d]"
                    onClick={() => navigate("/about")}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/30 bg-transparent text-white hover:bg-white hover:text-[#1A1A1A]"
                    onClick={() => navigate("/")}
                  >
                    Back Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
