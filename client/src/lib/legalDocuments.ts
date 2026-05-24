export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocumentDefinition = {
  title: string;
  description: string;
  path: string;
  filename: string;
  metaItems: string[];
  introParagraphs: string[];
  sections: LegalSection[];
  footerItems: string[];
};

export const termsOfUseDocument: LegalDocumentDefinition = {
  title: "Platform Terms of Use",
  description: "Response Integrity platform terms governing public use and family enrollment.",
  path: "/terms-of-use",
  filename: "terms-of-use.html",
  metaItems: [
    "Response Integrity (Pty) Ltd",
    "Version 1.2",
    "Effective May 24, 2026",
  ],
  introParagraphs: [
    "These terms govern public use of the platform and family enrollment into Response Integrity.",
    "Response Integrity is not a conventional tutoring service. It is a response-conditioning system designed to build calm, correct, repeatable mathematical execution under pressure.",
    "Family access, intake, scheduling, diagnostics, reporting, and progression are governed by Response Integrity's operating model, including protected intake windows, cadence requirements, and Response Integrity-OS delivery rules.",
  ],
  sections: [
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
  ],
  footerItems: [
    "Response Integrity (Pty) Ltd",
    "Platform Terms of Use",
    "Version 1.2",
    "www.responseintegrity.co.za",
  ],
};

