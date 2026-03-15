
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TerritorialTutoringLogoSVG } from "@/components/TerritorialTutoringLogoSVG";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LeadershipDevelopmentPilot() {

  const navigate = useNavigate();

  // Form state for leadership pilot interest
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ school: '', contactName: '', contactRole: '', phone: '', email: '' });
  const [errors, setErrors] = useState<{[k:string]:string}>({});
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const submittedRef = useRef<HTMLDivElement | null>(null);

  function handleOpenForm() {
    setShowForm(true);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInputRef.current?.focus();
      }
    }, 0);
  }

  function handleHeaderClick() {
    if (submitted) {
      if (submittedRef.current) {
        submittedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      handleOpenForm();
    }
  }

  useEffect(() => {
    if (showForm && !submitted && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInputRef.current?.focus();
    }
  }, [showForm, submitted]);

  function validate() {
    const e: {[k:string]:string} = {};
    if (!form.school.trim()) e.school = 'Required';
    if (!form.contactName.trim()) e.contactName = 'Required';
    if (!form.contactRole.trim()) e.contactRole = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^\+?[0-9\s()-]{7,}$/.test(form.phone)) e.phone = 'Invalid phone number';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  }


  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/pilots/highschool/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          schoolName: form.school,
          contactPersonName: form.contactName,
          contactPersonRole: form.contactRole,
          phone: form.phone,
          email: form.email,
          submitterName: null,
          submitterRole: null,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSubmitted(true);
      setShowForm(false);
      setForm({ school: '', contactName: '', contactRole: '', phone: '', email: '' });
      toast({ title: 'Submission received', description: 'Your leadership pilot request has been recorded.' });
    } catch (err) {
      console.error('Error submitting leadership pilot request:', err);
      toast({ title: 'Submission failed', description: 'Please try again later', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex-shrink-0 ml-3 md:ml-0">
            <TerritorialTutoringLogoSVG width={160} />
          </div>

          <div className="hidden md:block">
            <span className="text-2xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              RESPONSE  TRAINING
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="hidden md:inline-flex text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: "#E63946", color: "white" }}
              onClick={handleHeaderClick}
            >
              Pilot Access
            </Button>

            <Button
              className="md:hidden text-sm font-semibold px-3 py-2 rounded-full border-0 shadow hover:shadow-sm transition-all"
              style={{ backgroundColor: "#E63946", color: "white" }}
              onClick={handleHeaderClick}
              aria-label="Pilot Access"
            >
              Pilot Access
            </Button>
          </div>
        </div>
      </header>

      <div className="h-20 sm:h-28" />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">THE PROBLEM HIGH SCHOOLS ARE INHERITING</CardTitle>
            <CardDescription className="text-center">(Whether they acknowledge it or not.)</CardDescription>
          </CardHeader>

          <CardContent className="prose prose-slate max-w-none">
            <p>
              High schools are not failing because of poor teaching.
            </p>

            <p>
              They are failing because they are receiving learners whose academic response systems were never trained early enough.
            </p>

            <p>
              By Grade 8-10, many learners already carry:
            </p>

            <ul>
              <li>Panic habits under assessment</li>
              <li>Fragile execution under pressure</li>
              <li>Avoidance patterns disguised as “discipline issues”</li>
              <li>A quiet belief that school is something to survive, not master</li>
            </ul>

            <p>
              At this stage, high schools are forced into damage control.
            </p>

            <p>
              The system moves learners forward.
              The gaps move with them.
            </p>

            <h2>THE HARD TRUTH</h2>

            <ul>
              <li>The failure mode is already active</li>
              <li>The cost of correction has multiplied</li>
              <li>Identity has begun to harden</li>
            </ul>

            <p>
              High schools are expected to fix what should have been trained earlier.
              That expectation is structurally unfair - and nationally unsustainable.
            </p>

            <h2>THE INSTITUTIONAL SHIFT WE ARE BUILDING</h2>

            <p>
              Territorial Tutoring is not a tutoring company.
              We are an external academic leadership institution that enables high schools to solve a primary-school problem - upstream.
            </p>

            <p>
              Instead of treating symptoms in Grade 9-12, we help high schools:
            </p>

            <p>
              Deploy their top students as trained response-conditioning leaders for primary learners - before panic habits form.
            </p>

            <p>
              This is not charity. This is infrastructure.
            </p>

            <h2>HOW THE COLLABORATION WORKS</h2>

            <ol>
              <li>
                <strong>High Schools Nominate Their Top Students</strong>
                <p>High-performing, high-potential learners are selected - not recruited. Selection itself becomes a mark of distinction.</p>
              </li>
              <li>
                <strong>TT Trains Them as Response-Conditioning Executives</strong>
                <p>Selected students undergo structured training in execution under pressure, response-control during uncertainty, teaching clarity, and psychological leadership.</p>
              </li>
              <li>
                <strong>These Students Serve Primary Learners</strong>
                <p>High school leaders work with referred Grade 6-7 learners, train calm execution, intercept panic habits early, and model composure.</p>
              </li>
            </ol>

            <h2>WHY THIS BENEFITS HIGH SCHOOLS DIRECTLY</h2>

            <ol>
              <li>
                <strong>Leadership Development That Actually Matters</strong>
                <p>Your students lead real interventions, carry responsibility, and develop rare psychological maturity.</p>
              </li>
              <li>
                <strong>Stronger Incoming Learners (Upstream Effect)</strong>
                <p>Grade 6-7 learners enter high school with fewer panic habits and higher execution confidence.</p>
              </li>
              <li>
                <strong>Institutional Reputation (Earned, Not Marketed)</strong>
                <p>High schools can truthfully say: “Our students are selected and trained to serve as academic leaders in early intervention.”</p>
              </li>
              <li>
                <strong>Reducing Warehousing</strong>
                <p>This model slows identity collapse and reduces the number of learners being pushed forward unprepared.</p>
              </li>
            </ol>

            <h2>WHY THIS MATTERS FOR SOUTH AFRICA</h2>

            <p>
              South Africa does not only need more degrees. It needs skills with execution, confidence without entitlement, and leadership without ego.
            </p>

            <h2>WHO THIS IS FOR</h2>

            <p>
              Principals and Deputy Principals, Academic Heads, Heads of Mathematics, Learner Leadership Coordinators, and schools that take long-term outcomes seriously.
            </p>

            <h2>THE PILOT MODEL</h2>

            <ul>
              <li>Limited intake (10 selected students)</li>
              <li>Term-based pilot</li>
              <li>Clear governance and scope</li>
              <li>No curriculum interference</li>
              <li>Full operational oversight by TT</li>
              <li>Zero admin for highschools</li>
            </ul>

            <h2>POSITIONING</h2>
            <p className="font-semibold">Territorial Tutoring enables high schools to develop academic leaders who execute under pressure and apply those skills to real educational challenges.</p>

            <div className="text-center mt-6">
              <div className="flex flex-col items-center mt-8 mb-4 px-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-6 py-4 rounded-full font-semibold mb-2"
                  style={{ backgroundColor: "#E63946", color: "white" }}
                  onClick={() => setShowForm(true)}
                >
                  Initiate High School Leadership Pilot Consideration
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">This submission registers interest only. No obligation. No activation without alignment.</p>
              </div>

            {/* Inline form for Leadership Pilot */}
            {showForm && !submitted && (
              <div ref={formRef} className="max-w-2xl mx-auto mt-6">
                <Card className="p-4 sm:p-6" style={{ backgroundColor: "white" }}>
                  <h3 className="text-lg font-bold mb-4">Request Leadership Pilot Access</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">School name</label>
                      <input ref={firstInputRef} value={form.school} onChange={e => setForm({...form, school: e.target.value})} className="w-full border rounded px-3 py-2" />
                      {errors.school && <div className="text-sm text-red-600 mt-1">{errors.school}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Name & Surname of contact person</label>
                      <input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full border rounded px-3 py-2" />
                      {errors.contactName && <div className="text-sm text-red-600 mt-1">{errors.contactName}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Role of contact person</label>
                      <input value={form.contactRole} onChange={e => setForm({...form, contactRole: e.target.value})} className="w-full border rounded px-3 py-2" />
                      {errors.contactRole && <div className="text-sm text-red-600 mt-1">{errors.contactRole}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Phone number</label>
                      <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded px-3 py-2" />
                      {errors.phone && <div className="text-sm text-red-600 mt-1">{errors.phone}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2" />
                      {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2 rounded-full" style={{ backgroundColor: "#E63946", color: "white" }}>{isSubmitting ? 'Sending...' : 'Submit'}</Button>
                      <Button type="button" className="w-full sm:w-auto px-4 py-2 rounded-full border" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {submitted && (
              <div className="max-w-2xl mx-auto mt-6">
                <Card className="p-4 sm:p-6" style={{ backgroundColor: "white" }}>
                  <h3 className="text-lg font-bold mb-3">Submission Received</h3>

                  <p>Thank you for submitting your school's interest in the TT Leadership Development Pilot.</p>

                  <p className="mt-3">Your request has been logged for internal review.</p>

                  <p className="mt-3">A member of the Territorial Tutoring team will contact the designated staff representative to:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>Confirm suitability for the pilot</li>
                    <li>Clarify selection and training framework</li>
                    <li>Align on term-based timing and scope</li>
                    <li>Discuss how this could align with your school’s leadership and academic objectives</li>
                  </ul>

                  <p className="mt-3">This submission does not commit your school to participation. It initiates a consideration process.</p>

                  <div className="mt-6 border-t pt-4 text-sm">
                    <br />
                    Territorial Tutoring SA<br />
                    Academic Leadership &amp; Response-Conditioning for Schools
                  </div>
                </Card>
              </div>
            )}

          </CardContent>
        </Card>
      </section>
    </div>
  );
}
