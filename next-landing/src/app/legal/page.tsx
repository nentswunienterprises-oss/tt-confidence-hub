'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Legal Pack</CardTitle>
            <CardDescription>
              Territorial Tutoring SA (Pty) Ltd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="privacy" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                <TabsTrigger value="terms">Terms of Use</TabsTrigger>
              </TabsList>

              <TabsContent value="privacy" className="mt-6">
                <div className="prose prose-slate max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.1 Introduction</h3>
                    <p>
                      Territorial Tutoring SA (Pty) Ltd ("Territorial Tutoring", "TT", "we", "us", "our") is committed to protecting the privacy, dignity, and personal information of our students, parents, tutors, and partners. We operate in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and all applicable South African data protection laws.
                    </p>
                    <p>
                      This Privacy Policy explains how we collect, use, store, share, and protect personal information when you use our website, web application, and services.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.2 Who We Are</h3>
                    <ul className="list-disc pl-6">
                      <li><strong>Legal Entity:</strong> Territorial Tutoring SA (Pty) Ltd</li>
                      <li><strong>Jurisdiction:</strong> Republic of South Africa</li>
                      <li><strong>Contact:</strong> privacy@territorialtutoring.co.za (to be activated)</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.3 What Personal Information We Collect</h3>
                    
                    <h4 className="text-lg font-semibold mt-4 mb-2">Students</h4>
                    <ul className="list-disc pl-6">
                      <li>Full name, age, grade, school</li>
                      <li>Academic performance data and assessment results</li>
                      <li>Session notes, learning behaviour, progress tracking</li>
                      <li>Session recordings (audio/video)</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2">Parents / Guardians</h4>
                    <ul className="list-disc pl-6">
                      <li>Full name, email address, phone number</li>
                      <li>Billing and payment details (processed via Stripe)</li>
                      <li>Communication history and consent records</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2">Tutors & Staff</h4>
                    <ul className="list-disc pl-6">
                      <li>Identification and background information</li>
                      <li>CVs, training performance, certifications</li>
                      <li>Banking details and payment records</li>
                      <li>Employment and contract documentation</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-4 mb-2">Technical Information</h4>
                    <ul className="list-disc pl-6">
                      <li>IP address, device type, browser type</li>
                      <li>Usage data within our web application</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.4 Why We Collect Personal Information</h3>
                    <p>We collect personal information to:</p>
                    <ul className="list-disc pl-6">
                      <li>Deliver tutoring and mentorship services</li>
                      <li>Track and improve student learning outcomes</li>
                      <li>Process payments and manage subscriptions</li>
                      <li>Train, manage, and quality‑assure tutors</li>
                      <li>Communicate with parents and students</li>
                      <li>Comply with legal and regulatory obligations</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.5 How We Store and Protect Information</h3>
                    <ul className="list-disc pl-6">
                      <li>Secure cloud infrastructure and encrypted databases</li>
                      <li>Role‑based access control (only authorised staff may access data)</li>
                      <li>Secure authentication and logging systems</li>
                      <li>Stripe for PCI‑compliant payment processing</li>
                      <li>Google Meet for secure tutoring sessions and recordings</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.6 Sharing of Information</h3>
                    <p>We only share personal information with:</p>
                    <ul className="list-disc pl-6">
                      <li>Tutors assigned to the student (limited to what is necessary)</li>
                      <li>Stripe (payment processing)</li>
                      <li>Technology service providers supporting our platform</li>
                      <li>Regulators or authorities when legally required</li>
                    </ul>
                    <p className="mt-4">
                      <strong>We never sell personal information or use it for advertising.</strong>
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.7 Children's Information</h3>
                    <p>
                      We process children's personal information only with parental or guardian consent. We apply heightened protection measures and do not profile, sell, or commercially exploit children's data.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.8 Your Rights Under POPIA</h3>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6">
                      <li>Access your personal information</li>
                      <li>Correct or update your information</li>
                      <li>Request deletion</li>
                      <li>Withdraw consent</li>
                      <li>Lodge a complaint with the Information Regulator</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.9 Data Retention</h3>
                    <p>
                      We retain personal information only for as long as necessary to fulfil our services and legal obligations. Thereafter, information is securely deleted or anonymised.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.10 Data Breaches</h3>
                    <p>In the event of a data breach, we will:</p>
                    <ul className="list-disc pl-6">
                      <li>Investigate immediately</li>
                      <li>Notify affected parties and the Information Regulator within 72 hours</li>
                      <li>Implement remediation measures</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.11 International Data Transfers</h3>
                    <p>
                      Some service providers may store data outside South Africa. We ensure equivalent data protection safeguards are in place.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">1.12 Changes to This Policy</h3>
                    <p>
                      We may update this policy from time to time. The latest version will always be available on our website.
                    </p>
                  </section>

                  <div className="mt-8 p-6 bg-slate-100 rounded-lg">
                    <p className="text-sm text-slate-600 text-center">
                      Last updated: January 19, 2026
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="mt-6">
                <div className="prose prose-slate max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">Terms of Use</h2>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.1 Acceptance of Terms</h3>
                    <p>
                      By accessing or using Territorial Tutoring's services, you agree to these Terms of Use.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.2 Our Services</h3>
                    <p>
                      Territorial Tutoring provides online tutoring and academic mentorship services via our web application and Google Meet.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.3 User Responsibilities</h3>
                    <p>Parents and students agree to:</p>
                    <ul className="list-disc pl-6">
                      <li>Provide accurate information</li>
                      <li>Maintain confidentiality of login credentials</li>
                      <li>Attend sessions punctually</li>
                      <li>Respect tutors and staff</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.4 Payments and Subscriptions</h3>
                    <ul className="list-disc pl-6">
                      <li>Payments are processed securely via Stripe</li>
                      <li>Subscriptions are billed monthly unless otherwise agreed</li>
                      <li>Failure to pay may result in suspension of services</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.5 Intellectual Property</h3>
                    <p>
                      All materials, content, and systems remain the property of Territorial Tutoring SA (Pty) Ltd.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.6 Termination</h3>
                    <p>
                      We may suspend or terminate access for breach of these terms or misconduct.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.7 Limitation of Liability</h3>
                    <p>
                      Territorial Tutoring is not liable for indirect or consequential losses arising from use of the service.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">2.8 Governing Law</h3>
                    <p>
                      These terms are governed by the laws of the Republic of South Africa.
                    </p>
                  </section>

                  <div className="mt-8 p-6 bg-slate-100 rounded-lg">
                    <p className="text-sm text-slate-600 text-center">
                      Last updated: January 19, 2026
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
