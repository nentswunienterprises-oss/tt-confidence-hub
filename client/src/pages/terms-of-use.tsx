import { LegalDocumentMeta, LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default function TermsOfUse() {
  return (
    <LegalDocumentPage
      title="Platform Terms of Use"
      subtitle={
        <LegalDocumentMeta
          items={[
            "Response Integrity (Pty) Ltd",
            "Version 1.2",
            "Effective May 24, 2026",
          ]}
        />
      }
      intro={
        <>
          <p>
            These terms govern public use of the platform and family enrollment into Response Integrity.
          </p>
          <p>
            Response Integrity is not a conventional tutoring service. It is a response-conditioning system designed to build calm,
            correct, repeatable mathematical execution under pressure.
          </p>
          <p>
            Family access, intake, scheduling, diagnostics, reporting, and progression are governed by Response Integrity&apos;s
            operating model, including protected intake windows, cadence requirements, and Response Integrity-OS delivery rules.
          </p>
        </>
      }
      sections={[
        {
          title: "1. Scope and Acceptance",
          paragraphs: [
            "By creating an account, enrolling a learner, accepting access to a learner-facing area, or using any public or family-facing part of the platform, you confirm that you have read and accepted these terms.",
            "Response Integrity may update these terms from time to time. Continued use after an update constitutes acceptance of the revised version.",
          ],
        },
        {
          title: "2. Nature of the Service",
          paragraphs: [
            "Response Integrity delivers a structured response-conditioning system, not ordinary homework help or unstructured tutoring.",
            "Sessions, diagnostics, reporting, progression, and review are built around Response Integrity-OS, including topic-level conditioning phases, stability tracking, and repeatable execution standards.",
            "The service is designed around preparation before pressure, not panic intervention, emergency catch-up, or random extra lessons.",
            "Results are process-dependent. Response Integrity does not guarantee a specific mark increase or a fixed-timeframe academic outcome.",
          ],
        },
        {
          title: "3. Enrollment Architecture and Intake Access",
          paragraphs: [
            "Response Integrity accepts new family enrollments only through Company-defined intake structures, waitlist pathways, or another written exception expressly approved by Response Integrity.",
            "A platform account, completed form, payment attempt, intake click, or contact with Response Integrity does not by itself create a right to immediate enrollment, immediate scheduling, or admission into an open cycle.",
            "Response Integrity may accept, defer, waitlist, or decline a family where intake is closed, execution-season protection is active, scheduling fit is not present, required information is incomplete, or the family is not a fit for the operating rhythm of the service.",
            "Normal new-family enrollment may be closed during certain parts of the academic year, including execution-protection periods, even while login access remains available for already active families.",
          ],
        },
        {
          title: "4. Planning, Diagnostics, and Scope Inputs",
          paragraphs: [
            "Response Integrity service delivery may begin with intake review, parent education, scope collection, schedule alignment, intro diagnostics, topic mapping, and related planning work before ordinary recurring training begins.",
            "Families must provide accurate academic scope information where requested, including school topic coverage, grade context, learner pressures, and other inputs reasonably needed for ahead-of-class conditioning and topic planning.",
            "Response Integrity may use parent-reported signals, learner history, school scope information, and diagnostic evidence to recommend a starting phase, determine topic priorities, and decide how service should begin.",
          ],
        },
        {
          title: "5. Parent and Guardian Obligations",
          bullets: [
            "You are responsible for accurate enrollment information, account security, and lawful use of the platform.",
            "You must support consistent attendance, accurate scheduling, and truthful communication with Response Integrity.",
            "You must provide accurate school, scheduling, and learner-context information where Response Integrity requests it for planning, diagnostics, or conditioning continuity.",
            "You may not pressure tutors to deviate from Response Integrity-OS or misrepresent learner participation or progress.",
            "You may not allow another person to impersonate the enrolled learner.",
          ],
        },
        {
          title: "6. Learner Obligations",
          bullets: [
            "Learners must participate honestly and follow the tutor's session instructions.",
            "Learners may not manipulate outcomes, skip required steps dishonestly, or knowingly distort session reality.",
            "Difficulty, repetition, controlled discomfort, and performance pressure are part of the system design.",
          ],
        },
        {
          title: "7. Cadence, Sessions, and Scheduling",
          paragraphs: [
            "Sessions are delivered through Response Integrity's approved scheduling and session systems, including Google Meet where enabled.",
            "Response Integrity's standard family delivery model is cadence-based. Unless Response Integrity approves another written arrangement, the standard active-training rhythm is two sessions per week and eight sessions per month.",
            "Cadence is part of the service itself, not mere administration. The system depends on stable scheduling, repeated exposure, and protected continuity.",
          ],
          bullets: [
            "Families must maintain schedule stability and reasonable availability consistent with the operating rhythm of the service.",
            "Missed learner sessions may be forfeited where notice requirements or scheduling rules are not met.",
            "Sessions cancelled by Response Integrity will ordinarily be rescheduled or credited in an operationally appropriate manner.",
            "Response Integrity may pause, defer, rescope, or decline continuation where repeated cancellations, schedule instability, or inconsistent participation materially undermine service integrity.",
          ],
        },
        {
          title: "8. Payments, Billing, and Early Billing Access",
          paragraphs: [
            "Response Integrity's standard paid family offer is a monthly 8-session package, delivered at two sessions per week unless Response Integrity states otherwise in writing.",
            "Some enrollments may receive early billing access before standard premium billing begins. This access is not public, standard, or guaranteed. It is available only where Response Integrity expressly grants it through an issued code, tracked invitation link, written approval, or another internal eligibility mechanism.",
            "If early billing access is granted, it applies only to the eligible enrollment and only for the access period or included session allocation Response Integrity has authorized. Once that access is exhausted, withdrawn, or no longer applicable, premium payment may be required before further sessions continue.",
          ],
          bullets: [
            "Payment status affects access to scheduling, session release, and ongoing learner progression.",
            "Unused sessions do not automatically roll into later billing periods unless Response Integrity expressly grants that outcome.",
            "Withdrawal because the system feels difficult, strict, repetitive, or slower than expected is not, by itself, a refund basis.",
          ],
        },
        {
          title: "9. Recording, Logs, and Data Use",
          paragraphs: [
            "Response Integrity is a recorded, data-driven operating system. The platform may collect session recordings, audio, video, reports, compliance artifacts, progress states, scheduling data, and technical platform logs.",
            "Response Integrity uses this information for service delivery, intake review, topic planning, safeguarding, quality control, compliance review, dispute handling, operational reporting, fraud prevention, and system improvement.",
          ],
        },
        {
          title: "10. Data Rights, Correction, and Deletion",
          paragraphs: [
            "You may request access to or correction of your personal information.",
            "You may also request deletion where lawful, but Response Integrity may retain information needed for safeguarding, child-protection duties, payment and tax records, fraud prevention, operational audits, dispute resolution, compliance records, and other lawful retention obligations.",
          ],
        },
        {
          title: "11. Intellectual Property",
          paragraphs: [
            "Response Integrity-OS, platform content, drill structures, progression logic, reporting templates, controlled recordings, and associated systems remain Company property or otherwise protected platform material.",
          ],
          bullets: [
            "You may not copy, sell, distribute, reproduce, or commercially reuse Response Integrity methodology or protected content without written permission.",
          ],
        },
        {
          title: "12. Suspension and Termination",
          paragraphs: [
            "Response Integrity may suspend, restrict, or terminate access for non-payment, misuse, dishonesty, abuse, platform interference, safeguarding concerns, or conduct harmful to the Company or other users.",
            "Response Integrity may also suspend, defer, waitlist, or end participation where the service is being used outside its intended model, including persistent panic-use demands, refusal to follow system rules, or material breakdown of cadence and scheduling integrity.",
            "Families may end participation by written notice, but already-accrued charges, lawful retention duties, and non-refundable completed or forfeited session rules still apply.",
          ],
        },
        {
          title: "13. Liability",
          bullets: [
            "Response Integrity is not liable for losses caused by user non-compliance, device problems, internet failures, or events outside its reasonable control.",
            "Response Integrity does not guarantee a fixed academic result or timeframe.",
          ],
        },
        {
          title: "14. Governing Law and Contact",
          paragraphs: [
            "These terms are governed by the laws of the Republic of South Africa.",
            "For support or legal questions, contact support@responseintegrity.co.za or legal@responseintegrity.co.za.",
          ],
        },
      ]}
      footer={
        <LegalDocumentMeta
          className="text-xs sm:text-sm"
          items={[
            "Response Integrity (Pty) Ltd",
            "Platform Terms of Use",
            "Version 1.2",
            "www.responseintegrity.co.za",
          ]}
        />
      }
    />
  );
}
