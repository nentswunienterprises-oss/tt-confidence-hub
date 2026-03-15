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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TerritorialTutoringLogoSVG } from "@/components/TerritorialTutoringLogoSVG";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
export default function LeadershipDevelopmentPilot() {
    var navigate = useNavigate();
    // Form state for leadership pilot interest
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
        setShowForm(true);
        setTimeout(function () {
            var _a;
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (_a = firstInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
        }, 0);
    }
    function handleHeaderClick() {
        if (submitted) {
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
                        return [4 /*yield*/, fetch('/api/pilots/highschool/submit', {
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
                        toast({ title: 'Submission received', description: 'Your leadership pilot request has been recorded.' });
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Error submitting leadership pilot request:', err_1);
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
            <TerritorialTutoringLogoSVG width={160}/>
          </div>

          <div className="hidden md:block">
            <span className="text-2xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              RESPONSE  TRAINING
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

      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">THE PROBLEM HIGH SCHOOLS MIGHT BE INHERITING</CardTitle>
          </CardHeader>

            <CardContent className="prose prose-slate max-w-none">
              <p>High schools are receiving some learners whose academic response systems were never trained early enough.</p>
              <p>By Grade 8-10, many learners already carry:</p>
              <ul>
                <li>Panic habits during tests and assessments</li>
                <li>Freezing when problems become difficult</li>
                <li>Avoidance patterns disguised as “discipline issues”</li>
                <li>A quiet belief that school is something to survive, not master</li>
              </ul>

              <p>In many cases, the issue is not intelligence or lack of exposure to the content.</p>
              <p>The learner may have seen and understood the concept before.</p>
              <p>But when pressure appears: a timer, an unfamiliar question, a difficult step ... the response system collapses.</p>
              <p>Working memory narrows.<br/>Their confidence drops.<br/>Execution breaks down.</p>
              <p>The student is no longer accessing what they know.<br/>They are reacting to the pressure.</p>
              <p>Most academic systems focus on teaching the material.</p>
              <p>Very few systems train how students respond when the work becomes difficult.</p>

              <p>At this stage, high schools are often forced into damage control.</p>
              <p>The system moves learners forward.</p>
              <p>The response patterns move with them.</p>
              <h2>THE HARD TRUTH</h2>
              <p>By the time learners reach high school:</p>
              <ul>
                <li>The failure pattern is already active</li>
                <li>The cost of correction has multiplied</li>
                <li>Academic identity has begun to harden</li>
              </ul>
              <p>High schools are still expected to produce results within this reality.</p>
              <p>But the underlying response system was never trained.</p>
              <p>Most schools teach content.</p>
              <p>Very few systems train how students respond when the work becomes difficult.</p>
              <h2>WHAT TERRITORIAL TUTORING DOES</h2>
              <p>Territorial Tutoring focuses on the missing layer: academic response training.</p>
              <p>When a learner encounters a difficult math problem, one of two things usually happens.</p>
              <p>They panic, freeze, and guess.</p>
              <p>Or they stay calm, think clearly, execute and continue without emotional negotiation.</p>
              <p>That difference is not intelligence.</p>
              <p>It is training.</p>
              <p>Territorial Tutoring trains learners to:</p>
              <ul>
                <li>remain composed under pressure</li>
                <li>think clearly during difficulty</li>
                <li>execute step-by-step instead of guessing.</li>
              </ul>
              <h2>WHY OUR MODEL WORKS</h2>
              <p>This training works because of three structural advantages.</p>
              <h3>1-on-1 Online Mentorship</h3>
              <p>Traditional classrooms must divide attention across 25-30 learners.</p>
              <p>Our model allows focused one-on-one sessions where a student's response patterns can actually be observed and corrected.</p>
              <h3>Understanding + Execution</h3>
              <p>Many systems focus only on explaining concepts.</p>
              <p>We train both:</p>
              <ul>
                <li>Understanding the math</li>
                <li>Executing the math under pressure</li>
              </ul>
              <p>Students learn the work, and how to perform it when it matters.</p>
              <h3>Structured Response Conditioning</h3>
              <p>Sessions are designed to train calm, disciplined execution when problems become difficult.</p>
              <p>Over time, panic responses are replaced with controlled problem-solving behaviour.</p>
              <p>This is the foundation of our system.</p>
              <h2>FROM RESPONSE TRAINING TO LEADERSHIP DEVELOPMENT</h2>
              <p>Because Territorial Tutoring operates at this level of academic training, we are able to run a structured external academic leadership programme with high schools.</p>
              <p>The programme allows selected students to develop rare leadership capability through:</p>
              <ul>
                <li>response-control training</li>
                <li>teaching clarity</li>
                <li>composure under pressure</li>
                <li>mentorship responsibility</li>
              </ul>
              <p>This is not theoretical leadership.</p>
              <p>Students practice leadership through real academic mentorship.</p>
              <h2>SELECTION, NOT RECRUITMENT</h2>
              <p>This programme does not recruit students.</p>
              <p>Schools nominate learners who already demonstrate discipline, composure, and academic potential.</p>
              <p>Selection is limited.</p>
              <p>Participation is voluntary and merit-based.</p>
              <p>Students are not selected because they need help.</p>
              <p>They are selected because they are trusted to carry responsibility.</p>
              <p>The programme exists to refine leadership capability that is already visible.</p>
              <h2>HOW THE COLLABORATION WORKS</h2>
              <h3>High Schools Nominate Their Students</h3>
              <p>Schools identify a small number of learners who demonstrate maturity, discipline, and strong academic potential.</p>
              <p>Selection itself becomes a mark of distinction.</p>
              <h3>Territorial Tutoring Trains Them</h3>
              <p>Selected students undergo structured training in:</p>
              <ul>
                <li>calm execution under pressure</li>
                <li>teaching clarity and communication</li>
                <li>response control during uncertainty</li>
                <li>psychological composure in academic settings</li>
              </ul>
              <p>These are rare academic leadership skills.</p>
              <h3>Students Apply These Skills Through Mentorship</h3>
              <p>Under TT supervision, trained students guide younger learners through structured math sessions focused on disciplined problem-solving and calm execution.</p>
              <p>The process strengthens both the mentor and the learner.</p>
              <h2>WHY THIS BENEFITS HIGH SCHOOLS DIRECTLY</h2>
              <h3>Real Leadership Development</h3>
              <p>Students do not simulate leadership.</p>
              <p>They practice it through structured responsibility and mentorship.</p>
              <h3>Stronger Academic Identity</h3>
              <p>Students selected into the programme develop composure, clarity, and execution discipline that strengthens their own academic performance.</p>
              <h3>Institutional Distinction</h3>
              <p>Schools can truthfully say:</p>
              <p>“Our students are selected and trained to serve as academic leadership mentors.”</p>
              <h3>Positive Academic Culture</h3>
              <p>High-performing students are given a meaningful channel for contribution, responsibility, and structured leadership.</p>
              <p>Some students naturally enjoy teaching and mentoring.</p>
              <p>This programme provides a structured environment for that ability to develop responsibly.</p>
              <h2>WHY THIS MATTERS FOR SOUTH AFRICA</h2>
              <p>South Africa does not only need more graduates.</p>
              <p>It needs graduates who can:</p>
              <ul>
                <li>think clearly under pressure</li>
                <li>execute without panic</li>
                <li>carry responsibility early</li>
                <li>lead without ego</li>
              </ul>
              <p>Academic leadership is one place that training can begin.</p>
              <h2>WHO THIS IS FOR</h2>
              <ul>
                <li>Principals</li>
                <li>Deputy Principals</li>
                <li>Academic Heads</li>
                <li>Heads of Mathematics</li>
                <li>Learner Leadership Coordinators</li>
              </ul>
              <p>Schools that take long-term academic development seriously.</p>
              <h2>THE STRUCTURE OF THE PROGRAMME</h2>
              <p>The programme is intentionally designed to operate in partnership with multiple high schools while remaining centrally governed by Territorial Tutoring.</p>
              <p>Each participating school nominates a small group of selected students.</p>
              <p>Those students are trained through TT's structured response-conditioning system and operate under clear mentorship guidelines.</p>
              <p>This allows leadership development to happen within schools, while the training system, standards, and operational oversight remain consistent and externally managed.</p>
              <p>The result is a leadership programme that is:</p>
              <ul>
                <li>structured</li>
                <li>selective</li>
                <li>scalable</li>
                <li>and academically responsible.</li>
              </ul>
              <h2>THE PILOT MODEL</h2>
              <ul>
                <li>Limited intake<br/>(12 selected students)</li>
                <li>Term-based pilot</li>
                <li>Clear governance and scope</li>
                <li>No curriculum interference</li>
                <li>Full operational oversight by Territorial Tutoring</li>
                <li>Zero administrative burden for the school</li>
              </ul>
              <h3>Evaluation Period</h3>
              <p>The pilot allows both Territorial Tutoring and the school to observe how the programme operates in practice.</p>
              <p>At the end of the term, outcomes and operational experiences are reviewed.</p>
              <p>Schools may then choose to continue nominating students annually, expand participation, or conclude the partnership.</p>
              <p>The pilot ensures the programme remains disciplined, structured, and beneficial to all participants.</p>
              <div className="text-center mt-6">
                <Button
                  size="lg"
                  className="px-4 py-3 rounded-full font-semibold w-full sm:w-auto block mx-auto whitespace-normal text-base sm:text-lg"
                  style={{ backgroundColor: "#E63946", color: "white", minWidth: 0, wordBreak: 'break-word' }}
                  onClick={function () { return setShowForm(true); }}
                >
                  Initiate High School Leadership<br className="block sm:hidden" />Pilot Consideration
                </Button>
                <p className="text-xs text-gray-600 mt-2">This submission registers interest only. No obligation. No activation without alignment.</p>
              </div>
              {/* Inline form for Leadership Pilot */}
              {showForm && !submitted && (<div ref={formRef} className="max-w-2xl mx-auto mt-6">
                  <Card className="p-4 sm:p-6" style={{ backgroundColor: "white" }}>
                    <h3 className="text-lg font-bold mb-4">Request Leadership Pilot Access</h3>
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
              {submitted && (<div className="max-w-2xl mx-auto mt-6">
                  <Card className="p-4 sm:p-6" style={{ backgroundColor: "white" }}>
                    <h3 className="text-lg font-bold mb-3">Submission Received</h3>
                    <p>Thank you for submitting your school's interest in the TT Leadership Development Pilot.</p>
                    <p className="mt-3">Your request has been logged for internal review.</p>
                    <p className="mt-3">A member of the Territorial Tutoring team will contact the designated staff representative to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                      <li>Confirm suitability for the pilot</li>
                      <li>Clarify selection and training framework</li>
                      <li>Align on term-based timing and scope</li>
                      <li>Discuss how this could align with your school's leadership and academic objectives</li>
                    </ul>
                    <p className="mt-3">This submission does not commit your school to participation. It initiates a consideration process.</p>
                    <div className="mt-6 border-t pt-4 text-sm">
                      <br />
                      Territorial Tutoring SA<br />
                      Academic Leadership &amp; Response-Conditioning for Schools
                    </div>
                  </Card>
                </div>)}
            </CardContent>
        </Card>
      </section>
    </div>);
}
