import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default function PrivacyPolicy() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      subtitle="Territorial Tutoring SA (Pty) Ltd | Version 1.1 | Effective May 9, 2026"
      intro={
        <>
          <p>
            Territorial Tutoring SA (Pty) Ltd ("Territorial Tutoring", "TT", "we", "us", "our")
            processes personal information in accordance with the Protection of Personal Information
            Act 4 of 2013 (POPIA) and other applicable South African law.
          </p>
          <p>
            This policy explains how we collect, use, store, share, retain, and protect personal
            information across our website, web application, onboarding flows, scheduling systems,
            recording systems, notifications, and related operational services.
          </p>
        </>
      }
      sections={[
        {
          title: "1. Who This Policy Covers",
          paragraphs: [
            "This policy applies to parents, guardians, learners, students, tutors, Territory Directors, Education Growth Partners, outreach directors, executives, applicants, contractors, and other users of TT public or operational systems.",
          ],
          bullets: [
            "Legal entity: Territorial Tutoring SA (Pty) Ltd",
            "Jurisdiction: Republic of South Africa",
            "Contact: support@responseintegrity.co.za",
          ],
        },
        {
          title: "2. Information We Collect",
          paragraphs: [
            "The exact information we collect depends on your role and how you use TT.",
          ],
          bullets: [
            "Identity and account data such as names, email addresses, phone numbers, role, login details, and account status.",
            "Learner and family data such as learner name, age, grade, school, enrollment details, parent contact data, and consent records.",
            "Session and academic data such as diagnoses, drill logs, reports, progression states, phase and stability records, observations, scheduling activity, and session outcomes.",
            "Recording and compliance data such as session recordings, audio, video, submitted recording files, associated timestamps, and related compliance artifacts, which may include transcript-related records where available.",
            "Payment and billing data such as payment status, transaction references, plan status, and subscription-related records. Card processing is handled through payment processors such as Payfast; TT does not store full card details.",
            "Operational workforce data such as ID documents, contractor records, onboarding acceptances, certifications, audit history, banking details for payout administration, and performance-linked operational records.",
            "Affiliate and acquisition data such as referral codes, tracked links, encounter records, lead and close tracking, payment attribution, and campaign or source information.",
            "Technical and device data such as IP address, device and browser information, access logs, session identifiers, notification subscription data, and usage records inside the platform.",
          ],
        },
        {
          title: "3. How We Collect Information",
          bullets: [
            "Directly from you when you sign up, apply, enroll, upload documents, book sessions, make payments, or contact TT.",
            "Automatically through platform use, authentication flows, scheduling systems, logs, notifications, and browser or device interactions.",
            "From TT operational users such as tutors, TDs, EGPs, or executives when they record lawful platform observations or workflow actions.",
            "From service providers and processors used to operate TT, including payment, storage, scheduling, authentication, and communication providers.",
          ],
        },
        {
          title: "4. Why We Use Information",
          bullets: [
            "To create and manage accounts, onboarding flows, and access permissions.",
            "To deliver TT response-conditioning services, scheduling workflows, learner progression, and reporting.",
            "To process payments, confirm account status, manage early-access eligibility, and administer contractor or affiliate-related payment records.",
            "To safeguard learners, investigate incidents, review disputes, and maintain system integrity.",
            "To monitor compliance, quality, audit accuracy, and role performance across TT operations.",
            "To operate communications such as service emails, account notices, and browser push notifications where enabled.",
            "To measure acquisition, referral, and attribution performance.",
            "To comply with legal, regulatory, tax, safeguarding, fraud-prevention, and record-keeping duties.",
          ],
        },
        {
          title: "5. Recordings and Monitoring",
          paragraphs: [
            "TT is a recorded, data-driven operating system. Sessions and related operational workflows may generate recordings, logs, metadata, submitted files, and related compliance records.",
            "We use these records for service delivery, safeguarding, quality control, audit review, operational continuity, dispute handling, performance verification, fraud prevention, and lawful system improvement.",
          ],
        },
        {
          title: "6. How We Share Information",
          paragraphs: [
            "We do not sell personal information and we do not use children's data for advertising.",
          ],
          bullets: [
            "Assigned tutors, TDs, or relevant TT operators where access is necessary to deliver or supervise the service.",
            "Payment processors such as Payfast for transaction handling.",
            "Technology providers supporting authentication, storage, scheduling, recordings, notifications, and platform infrastructure.",
            "Professional advisers, regulators, law enforcement, courts, or authorities where disclosure is required or lawfully permitted.",
            "Operational decision-makers inside TT where needed for safeguarding, audits, compliance, disputes, or system protection.",
          ],
        },
        {
          title: "7. Children's Information",
          paragraphs: [
            "We process children's personal information only where lawful grounds exist, including parental or guardian involvement where required.",
            "Learner data is handled with heightened care. TT does not knowingly sell, advertise with, or commercially exploit children's personal information.",
          ],
        },
        {
          title: "8. Storage and Security",
          bullets: [
            "We use role-based access controls and limit access according to operational need.",
            "We use cloud infrastructure, authentication controls, logging systems, and provider-level security measures appropriate to the services we operate.",
            "No internet-connected system is absolutely risk-free, but TT applies reasonable technical and organizational safeguards for the data it controls.",
          ],
        },
        {
          title: "9. International and Third-Party Processing",
          paragraphs: [
            "Some TT service providers may process or store information outside South Africa. Where this happens, TT uses providers and arrangements intended to provide appropriate protection for the information involved.",
          ],
        },
        {
          title: "10. Retention",
          paragraphs: [
            "We keep personal information only for as long as necessary for the purposes for which it was collected, unless longer retention is required or justified by law or legitimate operational need.",
            "Some records cannot be deleted immediately on request because TT may need to retain them for safeguarding, child-protection duties, payment and tax compliance, fraud prevention, disputes, legal claims, audits, contractor administration, session integrity review, or other lawful record-keeping obligations.",
          ],
        },
        {
          title: "11. Your POPIA Rights",
          bullets: [
            "Request access to personal information held about you.",
            "Request correction or updating of inaccurate information.",
            "Request deletion where deletion is lawful and does not conflict with TT's retention duties.",
            "Object to or limit certain processing where POPIA permits.",
            "Withdraw consent where processing is consent-based, subject to legal and operational limits.",
            "Lodge a complaint with the Information Regulator.",
          ],
        },
        {
          title: "12. Data Breaches",
          paragraphs: [
            "If TT becomes aware of a qualifying data breach, we will investigate, contain, and respond in line with our legal duties, including notification where required by law.",
          ],
        },
        {
          title: "13. Changes to This Policy",
          paragraphs: [
            "TT may update this Privacy Policy from time to time. The latest version will be posted in the platform or on the website, and continued use after an update means the updated policy applies.",
          ],
        },
      ]}
      footer={
        <p className="text-sm text-slate-600 text-center">
          Territorial Tutoring SA (Pty) Ltd | Privacy Policy | Version 1.1 | www.responseintegrity.co.za
        </p>
      }
    />
  );
}
