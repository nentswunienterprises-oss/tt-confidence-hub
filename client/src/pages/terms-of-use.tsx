import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default function TermsOfUse() {
  return (
    <LegalDocumentPage
      title="Platform Terms of Use"
      subtitle="Territorial Tutoring SA (Pty) Ltd | Version 1.1 | Effective May 8, 2026"
      intro={
        <>
          <p>
            These terms govern public platform use and family enrollment use of Territorial Tutoring.
          </p>
          <p>
            Territorial Tutoring is not a conventional tutoring service. It is a response-conditioning system designed to build calm,
            correct, repeatable mathematical execution under pressure.
          </p>
        </>
      }
      sections={[
        {
          title: "1. Scope and Acceptance",
          paragraphs: [
            "By creating an account, enrolling a learner, accepting access to a learner-facing area, or using any public or family-facing part of the platform, you confirm that you have read and accepted these terms.",
            "TT may update these terms from time to time. Continued use after an update constitutes acceptance of the revised version.",
          ],
        },
        {
          title: "2. Nature of the Service",
          paragraphs: [
            "TT delivers a structured response-conditioning system, not ordinary homework help or unstructured tutoring.",
            "Sessions, reporting, progression, and review are built around TT-OS, including conditioning phases, stability tracking, and repeatable execution standards.",
            "Results are process-dependent. TT does not guarantee a specific mark increase or a fixed-timeframe academic outcome.",
          ],
        },
        {
          title: "3. Parent and Guardian Obligations",
          bullets: [
            "You are responsible for accurate enrollment information, account security, and lawful use of the platform.",
            "You must support consistent attendance, accurate scheduling, and truthful communication with TT.",
            "You may not pressure tutors to deviate from TT-OS or misrepresent learner participation or progress.",
            "You may not allow another person to impersonate the enrolled learner.",
          ],
        },
        {
          title: "4. Learner Obligations",
          bullets: [
            "Learners must participate honestly and follow the tutor's session instructions.",
            "Learners may not manipulate outcomes, skip required steps dishonestly, or knowingly distort session reality.",
            "Difficulty, repetition, controlled discomfort, and performance pressure are part of the system design.",
          ],
        },
        {
          title: "5. Session Delivery and Scheduling",
          paragraphs: [
            "TT sessions may be delivered through TT-approved live scheduling workflows, including Google Meet where enabled, and through TT training-mode workflows where standard live windows are intentionally not used.",
            "Session infrastructure, recording workflow, and scheduling sequence may vary by operational mode, onboarding stage, and tutor readiness state.",
          ],
          bullets: [
            "Missed learner sessions may be forfeited where notice requirements or scheduling rules are not met.",
            "TT-cancelled sessions will ordinarily be rescheduled or credited in a manner TT considers operationally appropriate.",
          ],
        },
        {
          title: "6. Payments, Billing, and Early Billing Access",
          paragraphs: [
            "TT's standard paid family offer is a monthly 8-session package, typically delivered at two sessions per week, unless TT states otherwise in writing.",
            "Some enrollments may receive early billing access before standard premium billing begins. This access is not public, standard, or guaranteed. It is available only where TT explicitly grants it through a TT-issued code, tracked invitation link, written approval, or another TT-controlled eligibility mechanism.",
            "If early billing access is granted, it applies only to the eligible enrollment and only for the access period or included session allocation TT has authorized. Once that access is exhausted, withdrawn, or no longer applicable, premium payment may be required before further sessions continue.",
          ],
          bullets: [
            "Payment status affects access to scheduling, session release, and ongoing learner progression.",
            "Unused sessions do not automatically roll into later billing periods unless TT expressly grants that outcome.",
            "Withdrawal because the system feels difficult, strict, repetitive, or slower than expected is not, by itself, a refund basis.",
          ],
        },
        {
          title: "7. Recording, Logs, and Data Use",
          paragraphs: [
            "TT is a recorded, data-driven operating system. The platform may collect session recordings, audio, video, reports, compliance artifacts, progress states, scheduling data, and technical platform logs.",
            "TT uses this information for service delivery, safeguarding, quality control, compliance review, dispute handling, operational reporting, fraud prevention, and system improvement.",
          ],
        },
        {
          title: "8. Data Rights, Correction, and Deletion",
          paragraphs: [
            "You may request access to or correction of your personal information.",
            "You may also request deletion where lawful, but TT may retain information needed for safeguarding, child-protection duties, payment and tax records, fraud prevention, operational audits, dispute resolution, compliance records, and other lawful retention obligations.",
          ],
        },
        {
          title: "9. Intellectual Property",
          paragraphs: [
            "TT-OS, platform content, drill structures, progression logic, reporting templates, recordings controlled by TT, and associated systems remain TT property or TT-controlled protected material.",
          ],
          bullets: [
            "You may not copy, sell, distribute, reproduce, or commercially reuse TT methodology or protected content without written permission.",
          ],
        },
        {
          title: "10. Suspension and Termination",
          paragraphs: [
            "TT may suspend, restrict, or terminate access for non-payment, misuse, dishonesty, abuse, platform interference, safeguarding concerns, or conduct harmful to TT or other users.",
            "Families may end participation by written notice, but already-accrued charges, lawful retention duties, and non-refundable completed or forfeited session rules still apply.",
          ],
        },
        {
          title: "11. Liability",
          bullets: [
            "TT is not liable for losses caused by user non-compliance, device problems, internet failures, or events outside TT's reasonable control.",
            "TT does not guarantee a fixed academic result or timeframe.",
          ],
        },
        {
          title: "12. Governing Law and Contact",
          paragraphs: [
            "These terms are governed by the laws of the Republic of South Africa.",
            "For support or legal questions, contact support@territorialtutoring.co.za or legal@territorialtutoring.co.za.",
          ],
        },
      ]}
      footer={
        <p className="text-sm text-slate-600 text-center">
          Territorial Tutoring SA (Pty) Ltd | Platform Terms of Use | www.territorialtutoring.co.za
        </p>
      }
    />
  );
}
