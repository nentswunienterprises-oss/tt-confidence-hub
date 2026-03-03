var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TerritorialTutoringLogoSVG } from "@/components/TerritorialTutoringLogoSVG";
import { TTLogo } from "@/components/TTLogo";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
export default function EarlyInterventionReferralProgram() {
    useEffect(function () { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
    var _a = useState(false), showForm = _a[0], setShowForm = _a[1];
    var _b = useState(false), submitted = _b[0], setSubmitted = _b[1];
    var _c = useState({ school: '', contactName: '', contactRole: '', phone: '', email: '' }), form = _c[0], setForm = _c[1];
    var _d = useState({}), errors = _d[0], setErrors = _d[1];
    var toast = useToast().toast;
    var _e = useState(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var formRef = useRef(null);
    var firstInputRef = useRef(null);
    var submittedRef = useRef(null);
    function handleOpenForm() {
        var _a;
        setShowForm(true);
        // If the form is already rendered, scroll and focus immediately
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (_a = firstInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }
    function handleHeaderClick() {
        if (submitted) {
            // Scroll to submitted confirmation
            if (submittedRef.current) {
                submittedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        else {
            handleOpenForm();
        }
    }
    useEffect(function () {
        var _a;
        if (showForm && !submitted && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (_a = firstInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }, [showForm, submitted]);
    // Responsive header logo width (larger on desktop, smaller on phones)
    var _f = useState(function () {
        if (typeof window === 'undefined')
            return 190;
        var w = window.innerWidth;
        if (w < 640)
            return 140;
        if (w < 768)
            return 170;
        if (w < 1024)
            return 190;
        return 240;
    }), logoWidth = _f[0], setLogoWidth = _f[1];
    useEffect(function () {
        function update() {
            var w = window.innerWidth;
            if (w < 640)
                setLogoWidth(140);
            else if (w < 768)
                setLogoWidth(170);
            else if (w < 1024)
                setLogoWidth(190);
            else
                setLogoWidth(240);
        }
        window.addEventListener('resize', update);
        return function () { return window.removeEventListener('resize', update); };
    }, []);
    function validate() {
        var e = {};
        if (!form.school.trim())
            e.school = 'Required';
        if (!form.contactName.trim())
            e.contactName = 'Required';
        if (!form.contactRole.trim())
            e.contactRole = 'Required';
        if (!form.phone.trim())
            e.phone = 'Required';
        else if (!/^\+?[0-9\s()-]{7,}$/.test(form.phone))
            e.phone = 'Invalid phone number';
        if (!form.email.trim())
            e.email = 'Required';
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
            e.email = 'Invalid email';
        setErrors(e);
        return Object.keys(e).length === 0;
    }
    function handleSubmit(e) {
        return __awaiter(this, void 0, void 0, function () {
            var res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        e === null || e === void 0 ? void 0 : e.preventDefault();
                        if (!validate())
                            return [2 /*return*/];
                        setIsSubmitting(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, fetch('/api/pilots/earlyintervention/submit', {
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
                            })];
                    case 2:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error('Failed to submit');
                        setSubmitted(true);
                        setShowForm(false);
                        setForm({ school: '', contactName: '', contactRole: '', phone: '', email: '' });
                        toast({ title: 'Submission received', description: 'Your request has been recorded.' });
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Error submitting early intervention request:', err_1);
                        toast({ title: 'Submission failed', description: 'Please try again later', variant: 'destructive' });
                        return [3 /*break*/, 5];
                    case 4:
                        setIsSubmitting(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    return (<div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex-shrink-0 ml-3 md:ml-0">
            <TerritorialTutoringLogoSVG width={logoWidth}/>
          </div>

          <div className="hidden md:block">
            <span className="text-2xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              RESPONSE-CONDITIONING
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button className="hidden md:inline-flex text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: "#E63946", color: "white" }} onClick={handleHeaderClick}>
              Pilot Access
            </Button>

            <Button className="md:hidden text-sm font-semibold px-3 py-2 rounded-full border-0 shadow hover:shadow-sm transition-all" style={{ backgroundColor: "#E63946", color: "white" }} onClick={handleHeaderClick} aria-label="Pilot Access">
              Pilot Access
            </Button>
          </div>
        </div>
      </header>

      <div className="h-20 sm:h-28"/>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 md:pt-20 pb-20">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "#FFF0F0" }}>
            <span className="text-sm font-medium" style={{ color: "#E63946" }}>
              Territorial Tutoring SA (Pty) Ltd
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mt-6" style={{ color: "#1A1A1A" }}>
            The Real Problem Primary Schools Are Facing
            <div className="text-base sm:text-lg font-semibold mt-2" style={{ color: "#5A5A5A" }}>
              (And Why It Shows Up Too Late)
            </div>
          </h1>
        </div>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <p>
            Primary schools do not primarily struggle with poor teaching, weak curriculum, or lack of resources.
          </p>
          <p className="mt-3">
            They struggle with something quieter - and more dangerous.
          </p>
          <p className="mt-3">
            Capable students who understand the work, but stop executing when pressure appears.
          </p>
          <p className="mt-3">
            This is not a content problem.
            It is a response problem.
          </p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">What Schools Observe (But Can’t Systematically Fix)</h2>
          <p>
            By Grades 6–7, a familiar pattern emerges:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Students answer confidently in class</li>
            <li>Performance collapses in tests</li>
            <li>Learners rush, freeze, or blank</li>
            <li>Emotional responses spike after assessments</li>
            <li>Parents report: “They knew it at home.”</li>
          </ul>

          <p className="mt-3">
            This is often labelled as:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Test anxiety</li>
            <li>Careless mistakes</li>
            <li>Need for more practice</li>
          </ul>

          <p className="mt-3">But these are symptoms, not causes.</p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">The Actual Failure Mode</h2>
          <p>
            The student’s response system is untrained.
          </p>
          <p className="mt-3">
            When:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Time pressure appears</li>
            <li>Questions are worded differently</li>
            <li>A step doesn’t look immediately familiar</li>
          </ul>

          <p className="mt-3">
            The nervous system overrides cognition.
          </p>

          <p className="mt-3">At that moment:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Recall fragments</li>
            <li>Reasoning slows or disappears</li>
            <li>Execution breaks down</li>
          </ul>

          <p className="mt-3">
            Not because the learner is weak -
            but because they were never trained to operate under uncertainty.
          </p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">Why Primary Schools Cannot Solve This Alone</h2>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>Classroom scale</strong>
              <div className="text-sm text-gray-600">One teacher cannot condition 30 individual response patterns.</div>
            </li>
            <li><strong>Curriculum pressure</strong>
              <div className="text-sm text-gray-600">Schools must move forward, not sit inside discomfort.</div>
            </li>
            <li><strong>Assessment design</strong>
              <div className="text-sm text-gray-600">Tests reveal breakdown - they do not train response to breakdown.</div>
            </li>
            <li><strong>Emotional constraints</strong>
              <div className="text-sm text-gray-600">Schools are incentivised to soothe, not deliberately stress.</div>
            </li>
          </ul>

          <p className="mt-3">So the issue is deferred. Quietly.</p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">What Happens If This Isn’t Addressed Early</h2>
          <p>
            Untrained response systems don’t disappear.
            They compound.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Avoidance patterns harden</li>
            <li>Confidence erosion becomes identity</li>
            <li>“I’m not a math person” replaces curiosity</li>
          </ul>

          <p className="mt-3">At that point, intervention is reactive - and expensive.</p>

          <p className="mt-3">Primary schools feel this intuitively.</p>

          <p className="mt-3"><em>“If only we could catch this earlier.”</em></p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">What Territorial Tutoring Actually Provides</h2>
          <p>
            Territorial Tutoring is not extra lessons.
            It is not curriculum replacement.
            It is not remedial tutoring.
          </p>

          <p className="mt-3">We provide a controlled response-conditioning program for capable students who underperform under pressure.</p>

          <p className="mt-3"><strong>In simple terms:</strong></p>
          <p>We train how students respond when certainty disappears.</p>

          <p className="mt-3">
            <a href="/aboutTT" className="text-sm font-semibold text-[#E63946] hover:underline">Learn More</a>
          </p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">What That Looks Like in Practice</h2>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Structured exposure to uncertainty</li>
            <li>Timed problem environments</li>
            <li>Controlled cognitive stress</li>
            <li>Execution under pressure</li>
            <li>Calm decision-making habits</li>
          </ul>

          <p className="mt-3">Always age-appropriate. Always psychologically safe. Never punitive.</p>

          <p className="mt-3">This is training - not testing.</p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">Why This Is Appropriate to Outsource</h2>
          <p>
            Primary schools already outsource:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Sports coaching</li>
            <li>Speech and occupational therapy</li>
            <li>Emotional support services</li>
          </ul>

          <p className="mt-3">Response-conditioning is similar in nature:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>It does not interfere with curriculum</li>
            <li>It does not alter teaching methods</li>
            <li>It does not challenge assessment authority</li>
            <li>It provides psychological infrastructure schools cannot build at scale.</li>
          </ul>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h2 className="text-lg font-bold mb-3">What Schools Gain</h2>
          <ol className="list-decimal pl-5 mt-2 space-y-2">
            <li><strong>Early Intervention Without Stigma</strong>
              <div className="text-sm text-gray-600">Students are not labelled as weak or behind. The focus is execution - not intelligence.</div>
            </li>
            <li><strong>Behavioural Change Teachers Notice</strong>
              <div className="text-sm text-gray-600">Less panic. Slower, more deliberate work. Clearer written reasoning. Improved exam posture. These changes are visible quickly.</div>
            </li>
            <li><strong>Parent Pressure Relief</strong>
              <div className="text-sm text-gray-600">Schools can confidently say: “We referred your child to a structured support program.” This reframes the conversation without defensiveness.</div>
            </li>
            <li><strong>Long-Term Outcome Protection</strong>
              <div className="text-sm text-gray-600">Students transition to high school without panic-based habits. That reflects positively on the primary school - years later.</div>
            </li>
          </ol>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h3 className="text-lg font-bold mb-3">The Core Problem Statement</h3>
          <p>
            “Many capable students fail not because they don’t understand the work, but because they haven’t been trained to respond calmly when certainty disappears.”
          </p>
          <p className="mt-3">Everything we do ladders up to this.</p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h3 className="text-lg font-bold mb-3">Pilot Structure (Low Risk, High Signal)</h3>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Small cohort referral (10–20 students)</li>
            <li>No administrative burden</li>
            <li>No curriculum disruption</li>
            <li>Observational feedback returned to the school</li>
          </ul>

          <p className="mt-3">This is not a commitment. It is a diagnostic collaboration.</p>
        </Card>

        <Card className="p-4 sm:p-6 mb-6" style={{ backgroundColor: "white" }}>
          <h3 className="text-lg font-bold mb-3">Our Position</h3>
          <p>
            We are not competing with schools.
            We are not correcting schools.
            We are not replacing schools.
          </p>

          <p className="mt-3">We exist to catch a failure mode early - before it becomes academic identity damage.</p>

          <p className="mt-3">That makes this responsible. That makes it institutional. That makes it necessary.</p>
        </Card>

        {!submitted && (<div className="text-center mt-6">
            <Button size="lg" className="px-6 py-3 rounded-full font-semibold w-full sm:w-auto" style={{ backgroundColor: "#E63946", color: "white" }} onClick={handleOpenForm}>
              Pilot Access
            </Button>
          </div>)} 

        {/* Inline form (minimal fields) */}
        {showForm && !submitted && (<div ref={formRef} className="max-w-2xl mx-auto mt-8">
            <Card className="p-4 sm:p-6" style={{ backgroundColor: "white" }}>
              <h3 className="text-lg font-bold mb-4">Request Early-Intervention Pilot Access</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">School name</label>
                  <input ref={firstInputRef} value={form.school} onChange={function (e) { return setForm(__assign(__assign({}, form), { school: e.target.value })); }} className="w-full border rounded px-3 py-2"/>
                  {errors.school && <div className="text-sm text-red-600 mt-1">{errors.school}</div>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Name & Surname of contact person</label>
                  <input value={form.contactName} onChange={function (e) { return setForm(__assign(__assign({}, form), { contactName: e.target.value })); }} className="w-full border rounded px-3 py-2"/>
                  {errors.contactName && <div className="text-sm text-red-600 mt-1">{errors.contactName}</div>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Role of contact person</label>
                  <input value={form.contactRole} onChange={function (e) { return setForm(__assign(__assign({}, form), { contactRole: e.target.value })); }} className="w-full border rounded px-3 py-2"/>
                  {errors.contactRole && <div className="text-sm text-red-600 mt-1">{errors.contactRole}</div>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Phone number</label>
                  <input value={form.phone} onChange={function (e) { return setForm(__assign(__assign({}, form), { phone: e.target.value })); }} className="w-full border rounded px-3 py-2"/>
                  {errors.phone && <div className="text-sm text-red-600 mt-1">{errors.phone}</div>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input value={form.email} onChange={function (e) { return setForm(__assign(__assign({}, form), { email: e.target.value })); }} className="w-full border rounded px-3 py-2"/>
                  {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2 rounded-full" style={{ backgroundColor: "#E63946", color: "white" }}>{isSubmitting ? 'Sending...' : 'Submit'}</Button>
                  <Button type="button" className="w-full sm:w-auto px-4 py-2 rounded-full border" onClick={function () { return setShowForm(false); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          </div>)}

        {/* Submission confirmation */}
        {submitted && (<div ref={submittedRef} className="max-w-2xl mx-auto mt-8">
            <Card className="p-4 sm:p-6" style={{ backgroundColor: "white" }}>
              <h3 className="text-lg font-bold mb-3">Submission Received</h3>

              <p>Thank you for submitting your school’s interest in the TT Early Intervention Pilot.</p>

              <p className="mt-3">Your request has been logged for internal review.</p>

              <p className="mt-3">A member of the Territorial Tutoring team will contact the designated staff representative to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Confirm suitability for the pilot</li>
                <li>Clarify the referral framework</li>
                <li>Align on term-based timing and scope</li>
              </ul>

              <p className="mt-3">This submission does not commit your school to participation.</p>

              <p className="mt-3">It initiates a consideration process.</p>

              <p className="mt-3">If approved, next steps will be outlined clearly before any activation.</p>

              <div className="mt-6 border-t pt-4 text-sm">
                <br />
                Territorial Tutoring SA<br />
                Early Response-Conditioning Infrastructure for Schools
              </div>
            </Card>
          </div>)}

      </section>

      <footer className="py-12" style={{ backgroundColor: "#FFF5ED" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <TTLogo size="md"/>
            </div>
            <p className="text-center md:text-right" style={{ color: "#5A5A5A" }}>
              © {new Date().getFullYear()} Territorial Tutoring SA (Pty) Ltd
              <br />
              <span className="text-sm">Early Response-Conditioning Infrastructure for Schools.</span>
            </p>
          </div>
        </div>
      </footer>

    </div>);
}