export const privacyPolicyDocument: LegalDocumentDefinition = {
  title: "Privacy Policy",
  description:
    "Response Integrity privacy policy covering collection, use, storage, sharing, retention, and protection of personal information.",
  path: "/privacy-policy",
  filename: "privacy-policy.html",
  metaItems: [
    "Response Integrity (Pty) Ltd",
    "Version 1.2",
    "Effective May 24, 2026",
  ],
  introParagraphs: [
    'Response Integrity (Pty) Ltd ("Response Integrity", "RI", "we", "us", "our") processes personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and other applicable South African law.',
    "This policy explains how we collect, use, store, share, retain, and protect personal information across our website, web application, onboarding flows, scheduling systems, recording systems, notifications, and related operational services.",
  ],
  sections: [
    {
      title: "1. Who This Policy Covers",
      paragraphs: [
        "This policy applies to parents, guardians, learners, students, tutors, Territory Directors, Education Growth Partners, outreach directors, executives, applicants, contractors, and other users of Response Integrity public or operational systems.",
      ],
      bullets: [
        "Legal entity: Response Integrity (Pty) Ltd",
        "Jurisdiction: Republic of South Africa",
        "Contact: support@responseintegrity.co.za",
      ],
    },
    {
      title: "2. Information We Collect",
      paragraphs: [
        "The exact information we collect depends on your role and how you use the platform.",
      ],
      bullets: [
        "Identity and account data such as names, email addresses, phone numbers, role, login details, and account status.",
        "Learner and family data such as learner name, age, grade, school, enrollment details, intake-cycle or waitlist status, parent contact data, and consent records.",
        "Academic scope and intake data such as school topic coverage, upcoming curriculum scope, topic concerns, parent-reported response symptoms, learner history, fit-review inputs, and topic-priority information provided during planning or onboarding.",
        "Session and academic data such as diagnoses, recommended starting phases, topic maps, drill logs, reports, progression states, phase and stability records, observations, scheduling activity, and session outcomes.",
        "Recording and compliance data such as session recordings, audio, video, submitted recording files, associated timestamps, and related compliance artifacts, which may include transcript-related records where available.",
        "Payment and billing data such as payment status, transaction references, plan status, and subscription-related records. Card processing is handled through payment processors such as Payfast; Response Integrity does not store full card details.",
        "Operational workforce data such as ID documents, contractor records, onboarding acceptances, certifications, audit history, banking details for payout administration, and performance-linked operational records.",
        "Affiliate and acquisition data such as referral codes, tracked links, encounter records, lead and close tracking, payment attribution, and campaign or source information.",
        "Technical and device data such as IP address, device and browser information, access logs, session identifiers, notification subscription data, and usage records inside the platform.",
      ],
    },
    {
      title: "3. How We Collect Information",
      bullets: [
        "Directly from you when you sign up, apply, enroll, upload documents, book sessions, make payments, or contact Response Integrity.",
        "Directly from parents or guardians during intake, onboarding, scope collection, waitlist registration, schedule alignment, diagnostics preparation, and related planning activities.",
        "Automatically through platform use, authentication flows, scheduling systems, logs, notifications, and browser or device interactions.",
        "From Response Integrity operational users such as tutors, TDs, EGPs, or executives when they record lawful platform observations or workflow actions.",
        "From service providers and processors used to operate Response Integrity, including payment, storage, scheduling, authentication, and communication providers.",
      ],
    },
    {
      title: "4. Why We Use Information",
      bullets: [
        "To create and manage accounts, onboarding flows, and access permissions.",
        "To review enrollment fit, intake eligibility, waitlist placement, and lawful service-entry decisions.",
        "To deliver Response Integrity response-conditioning services, scheduling workflows, learner progression, topic mapping, and reporting.",
        "To prepare ahead-of-class conditioning using school scope, topic history, parent-reported symptoms, and related academic planning inputs.",
        "To generate or support phase recommendations, diagnostic starting points, stability tracking, and other rules-based operational outputs inside Response Integrity-OS.",
        "To process payments, confirm account status, manage early-access eligibility, and administer contractor or affiliate-related payment records.",
        "To safeguard learners, investigate incidents, review disputes, and maintain system integrity.",
        "To monitor compliance, quality, audit accuracy, and role performance across Response Integrity operations.",
        "To operate communications such as service emails, account notices, and browser push notifications where enabled.",
        "To measure acquisition, referral, and attribution performance.",
        "To comply with legal, regulatory, tax, safeguarding, fraud-prevention, and record-keeping duties.",
      ],
    },
    {
      title: "5. Recordings and Monitoring",
      paragraphs: [
        "Response Integrity is a recorded, data-driven operating system. Sessions and related operational workflows may generate recordings, logs, metadata, submitted files, and related compliance records.",
        "We use these records for service delivery, safeguarding, quality control, audit review, operational continuity, dispute handling, performance verification, fraud prevention, and lawful system improvement.",
      ],
    },
    {
      title: "6. How We Share Information",
      paragraphs: [
        "We do not sell personal information and we do not use children's data for advertising.",
      ],
      bullets: [
        "Assigned tutors, TDs, or relevant Response Integrity operators where access is necessary to deliver or supervise the service.",
        "Payment processors such as Payfast for transaction handling.",
        "Technology providers supporting authentication, storage, scheduling, recordings, notifications, and platform infrastructure.",
        "Professional advisers, regulators, law enforcement, courts, or authorities where disclosure is required or lawfully permitted.",
        "Internal operational decision-makers where needed for safeguarding, audits, compliance, disputes, or system protection.",
      ],
    },
    {
      title: "7. Children's Information",
      paragraphs: [
        "We process children's personal information only where lawful grounds exist, including parental or guardian involvement where required.",
        "Learner data is handled with heightened care. Response Integrity does not knowingly sell, advertise with, or commercially exploit children's personal information.",
      ],
    },
    {
      title: "8. Storage and Security",
      bullets: [
        "We use role-based access controls and limit access according to operational need.",
        "We use cloud infrastructure, authentication controls, logging systems, and provider-level security measures appropriate to the services we operate.",
        "No internet-connected system is absolutely risk-free, but Response Integrity applies reasonable technical and organizational safeguards for the data it controls.",
      ],
    },
    {
      title: "9. International and Third-Party Processing",
      paragraphs: [
        "Some service providers may process or store information outside South Africa. Where this happens, we use providers and arrangements intended to provide appropriate protection for the information involved.",
      ],
    },
    {
      title: "10. Retention",
      paragraphs: [
        "We keep personal information only for as long as necessary for the purposes for which it was collected, unless longer retention is required or justified by law or legitimate operational need.",
        "Some records cannot be deleted immediately on request because Response Integrity may need to retain them for safeguarding, child-protection duties, payment and tax compliance, fraud prevention, disputes, legal claims, audits, contractor administration, session integrity review, intake-history review, waitlist records, or other lawful record-keeping obligations.",
      ],
    },
    {
      title: "11. Your POPIA Rights",
      bullets: [
        "Request access to personal information held about you.",
        "Request correction or updating of inaccurate information.",
        "Request deletion where deletion is lawful and does not conflict with Response Integrity's retention duties.",
        "Object to or limit certain processing where POPIA permits.",
        "Withdraw consent where processing is consent-based, subject to legal and operational limits.",
        "Lodge a complaint with the Information Regulator.",
      ],
    },
    {
      title: "12. Data Breaches",
      paragraphs: [
        "If Response Integrity becomes aware of a qualifying data breach, we will investigate, contain, and respond in line with our legal duties, including notification where required by law.",
      ],
    },
    {
      title: "13. Changes to This Policy",
      paragraphs: [
        "Response Integrity may update this Privacy Policy from time to time. The latest version will be posted in the platform or on the website, and continued use after an update means the updated policy applies.",
      ],
    },
  ],
  footerItems: [
    "Response Integrity (Pty) Ltd",
    "Privacy Policy",
    "Version 1.2",
    "www.responseintegrity.co.za",
  ],
};

export const publicLegalDocuments = [termsOfUseDocument, privacyPolicyDocument];
