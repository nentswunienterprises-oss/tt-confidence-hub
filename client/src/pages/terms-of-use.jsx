import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function TermsOfUse() {
    var navigate = useNavigate();
    return (<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={function () { return navigate(-1); }} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4"/>
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Use</CardTitle>
            <CardDescription className="text-center">
              Territorial Tutoring SA (Pty) Ltd
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.1 Acceptance of Terms</h2>
              <p>
                By accessing or using Territorial Tutoring's services, you agree to these Terms of Use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.2 Our Services</h2>
              <p>
                Territorial Tutoring provides online tutoring and academic mentorship services via our web application and Google Meet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.3 User Responsibilities</h2>
              <p>Parents and students agree to:</p>
              <ul className="list-disc pl-6">
                <li>Provide accurate information</li>
                <li>Maintain confidentiality of login credentials</li>
                <li>Attend sessions punctually</li>
                <li>Respect tutors and staff</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.4 Payments and Subscriptions</h2>
              <ul className="list-disc pl-6">
                <li>Payments are processed securely via Stripe</li>
                <li>Subscriptions are billed monthly unless otherwise agreed</li>
                <li>Failure to pay may result in suspension of services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.5 Intellectual Property</h2>
              <p>
                All materials, content, and systems remain the property of Territorial Tutoring SA (Pty) Ltd.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.6 Termination</h2>
              <p>
                We may suspend or terminate access for breach of these terms or misconduct.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.7 Limitation of Liability</h2>
              <p>
                Territorial Tutoring is not liable for indirect or consequential losses arising from use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2.8 Governing Law</h2>
              <p>
                These terms are governed by the laws of the Republic of South Africa.
              </p>
            </section>

            <div className="mt-12 p-6 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600 text-center">
                Last updated: July 17, 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
