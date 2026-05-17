import { LegalDocumentMeta, LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default function TdTermsOfUse() {
  return (
    <LegalDocumentPage
      title="Territory Director Terms of Use"
      subtitle={
        <LegalDocumentMeta
          items={[
            "Response Integrity (Pty) Ltd",
            "Version 1.0",
            "Effective May 8, 2026",
          ]}
        />
      }
      intro={
        <>
          <p>
            These terms apply to Territory Director applicants, TDs in onboarding, and TDs with access to Response Integrity operational systems.
          </p>
          <p>
            TD access is leadership access inside a controlled operating system. It is not open general platform use.
          </p>
        </>
      }
      sections={[
        {
          title: "1. Role and Access Scope",
          paragraphs: [
            "TD access exists for pod oversight, tutor supervision, audit execution, operational reporting, and approved leadership workflows.",
            "Access may change based on onboarding completion, certification status, assignment status, and system trust.",
          ],
        },
        {
          title: "2. Independent Contractor Status",
          bullets: [
            "TD participation is as an independent contractor unless Response Integrity states otherwise in writing.",
            "TD signup, evaluation, or onboarding does not create employment, guaranteed promotion, guaranteed pod ownership, or guaranteed income.",
            "Compensation and assignment remain performance-linked and system-dependent.",
          ],
        },
        {
          title: "3. System Integrity Duties",
          bullets: [
            "TDs must enforce Response Integrity-OS exactly as defined.",
            "TDs may not modify, reinterpret, dilute, or selectively apply Response Integrity standards.",
            "System integrity takes priority over personal comfort, loyalty dynamics, or relational pressure.",
          ],
        },
        {
          title: "4. Audit and Reporting Integrity",
          bullets: [
            "TDs must report audit reality truthfully and completely.",
            "Known violations may not be concealed, softened, or strategically omitted.",
            "Response Integrity recorded data, operational logs, and platform evidence may be treated as authoritative in TD evaluation and enforcement.",
          ],
        },
        {
          title: "5. Confidentiality and System Protection",
          bullets: [
            "Platform systems, methods, operating frameworks, tutor data, learner data, and internal records are confidential.",
            "TDs may not reproduce Response Integrity methodology, divert platform relationships, or bypass approved systems.",
            "Operational access is granted only for lawful Response Integrity purposes.",
          ],
        },
        {
          title: "6. Monitoring and Data Use",
          paragraphs: [
            "Response Integrity may record, log, and review TD activity, audit submissions, compliance events, performance records, and related operational interactions for safeguarding, enforcement, quality control, and system protection.",
          ],
        },
        {
          title: "7. Suspension and Termination",
          paragraphs: [
            "Response Integrity may suspend or terminate TD access immediately for integrity failures, confidentiality breaches, role circumvention, operational dishonesty, misuse of authority, or any conduct that threatens the system.",
          ],
        },
        {
          title: "8. Data Rights and Retention",
          paragraphs: [
            "TDs may request access to or correction of their personal information. Deletion requests remain subject to Response Integrity's lawful retention duties for audit, safeguarding, tax, disputes, fraud prevention, and operational compliance.",
          ],
        },
        {
          title: "9. Governing Law",
          paragraphs: [
            "These terms are governed by the laws of the Republic of South Africa. Use of TD access confirms acceptance of these terms and of Response Integrity's applicable TD onboarding framework.",
          ],
        },
      ]}
      footer={
        <LegalDocumentMeta
          className="text-xs sm:text-sm"
          items={[
            "Response Integrity (Pty) Ltd",
            "Territory Director Terms of Use",
            "www.responseintegrity.co.za",
          ]}
        />
      }
    />
  );
}
