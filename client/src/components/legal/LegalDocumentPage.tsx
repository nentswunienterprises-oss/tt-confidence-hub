import { Fragment, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTrackedBackTarget } from "@/lib/publicTracking";
import { cn } from "@/lib/utils";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Props = {
  title: string;
  subtitle: ReactNode;
  intro?: ReactNode;
  sections: LegalSection[];
  footer?: ReactNode;
};

type LegalDocumentMetaProps = {
  items: string[];
  className?: string;
};

export function LegalDocumentMeta({ items, className }: LegalDocumentMetaProps) {
  const entries = items.filter(Boolean);

  return (
    <div
      className={cn(
        "flex flex-col gap-1 text-sm leading-relaxed text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2",
        className,
      )}
    >
      {entries.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <span className="min-w-0">{item}</span>
          {index < entries.length - 1 ? (
            <span aria-hidden="true" className="hidden text-slate-400 sm:inline">
              |
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

export function LegalDocumentPage({ title, subtitle, intro, sections, footer }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = resolveTrackedBackTarget(location.search);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(backTarget)} className="mb-4 -ml-2 w-fit sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm">
          <CardHeader className="p-5 pb-4 sm:p-8 sm:pb-6">
            <CardTitle className="text-left text-2xl font-bold leading-tight sm:text-center sm:text-3xl">
              {title}
            </CardTitle>
            <CardDescription className="text-left leading-relaxed sm:text-center">
              {subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm prose-slate max-w-none p-5 pt-0 prose-p:leading-7 prose-li:leading-7 sm:prose-base sm:p-8 sm:pt-0 lg:p-10 lg:pt-0">
            {intro ? <div className="mb-6 sm:mb-8">{intro}</div> : null}

            <div className="space-y-6 sm:space-y-8">
              {sections.map((section) => (
                <section key={section.title} className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
                  <h2 className="mb-3 text-xl font-semibold leading-tight text-slate-900 sm:mb-4 sm:text-2xl">
                    {section.title}
                  </h2>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets?.length ? (
                    <ul className="list-disc pl-5 sm:pl-6">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            {footer ? <div className="mt-8 rounded-xl bg-slate-100 p-4 sm:mt-12 sm:p-6">{footer}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
