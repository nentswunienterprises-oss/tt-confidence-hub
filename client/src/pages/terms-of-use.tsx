import { PublicLegalDocumentPage } from "@/components/legal/PublicLegalDocumentPage";
import { termsOfUseDocument } from "@/lib/legalDocuments";

export default function TermsOfUse() {
  return <PublicLegalDocumentPage legalDocument={termsOfUseDocument} />;
}
