import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default function EgpTermsOfUse() {
  return (
    <LegalDocumentPage
      title="Education Growth Partner Terms of Use"
      subtitle="Territorial Tutoring SA (Pty) Ltd | Version 1.0 | Effective May 8, 2026"
      intro={
        <>
          <p>
            These terms apply to Education Growth Partner applicants and EGP users of TT acquisition and affiliate systems.
          </p>
          <p>
            EGP access is controlled commercial-access infrastructure. It is not general public platform use.
          </p>
        </>
      }
      sections={[
        {
          title: "1. Role and Access Scope",
          paragraphs: [
            "EGP access exists for TT-approved outreach, referral, acquisition, tracking, and related communication workflows.",
            "Access may be limited by onboarding status, role permissions, territory design, conduct history, and operational need.",
          ],
        },
        {
          title: "2. Independent Operator Status",
          bullets: [
            "EGP participation is performance-based and does not create salary, employment, or guaranteed income.",
            "TT may approve, pause, restrict, or end EGP access where system fit or conduct standards are not met.",
          ],
        },
        {
          title: "3. Representation Standards",
          bullets: [
            "EGPs may only represent TT using approved positioning and truthful claims.",
            "EGPs may not exaggerate the service, invent guarantees, pressure families, or misstate how TT works.",
            "Need-first positioning is required: TT should only be positioned where a real fit exists.",
          ],
        },
        {
          title: "4. Non-Circumvention",
          bullets: [
            "Relationships, leads, and tracked opportunities accessed through TT remain TT relationships.",
            "EGPs may not move TT relationships into private, external, competing, or untracked arrangements.",
            "TT-issued codes, links, and tracking systems may only be used for authorized TT acquisition activity.",
          ],
        },
        {
          title: "5. Confidentiality and System Protection",
          bullets: [
            "TT positioning, structures, systems, scripts, commercial logic, and internal data are confidential.",
            "EGPs may not copy, disclose, or recreate TT systems outside TT.",
          ],
        },
        {
          title: "6. Data and Monitoring",
          paragraphs: [
            "TT may store and review EGP application data, identity records, tracked link activity, platform interactions, and related operational records for commercial accountability, fraud prevention, and system protection.",
          ],
        },
        {
          title: "7. Suspension and Termination",
          paragraphs: [
            "TT may suspend or terminate EGP access immediately for false claims, misuse of tracking systems, confidentiality breaches, circumvention, misconduct, or any role behavior that exposes TT to operational or reputational risk.",
          ],
        },
        {
          title: "8. Data Rights and Retention",
          paragraphs: [
            "EGPs may request access to or correction of their personal information. Deletion requests remain subject to TT's lawful retention duties for fraud prevention, disputes, audit, identity verification, and operational compliance.",
          ],
        },
        {
          title: "9. Governing Law",
          paragraphs: [
            "These terms are governed by the laws of the Republic of South Africa. Use of EGP access confirms acceptance of these terms and of TT's applicable EGP onboarding framework.",
          ],
        },
      ]}
      footer={
        <p className="text-sm text-slate-600 text-center">
          Territorial Tutoring SA (Pty) Ltd | Education Growth Partner Terms of Use | www.responseintegrity.co.za
        </p>
      }
    />
  );
}
