import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTrackedBackTarget } from "@/lib/publicTracking";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Props = {
  title: string;
  subtitle: string;
  intro?: ReactNode;
  sections: LegalSection[];
  footer?: ReactNode;
};

export function LegalDocumentPage({ title, subtitle, intro, sections, footer }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = resolveTrackedBackTarget(location.search);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(backTarget)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">{title}</CardTitle>
            <CardDescription className="text-center">{subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            {intro ? <div className="mb-8">{intro}</div> : null}

            {sections.map((section) => (
              <section key={section.title} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets?.length ? (
                  <ul className="list-disc pl-6">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {footer ? <div className="mt-12 p-6 bg-slate-100 rounded-lg">{footer}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
