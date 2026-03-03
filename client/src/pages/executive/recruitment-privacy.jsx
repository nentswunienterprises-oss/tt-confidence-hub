import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function RecruitmentPrivacy() {
    var navigate = useNavigate();
    return (<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={function () { return navigate(-1); }} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4"/>
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Recruitment & Employee Privacy Notice</CardTitle>
            <CardDescription className="text-center">
              Territorial Tutoring SA (Pty) Ltd
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="lead">
              This Recruitment & Employee Privacy Notice explains how Territorial Tutoring SA (Pty) Ltd ("Territorial Tutoring", "TT") collects, uses, stores, and protects personal information of job applicants, tutors, contractors, and employees in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA).
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Purpose of This Notice</h2>
              <p>
                We collect and process personal information to manage recruitment, vetting, contracting, employment, payroll, performance management, and legal compliance in a lawful, secure, and transparent manner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. What Personal Information We Collect</h2>
              <p>We may collect and process:</p>
              <ul className="list-disc pl-6">
                <li>Identity documents (ID / Passport)</li>
                <li>CVs, qualifications, and certifications</li>
                <li>Contact details (email, phone number, address)</li>
                <li>References and background check results</li>
                <li>Banking details and tax information</li>
                <li>Employment history and performance records</li>
                <li>Training, assessment, and disciplinary records</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Why We Collect This Information</h2>
              <p>Personal information is collected to:</p>
              <ul className="list-disc pl-6">
                <li>Assess suitability for recruitment and placement</li>
                <li>Conduct background and reference checks</li>
                <li>Enter into employment or contractor agreements</li>
                <li>Administer payroll and payments</li>
                <li>Meet legal and regulatory obligations</li>
                <li>Manage performance, training, and professional development</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Lawful Basis for Processing</h2>
              <p>We process personal information based on:</p>
              <ul className="list-disc pl-6">
                <li>Your consent</li>
                <li>The necessity to perform a contract</li>
                <li>Compliance with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Storage, Security, and Access</h2>
              <ul className="list-disc pl-6">
                <li>Information is stored on secure, encrypted systems</li>
                <li>Access is restricted to authorised personnel only</li>
                <li>Role-based access control and audit logging are enforced</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <ul className="list-disc pl-6">
                <li>Unsuccessful applicant data is retained for up to 12 months, then securely deleted</li>
                <li>Employee and contractor data is retained for the duration of the relationship and as required by law thereafter</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights Under POPIA</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6">
                <li>Access your personal information</li>
                <li>Request correction or deletion</li>
                <li>Withdraw consent (where applicable)</li>
                <li>Lodge a complaint with the Information Regulator</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Data Breaches</h2>
              <p>
                In the event of a data breach, we will notify affected parties and the Information Regulator within 72 hours and take immediate remediation action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
              <p>
                Privacy enquiries may be directed to: <strong>privacy@territorialtutoring.co.za</strong> (to be activated)
              </p>
            </section>

            <div className="mt-12 p-6 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600 text-center">
                Last updated: January 19, 2026
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
