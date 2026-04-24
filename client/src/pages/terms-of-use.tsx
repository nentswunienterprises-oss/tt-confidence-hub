import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resolveTrackedBackTarget } from "@/lib/publicTracking";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TermsOfUse() {
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = resolveTrackedBackTarget(location.search);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(backTarget)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Use</CardTitle>
            <CardDescription className="text-center">
              Territorial Tutoring SA (Pty) Ltd | Effective from 2026/04/12
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p>
              This document governs all use of the Territorial Tutoring platform by parents, learners, and tutors.
            </p>

            <p>
              Territorial Tutoring is not a conventional tutoring service. It is a response-conditioning system. Every element of
              this platform, from the drill structure to the reporting, exists to build one thing: the conditioned ability to execute
              mathematics correctly, consistently, and under pressure. By using this platform, all parties agree to operate
              within the standards and philosophy that make that possible.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
              <p>The following terms apply throughout this document:</p>
              <ul className="list-disc pl-6">
                <li>TT or the Company refers to Territorial Tutoring SA (Pty) Ltd.</li>
                <li>The Platform refers to the Territorial Tutoring web and mobile application and all associated services.</li>
                <li>The TT OS refers to the Territorial Tutoring Operating System: the structured conditioning methodology built on the Model, Apply, Guide framework and the four conditioning phases.</li>
                <li>Learner refers to the student enrolled on the platform.</li>
                <li>Parent or Guardian refers to the adult responsible for the learner&apos;s enrollment and account.</li>
                <li>Tutor refers to the independent contractor engaged by TT to deliver conditioning sessions.</li>
                <li>Session refers to a structured training drill conducted between a tutor and a learner on the platform.</li>
                <li>Conditioning Phase refers to one of the four progressive stages: Clarity, Structured Execution, Controlled Discomfort, and Time Pressure Stability.</li>
                <li>Boss Battle refers to the third conditioning phase, Controlled Discomfort, in which the learner is challenged under increased pressure as part of the progression sequence.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Acceptance of Terms</h2>
              <p>
                By creating an account, enrolling a learner, accepting a tutor assignment, or using any part of the platform, you
                confirm that you have read, understood, and agreed to these Terms of Use in full.
              </p>
              <p>
                If you do not agree to these terms, you may not use the platform. TT reserves the right to update these terms at
                any time. Continued use of the platform following any update constitutes acceptance of the revised terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. The Nature of This Service</h2>
              <p>
                Territorial Tutoring is a response-conditioning system, not a standard tutoring or homework help service. The
                platform is designed to build durable, automatic mathematical execution in learners through structured repetition
                and progressive difficulty.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 The TT Operating System</h3>
              <p>
                All sessions on the platform are governed by the TT OS. Tutors follow the Model, Apply, Guide framework in every
                session. This means the tutor demonstrates correct execution, requires the learner to execute independently, and
                corrects and directs based on observed performance. Tutors do not simply explain or assist with homework.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 The Four Conditioning Phases</h3>
              <p>
                Every learner progresses through four phases in sequence: Clarity, Structured Execution, Controlled Discomfort,
                and Time Pressure Stability. Progression between phases is not automatic. It is earned through demonstrated
                stability. Within each phase, a learner moves through four stability states: Low, Medium, High, and High
                Maintenance. A learner must reach and pass the High Maintenance stability state before being progressed to the
                next conditioning phase. No learner will be advanced without meeting this standard.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 The Law of Inevitability</h3>
              <p>
                The conditioning system is built on the principle that correct repetition, applied consistently and with discipline,
                makes the desired result inevitable. Parents and learners enrolling on the platform are enrolling in a process, not
                purchasing a guaranteed outcome in a fixed timeframe. Results are a function of consistency and compliance with
                the system.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Parent and Guardian Obligations</h2>
              <p>By enrolling a learner on the platform, the parent or guardian agrees to the following:</p>
              <ul className="list-disc pl-6">
                <li>You are enrolling your child in a conditioning programme. Results require time, repetition, and your child&apos;s consistent participation.</li>
                <li>You will not interfere with the tutor&apos;s execution of the TT OS during sessions. Tutors are trained to follow a specific method. Requests to deviate from the method are not accommodated.</li>
                <li>You acknowledge that the conditioning process includes phases of deliberate difficulty. Controlled Discomfort and Time Pressure Stability are intentional design elements, not errors.</li>
                <li>You will ensure your child attends scheduled sessions. Consistent absence undermines the conditioning process and does not entitle the parent to a refund of sessions missed.</li>
                <li>You will maintain an active account with accurate contact information and respond to communication from TT or the assigned tutor within a reasonable time.</li>
                <li>You will not share your account credentials or allow another person to act as the enrolled learner during sessions.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Learner Obligations</h2>
              <p>Learners using the platform agree to the following:</p>
              <ul className="list-disc pl-6">
                <li>You will engage with sessions honestly and to the best of your ability. The platform tracks your performance to determine phase progression. Dishonest execution produces inaccurate data and slows your own development.</li>
                <li>You will follow the tutor&apos;s instructions within a session. The tutor is executing a structured system on your behalf.</li>
                <li>You will not attempt to manipulate session outcomes, skip required steps, or misrepresent your performance to the platform or to your tutor.</li>
                <li>You acknowledge that difficulty is part of the process. Phases are designed to challenge you. Discomfort during a session is not grounds for stopping or for a complaint.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Tutor Obligations</h2>
              <p>
                Tutors operate on the platform as independent contractors. By accepting an assignment and conducting sessions
                through the platform, tutors agree to the following:
              </p>
              <ul className="list-disc pl-6">
                <li>You will execute every session strictly in accordance with the TT OS. The Model, Apply, Guide framework is non-negotiable. Sessions not conducted within this framework are non-compliant.</li>
                <li>You will record session observations accurately and honestly in the platform. Tutor reports feed directly into the learner&apos;s conditioning profile and parent-facing reports. Inaccurate reporting corrupts the system.</li>
                <li>You will not advance a learner to the next conditioning phase unless the learner has genuinely reached and passed the High Maintenance stability state. Phase integrity is central to the value of the system.</li>
                <li>You will not conduct sessions, communicate with learners or parents, or accept payment outside of the platform without written authorisation from TT.</li>
                <li>You will maintain the confidentiality of all learner data, session records, and TT operational information accessed through the platform.</li>
                <li>You acknowledge that your engagement with TT is that of an independent contractor. Nothing in these terms or in your use of the platform creates an employment relationship.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Platform Use and Conduct</h2>
              <p>All users of the platform, including parents, learners, and tutors, agree to the following standards of conduct:</p>
              <ul className="list-disc pl-6">
                <li>You will use the platform only for its intended purpose: the delivery and receipt of response-conditioning mathematics sessions.</li>
                <li>You will not attempt to access, alter, or interfere with any part of the platform beyond your designated role and permissions.</li>
                <li>You will not reproduce, distribute, or share any proprietary TT content, including drill structures, conditioning logic, or reporting frameworks, without written consent from TT.</li>
                <li>You will treat all other users of the platform with respect. Abusive, threatening, or discriminatory conduct toward any user is grounds for immediate account suspension.</li>
                <li>You will report any technical issues, suspected misuse, or conduct that violates these terms to TT promptly.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Payments and Refunds</h2>
              <p>TT operates on a monthly subscription model. Each monthly package covers 8 sessions, delivered at 2 sessions per week. The following conditions apply to all transactions:</p>
              <ul className="list-disc pl-6">
                <li>The monthly subscription fee is due at the start of each billing cycle. Access to the platform and session scheduling is contingent on payment being up to date.</li>
                <li>Sessions missed by the learner within a billing cycle without sufficient notice as defined in the enrollment agreement are forfeited and non-refundable. Unused sessions do not roll over to the following month.</li>
                <li>Sessions cancelled by the tutor or by TT will be rescheduled or credited to the parent&apos;s account at TT&apos;s discretion.</li>
                <li>Refunds are not issued for dissatisfaction with the conditioning process, the difficulty of a phase, or the pace of a learner&apos;s progression. The system works through consistency. Withdrawal from the system before adequate repetitions have been completed is not grounds for a refund.</li>
                <li>TT reserves the right to suspend or terminate access to the platform for non-payment without further notice.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Data and Privacy</h2>
              <p>
                TT collects and processes personal information in accordance with the Protection of Personal Information Act
                (POPIA) of South Africa. By using the platform, you consent to the collection and use of your information as
                described below:
              </p>
              <ul className="list-disc pl-6">
                <li>Learner performance data, session logs, and conditioning reports are collected to operate the platform and deliver the service.</li>
                <li>Parent contact information is used to communicate about the learner&apos;s progress, session scheduling, and account management.</li>
                <li>Tutor session records are used for quality assurance, reporting accuracy, and compliance with the TT OS.</li>
                <li>TT does not sell personal data to third parties. Data is not shared outside of TT except where required by law or as necessary to deliver the service.</li>
                <li>You may request access to, correction of, or deletion of your personal data by contacting TT at legal@territorialtutoring.co.za.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
              <p>
                All content on the platform, including but not limited to the TT OS methodology, conditioning phase structure, drill
                logic, stability progression framework, reporting templates, and all associated materials, is the intellectual property
                of Territorial Tutoring SA (Pty) Ltd.
              </p>
              <p>
                No part of the platform or its methodology may be copied, reproduced, adapted, or used outside of the platform
                without the express written permission of TT. Unauthorised use of TT intellectual property will be pursued to the full
                extent of applicable law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
              <p>
                TT provides the platform and the conditioning service in good faith and in accordance with the TT OS. To the
                extent permitted by South African law:
              </p>
              <ul className="list-disc pl-6">
                <li>TT does not guarantee a specific academic outcome or improvement in a specific timeframe. Outcomes are a function of the learner&apos;s consistency and engagement with the system.</li>
                <li>TT is not liable for losses or damages arising from a user&apos;s failure to comply with these terms, including missed sessions, dishonest reporting, or deviation from the TT OS.</li>
                <li>TT is not liable for disruptions to the platform caused by factors outside its reasonable control, including internet outages, device failures, or force majeure events.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
              <p>
                TT reserves the right to suspend or permanently terminate the account of any user who violates these Terms of
                Use, engages in conduct harmful to the platform or to other users, or fails to meet payment obligations.
              </p>
              <p>
                A parent or guardian may terminate their enrollment at any time by providing written notice to TT at
                support@territorialtutoring.co.za. Termination does not entitle the user to a refund of fees already paid for sessions
                not yet conducted, except where TT is at fault.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p>
                These Terms of Use are governed by the laws of the Republic of South Africa. Any disputes arising from these
                terms or from the use of the platform will be subject to the jurisdiction of the South African courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Contact</h2>
              <p>For questions about these Terms of Use, please contact TT at the following:</p>
              <ul className="list-disc pl-6">
                <li>General enquiries: hello@territorialtutoring.co.za</li>
                <li>Support: support@territorialtutoring.co.za</li>
                <li>Legal: legal@territorialtutoring.co.za</li>
                <li>Website: www.territorialtutoring.co.za</li>
              </ul>
            </section>

            <p>
              By using the Territorial Tutoring platform you confirm that you understand this is a conditioning system, not a
              conventional tutoring service. The method is structured, the standards are non-negotiable, and the result is
              built through repetition. These terms exist to protect that process for every learner on the platform.
            </p>

            <div className="mt-12 p-6 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600 text-center">
                Territorial Tutoring SA (Pty) Ltd | Terms of Use | Version 1.0 | www.territorialtutoring.co.za
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
