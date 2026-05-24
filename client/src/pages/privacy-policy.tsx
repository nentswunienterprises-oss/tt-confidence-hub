import { PublicLegalDocumentPage } from "@/components/legal/PublicLegalDocumentPage";
import { privacyPolicyDocument } from "@/lib/legalDocuments";

export default function PrivacyPolicy() {
  return <PublicLegalDocumentPage legalDocument={privacyPolicyDocument} />;
}
