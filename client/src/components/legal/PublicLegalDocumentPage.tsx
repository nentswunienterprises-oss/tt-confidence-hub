import { PageSeo } from "@/components/PageSeo";
import { LegalDocumentMeta, LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import type { LegalDocumentDefinition } from "@/lib/legalDocuments";

type Props = {
  legalDocument: LegalDocumentDefinition;
};

export function PublicLegalDocumentPage({ legalDocument }: Props) {
  return (
    <>
      <PageSeo
        title={legalDocument.title}
        description={legalDocument.description}
        path={legalDocument.path}
      />
      <LegalDocumentPage
        title={legalDocument.title}
        subtitle={<LegalDocumentMeta items={legalDocument.metaItems} />}
        intro={
          <>
            {legalDocument.introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </>
        }
        sections={legalDocument.sections}
        footer={
          <LegalDocumentMeta
            className="text-xs sm:text-sm"
            items={legalDocument.footerItems}
          />
        }
      />
    </>
  );
}
