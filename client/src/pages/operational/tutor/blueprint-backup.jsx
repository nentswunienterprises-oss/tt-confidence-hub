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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Lightbulb, Users, Target, BookOpen, Clock, Award, CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
export default function TutorBlueprint() {
    var _a = useState(1), activeModule = _a[0], setActiveModule = _a[1];
    var _b = useState({}), expandedSections = _b[0], setExpandedSections = _b[1];
    var _c = useState([]), completedModules = _c[0], setCompletedModules = _c[1];
    var toggleSection = function (sectionId) {
        setExpandedSections(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[sectionId] = !prev[sectionId], _a)));
        });
    };
    var markModuleComplete = function (moduleId) {
        if (!completedModules.includes(moduleId)) {
            setCompletedModules(__spreadArray(__spreadArray([], completedModules, true), [moduleId], false));
        }
    };
    var progressPercent = (completedModules.length / 7) * 100;
    return (<div className="space-y-8 pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10"/>
            <h1 className="text-4xl font-bold">Your Transformation Formula</h1>
          </div>
          <p className="text-lg opacity-95 max-w-2xl mb-6">
            Master the 7 modules that transform tutors into confidence-building leaders. 
            Each module builds on the last—creating an unstoppable teaching system.
          </p>
          
          {/* Progress Bar */}
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Your Progress</span>
              <span className="text-sm font-bold">{completedModules.length}/7 Complete</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-white/20"/>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { id: 1, title: "3-Layer Lens", icon: Brain },
            { id: 2, title: "Tutoring Psychology", icon: Lightbulb },
            { id: 3, title: "Intro Session", icon: Users },
            { id: 4, title: "First Session", icon: Target },
            { id: 5, title: "Execution Process", icon: BookOpen },
            { id: 6, title: "Balance Systems", icon: Clock },
            { id: 7, title: "Time Mastery", icon: Award },
        ].map(function (module) {
            var Icon = module.icon;
            var isComplete = completedModules.includes(module.id);
            var isActive = activeModule === module.id;
            return (<Card key={module.id} className={"cursor-pointer transition-all duration-300 ".concat(isActive ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md hover:border-primary/30', " ").concat(isComplete ? 'bg-accent border-primary/20' : '')} onClick={function () { return setActiveModule(module.id); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5"/>
                  </div>
                  {isComplete && <CheckCircle2 className="w-5 h-5 text-primary"/>}
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Module {module.id}</p>
                <p className="text-sm font-bold mt-1">{module.title}</p>
              </CardContent>
            </Card>);
        })}
      </div>

      {/* Module Content */}
      <div className="space-y-6">
        {activeModule === 1 && (<ModuleOne expandedSections={expandedSections} toggleSection={toggleSection} onComplete={function () { return markModuleComplete(1); }} isComplete={completedModules.includes(1)}/>)}
        {activeModule === 2 && (<ModuleTwo expandedSections={expandedSections} toggleSection={toggleSection} onComplete={function () { return markModuleComplete(2); }} isComplete={completedModules.includes(2)}/>)}
        {activeModule === 3 && (<ModuleThree expandedSections={expandedSections} toggleSection={toggleSection} onComplete={function () { return markModuleComplete(3); }} isComplete={completedModules.includes(3)}/>)}
        {activeModule === 4 && (<ModuleFour expandedSections={expandedSections} toggleSection={toggleSection} onComplete={function () { return markModuleComplete(4); }} isComplete={completedModules.includes(4)}/>)}
        {activeModule === 5 && (<ModuleFive expandedSections={expandedSections} toggleSection={toggleSection} onComplete={function () { return markModuleComplete(5); }} isComplete={completedModules.includes(5)}/>)}
        {activeModule === 6 && (<ModuleSix expandedSections={expandedSections} toggleSection={toggleSection} onComplete={function () { return markModuleComplete(6); }} isComplete={completedModules.includes(6)}/>)}
        {activeModule === 7 && (<ModuleSeven expandedSections={expandedSections} toggleSection={toggleSection} onComplete={function () { return markModuleComplete(7); }} isComplete={completedModules.includes(7)}/>)}
      </div>
    </div>);
}
// Reusable Components
function SectionCard(_a) {
    var id = _a.id, title = _a.title, children = _a.children, expanded = _a.expanded, onToggle = _a.onToggle, _b = _a.gradient, gradient = _b === void 0 ? "from-purple-500 to-pink-500" : _b;
    return (<Card className="overflow-hidden">
      <CardHeader className={"cursor-pointer bg-gradient-to-r ".concat(gradient, " text-white")} onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {expanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
        </div>
      </CardHeader>
      {expanded && <CardContent className="pt-6">{children}</CardContent>}
    </Card>);
}
function ModuleOne(_a) {
    var expandedSections = _a.expandedSections, toggleSection = _a.toggleSection, onComplete = _a.onComplete, isComplete = _a.isComplete;
    return (<div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8"/>
            <div>
              <CardTitle className="text-2xl">Module 1: The 3-Layer Lens Teaching Model</CardTitle>
              <CardDescription className="text-white/95 text-lg mt-2">
                "Model. Apply. Guide." — The student doesn't just learn the skill, they own it.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-accent p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              What Is the 3-Layer Lens?
            </h3>
            <p className="text-muted-foreground mb-4">
              It's the internal structure of every math concept. Every problem a student sees can be broken down into 3 key learning layers:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-card p-4 rounded-lg border-2 border-primary/40">
                <h4 className="font-bold text-lg mb-2">Vocabulary</h4>
                <p className="text-sm text-muted-foreground mb-3">What is it called? What are the terms?</p>
                <Badge variant="outline" className="text-xs">"Do I understand what I'm working with?"</Badge>
              </div>
              
              <div className="bg-card p-4 rounded-lg border-2 border-primary/40">
                <h4 className="font-bold text-lg mb-2">Method</h4>
                <p className="text-sm text-muted-foreground mb-3">What are the steps? How do I solve it?</p>
                <Badge variant="outline" className="text-xs">"Am I following a reliable, structured path?"</Badge>
              </div>
              
              <div className="bg-card p-4 rounded-lg border-2 border-primary/40">
                <h4 className="font-bold text-lg mb-2">Reason</h4>
                <p className="text-sm text-muted-foreground mb-3">Why do those steps work? What's the logic?</p>
                <Badge variant="outline" className="text-xs">"Can I explain the why behind what I did?"</Badge>
              </div>
            </div>
            
            <p className="mt-6 text-center font-semibold text-lg">
              The 3-Layer Lens is how TT tutors teach, test, and diagnose mastery.
            </p>
          </div>

          <SectionCard id="module1-flow" title="How the 3-Layer Lens Powers a Session" expanded={expandedSections["module1-flow"] || false} onToggle={function () { return toggleSection("module1-flow"); }} gradient="from-primary to-primary/80">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Step 1: MODEL — "Get them READY."</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• The tutor solves a full problem out loud</li>
                    <li>• Uses all 3 layers - calls out terms, follows steps, explains logic</li>
                    <li>• Student watches and listens</li>
                    <li className="italic font-semibold">"This is what it looks like when it's done right."</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/80 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Step 2: APPLY — "Let them FIRE."</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Student does a similar problem right after</li>
                    <li>• Tutor supports - but doesn't lead</li>
                    <li>• Let them struggle strategically</li>
                    <li className="italic font-semibold">"They don't attempt the skill - they experience it."</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/60 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Step 3: GUIDE — "Now we AIM."</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• The tutor corrects, refines, and clarifies</li>
                    <li>• Points out which layer needs reinforcement</li>
                    <li className="italic">"You knew the terms (Vocab), and you remembered the steps (Method), but you didn't explain why we flipped the fraction (Reason). Let's fix that."</li>
                    <li className="italic font-semibold">"They start to see how they learn, not just what they learned."</li>
                  </ul>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module1-boss" title="Boss Battles & The 3-Layer Lens" expanded={expandedSections["module1-boss"] || false} onToggle={function () { return toggleSection("module1-boss"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <p className="font-semibold">A Boss Battle challenges the student to use all 3 layers:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Can they recognize and define the terms?</li>
                <li>• Can they follow a clear step-by-step method on their own?</li>
                <li>• Can they explain why each move was legit?</li>
              </ul>
              
              <div className="bg-accent p-4 rounded-lg mt-4 border border-primary/10">
                <p className="font-bold mb-2">The Boss Battle is the field. The 3-Layer Lens is the weapon.</p>
              </div>

              <div className="mt-6">
                <h4 className="font-bold mb-3">If They Struggle in a Boss Battle:</h4>
                <div className="bg-card p-4 rounded-lg border border-primary/20">
                  <p className="font-semibold mb-3">Use the Lens as a Diagnostic Tool:</p>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Question</th>
                        <th className="text-left p-2">Which Layer is Broken?</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">"What does this word mean?"</td>
                        <td className="p-2"><Badge className="bg-primary">Vocabulary</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">"What's your first step?"</td>
                        <td className="p-2"><Badge className="bg-primary">Method</Badge></td>
                      </tr>
                      <tr>
                        <td className="p-2">"Why does that step work?"</td>
                        <td className="p-2"><Badge className="bg-primary">Reason</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-4 font-semibold">Then:</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>→ Re-teach and reinforce that specific layer</li>
                    <li>→ Assign a rematch Boss Battle in the next session</li>
                  </ul>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-xl mb-4">Why This Is Bulletproof</h4>
            <ul className="space-y-2">
              <li>• Visual & model-based teaching = stronger memory retention</li>
              <li>• Repetition of method + explanation = real confidence</li>
              <li>• Failsafe system for catching errors and learning from them</li>
              <li>• Clear, structured loop keeps sessions focused, efficient, and powerful</li>
            </ul>
            <p className="mt-6 text-lg font-bold italic border-t border-white/20 pt-4">
              "Practice makes perfect" is a lie.<br />
              We believe: Practice makes improvement.
            </p>
          </div>

          {!isComplete && (<Button onClick={onComplete} className="w-full" size="lg">
              Mark Module 1 Complete <CheckCircle2 className="ml-2 w-5 h-5"/>
            </Button>)}
          {isComplete && (<div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5"/>
              Module Completed
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
function ModuleTwo(_a) {
    var expandedSections = _a.expandedSections, toggleSection = _a.toggleSection, onComplete = _a.onComplete, isComplete = _a.isComplete;
    return (<div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8"/>
            <div>
              <CardTitle className="text-2xl">Module 2: TT's Tutoring Psychology</CardTitle>
              <CardDescription className="text-white/95 text-lg mt-2">
                "We're not homework helpers. We're healers, guides, and system-builders."
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <SectionCard id="module2-doctor" title="1. The Tutor is a Doctor" expanded={expandedSections["module2-doctor"] || false} onToggle={function () { return toggleSection("module2-doctor"); }} gradient="from-primary to-primary/80">
            <div className="space-y-4">
              <p className="font-semibold">A student isn't a project. They're a patient.</p>
              <p>They walk in with:</p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Hidden pains (topics that never made sense)</li>
                <li>• Emotional injuries (shame, fear, anxiety)</li>
                <li>• Symptoms (giving up, blanking out, rushing, avoiding questions)</li>
              </ul>
              
              <div className="bg-accent p-4 rounded-lg mt-4 border border-primary/10">
                <p className="font-bold mb-2">The TT Tutor's job:</p>
                <ul className="space-y-1">
                  <li>✓ Diagnose the pain</li>
                  <li>✓ Prescribe the system</li>
                  <li>✓ Treat consistently with structure and strategy</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module2-prescription" title="2. Our Prescription = The 3-Layer Lens" expanded={expandedSections["module2-prescription"] || false} onToggle={function () { return toggleSection("module2-prescription"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <p className="font-semibold">We don't throw answers. We give students the mental tools to understand, fix, and solve.</p>
              
              <table className="w-full border mt-4">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Layer</th>
                    <th className="p-3 text-left">What We Train</th>
                    <th className="p-3 text-left">Why It Heals</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3"><Badge className="bg-primary">Vocabulary</Badge></td>
                    <td className="p-3">The terms</td>
                    <td className="p-3">Builds clarity, reduces confusion</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><Badge className="bg-primary">Method</Badge></td>
                    <td className="p-3">The steps</td>
                    <td className="p-3">Gives security, lowers panic</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><Badge className="bg-primary">Reason</Badge></td>
                    <td className="p-3">The logic</td>
                    <td className="p-3">Builds mastery, ends memorization struggles</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-accent p-4 rounded-lg mt-4 border border-primary/10">
                <p className="font-bold text-center">This system works whether the tutor is a genius or not.</p>
                <p className="text-center mt-2">The tutor doesn't need to feel confident - they need to trust the process.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module2-vibe" title="3. The Vibe = Coach, Doctor, Mentor" expanded={expandedSections["module2-vibe"] || false} onToggle={function () { return toggleSection("module2-vibe"); }} gradient="from-primary to-primary/70">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <h4 className="font-bold mb-3 text-primary">We are...</h4>
                <ul className="space-y-2">
                  <li>✓ A mentor</li>
                  <li>✓ A strategist</li>
                  <li>✓ A coach</li>
                  <li>✓ A partner</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="font-bold mb-3 text-destructive">We are not...</h4>
                <ul className="space-y-2">
                  <li>✗ A lecturer</li>
                  <li>✗ A solver</li>
                  <li>✗ A performer</li>
                  <li>✗ A parent</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-card border-l-4 border-primary">
              <p>We don't force understanding - we train it through process.</p>
              <p className="mt-2">We don't teach for correctness - we teach for effectiveness.</p>
            </div>
          </SectionCard>

          <SectionCard id="module2-system" title="💬 4. The Student's Job = Follow the System, Not Their Feelings" expanded={expandedSections["module2-system"] || false} onToggle={function () { return toggleSection("module2-system"); }} gradient="from-primary/90 to-primary/70">
            <div className="space-y-4">
              <p>Students come in with fear, frustration, self-doubt. That's normal. That's human.</p>
              <p className="font-semibold">But our response is not "try harder." It's "use the system."</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">Because systems:</p>
                <ul className="space-y-2">
                  <li>✓ Don't get tired</li>
                  <li>✓ Don't panic</li>
                  <li>✓ Don't give up when the concept looks scary</li>
                  <li>✓ Break things down into steps, and steps make anything learnable</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module2-process" title="🔁 5. The TT Teaching Process = Ready, Fire, Aim" expanded={expandedSections["module2-process"] || false} onToggle={function () { return toggleSection("module2-process"); }} gradient="from-primary to-primary/80">
            <table className="w-full border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Phase</th>
                  <th className="p-3 text-left">Tutor Does</th>
                  <th className="p-3 text-left">Student Does</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-bold">Ready</td>
                  <td className="p-3">Model a problem using 3-Layer Lens</td>
                  <td className="p-3">Watch, listen</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-bold">Fire</td>
                  <td className="p-3">Makes student attempt a similar problem</td>
                  <td className="p-3">Engage, apply, make mistakes</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-bold">Aim</td>
                  <td className="p-3">Tutor gives feedback using the lens</td>
                  <td className="p-3">Reflect, correct, grow</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 text-center font-semibold">This loop builds understanding - not just accuracy.</p>
          </SectionCard>

          <SectionCard id="module2-learn" title="6. Even the Tutor Can Learn While Tutoring" expanded={expandedSections["module2-learn"] || false} onToggle={function () { return toggleSection("module2-learn"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <p className="font-semibold">We are not afraid of what we don't know.</p>
              <p>If the concept is unfamiliar:</p>
              <ol className="space-y-3 ml-4">
                <li>1. Use a tool like ChatGPT to learn it fast (not during a session, before)</li>
                <li>2. Break it down using the 3-Layer Lens</li>
                <li>3. Re-teach it to the student in a simpler, cleaner way</li>
                <li>4. Empower them using the 3-Layer Lens system</li>
              </ol>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold text-center italic">
                  "If I can learn it through the system, I can teach it through the system."
                </p>
                <p className="text-center mt-2">That's how every TT tutor stays coachable, adaptable, and sharp.</p>
              </div>
            </div>
          </SectionCard>

          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-xl mb-4">Final Principle:</h4>
            <p className="text-lg mb-4">Our goal isn't to make students smart.<br />Our goal is to make them strategic.</p>
            <p>They don't leave our sessions just knowing answers.</p>
            <p className="font-bold mt-2">They leave knowing how to find answers, fix mistakes, and trust their minds again.</p>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <h4 className="font-bold mb-3">TT Tutor Code:</h4>
              <ul className="space-y-2">
                <li>"I don't give knowledge. I build understanding."</li>
                <li>"I don't need to be perfect. I need to rely on systems."</li>
                <li>"I don't push feelings. I train thinking."</li>
                <li>"I don't fear confusion. I break it into layers."</li>
              </ul>
            </div>
          </div>

          {!isComplete && (<Button onClick={onComplete} className="w-full" size="lg">
              Mark Module 2 Complete <CheckCircle2 className="ml-2 w-5 h-5"/>
            </Button>)}
          {isComplete && (<div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5"/>
              Module Completed
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
// Placeholder components for remaining modules
function ModuleThree(_a) {
    var expandedSections = _a.expandedSections, toggleSection = _a.toggleSection, onComplete = _a.onComplete, isComplete = _a.isComplete;
    return (<div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8"/>
            <div>
              <CardTitle className="text-2xl">Module 3: The Real TT Intro Session Blueprint</CardTitle>
              <CardDescription className="text-white/95 text-lg mt-2">
                4-part flow to connect, surface pains, diagnose, and anchor
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-accent p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-bold mb-4">🔁 4-Part Flow (Know the Person)</h3>
            <p className="text-muted-foreground mb-4">
              Start with the heart. Let the student feel heard and human.
            </p>
          </div>

          <SectionCard id="module3-connect" title='🟣 1. Connect – "Who Are You?" (25-45 min)' expanded={expandedSections["module3-connect"] || false} onToggle={function () { return toggleSection("module3-connect"); }} gradient="from-primary to-primary/80">
            <div className="space-y-4">
              <p className="font-semibold">Key Prompts:</p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• "What's something in life or school you're proud of this year?"</li>
                <li>• "What's your dream life or job?"</li>
                <li>• "What subject just gets you… and which one drains you?"</li>
                <li>• "If school was a playlist, what's your skip button?"</li>
              </ul>
              
              <div className="bg-accent p-4 rounded-lg mt-4 border border-primary/10">
                <p className="font-bold mb-2">What You're Doing:</p>
                <ul className="space-y-1">
                  <li>• Finding emotional drivers</li>
                  <li>• Spotting hidden confidence issues</li>
                  <li>• Beginning to build trust and rapport</li>
                  <li>• Logging student identity cues</li>
                </ul>
              </div>

              <div className="mt-4">
                <p className="font-bold mb-2">KPI:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Student shares personal insights</li>
                  <li>• Student feels relaxed, safe and seen by end of segment</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module3-surface" title="2. Surface the Pains – What Feels Off? (5–7 min)" expanded={expandedSections["module3-surface"] || false} onToggle={function () { return toggleSection("module3-surface"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <p>Now it's time to address math! Before showing them problems, ask what never made sense.</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">Questions (Human-Diagnostic Style):</p>
                <ul className="space-y-2">
                  <li>• "Which topics in math have always felt confusing, no matter how many times they explained it?"</li>
                  <li>• "Are there moments in math where you just freeze or feel lost?"</li>
                  <li>• "Which topics do you secretly wish made more sense?"</li>
                </ul>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-primary mt-4">
                <p className="font-bold mb-2">💬 Power Line:</p>
                <p className="italic">"If you woke up and forgot all of math, I'd still be excited to walk you through it. I don't care what you get wrong – I care about what we build together."</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module3-diagnose" title="3. Diagnose – Why Is This Happening? (10–15 min)" expanded={expandedSections["module3-diagnose"] || false} onToggle={function () { return toggleSection("module3-diagnose"); }} gradient="from-primary to-primary/70">
            <div className="space-y-4">
              <p className="font-semibold">Now that you know the symptoms, you're here to diagnose the root.</p>
              
              <div className="space-y-3">
                <p className="font-bold">How:</p>
                <ul className="space-y-2 ml-4">
                  <li>1. Give 1-2 quick problems based on their pain points</li>
                  <li>2. Watch and listen - don't interrupt</li>
                </ul>
              </div>

              <table className="w-full border mt-4">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Layer</th>
                    <th className="p-3 text-left">What to Look For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3"><Badge className="bg-primary">Vocabulary</Badge></td>
                    <td className="p-3">They don't understand the terms</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><Badge className="bg-primary">Method</Badge></td>
                    <td className="p-3">They try random steps or skip around</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><Badge className="bg-primary">Reason</Badge></td>
                    <td className="p-3">They memorize but don't know why it works</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-card p-4 rounded-lg border-l-4 border-primary mt-4">
                <p className="font-bold mb-2">💬 Power Lines:</p>
                <p className="italic">"This isn't a mistake. It's a clue."</p>
                <p className="italic mt-2">"If we fix the right layer, the whole thing starts making sense."</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module3-anchor" title="🟢 4. Anchor – What's the Plan? (5-7 min)" expanded={expandedSections["module3-anchor"] || false} onToggle={function () { return toggleSection("module3-anchor"); }} gradient="from-primary/90 to-primary/80">
            <div className="space-y-4">
              <p className="font-semibold">Reconnect them to hope, strategy, and structure.</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">What to Do:</p>
                <ul className="space-y-2">
                  <li>✓ Reflect their strengths: "You think visually. You explain well."</li>
                  <li>✓ Share your insight: "Your confidence breaks when the vocabulary isn't clear"</li>
                  <li>✓ Introduce TT's tools: Solutions Unlocked, Boss Battle Log</li>
                </ul>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-primary mt-4">
                <p className="font-bold mb-2">💬 Power Line:</p>
                <p className="italic">"We don't tutor. We train minds. And this? This is just your journey's beginning."</p>
              </div>

              <div className="mt-4 bg-muted p-4 rounded-lg">
                <p className="font-bold mb-2">✍ Deliverables After Session:</p>
                <ul className="space-y-1">
                  <li>✓ Log Student Identity Sheet</li>
                  <li>✓ Send Proposal within 24 hours</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-xl mb-4">✅ Session Success Criteria</h4>
            <ul className="space-y-2">
              <li>✅ Student feels heard, safe, and understood</li>
              <li>✅ Pain points identified using 3-Layer Lens diagnostic</li>
              <li>✅ Student leaves with clarity on next steps</li>
              <li>✅ Identity Sheet logged and Proposal sent within 24hrs</li>
            </ul>
          </div>

          {!isComplete && (<Button onClick={onComplete} className="w-full" size="lg">
              Mark Module 3 Complete <CheckCircle2 className="ml-2 w-5 h-5"/>
            </Button>)}
          {isComplete && (<div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5"/>
              Module Completed
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
function ModuleFour(_a) {
    var expandedSections = _a.expandedSections, toggleSection = _a.toggleSection, onComplete = _a.onComplete, isComplete = _a.isComplete;
    return (<div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8"/>
            <div>
              <CardTitle className="text-2xl">Module 4: The First Session Blueprint</CardTitle>
              <CardDescription className="text-white/95 text-lg mt-2">
                "The Launchpad" - Set the tone, system, and student up to win from day one
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-accent p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-bold mb-4">🧩 Session Goal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Translate the intro session into a trackable action plan</li>
              <li>• Set up the student's TT Identity</li>
              <li>• Make the student feel seen, smart, and safe</li>
              <li>• Begin light practice that's strategic, not stressful</li>
            </ul>
          </div>

          <SectionCard id="module4-prep" title="✅ Pre-Session Tutor Responsibilities" expanded={expandedSections["module4-prep"] || false} onToggle={function () { return toggleSection("module4-prep"); }} gradient="from-primary to-primary/80">
            <div className="space-y-4">
              <p className="font-bold">Know Before You Go:</p>
              <ul className="space-y-2 ml-4">
                <li>✓ Review Student Identity Sheet from intro session</li>
                <li>✓ Have teaching material ready</li>
                <li>✓ Mentally review "growth mindset" opening (not perfection mindset)</li>
                <li>✓ Student trackers ready</li>
              </ul>
            </div>
          </SectionCard>

          <SectionCard id="module4-welcome" title="1. Welcome & Reconnect" expanded={expandedSections["module4-welcome"] || false} onToggle={function () { return toggleSection("module4-welcome"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <ul className="space-y-2 ml-4">
                <li>• Welcome student + smile check 😊</li>
                <li>• Introduce yourself again briefly</li>
                <li>• Confirm emotional safety: "This is your space. Growth over perfection."</li>
              </ul>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold">KPI:</p>
                <p>Student shows visible comfort (smiling, open body language) within 5 minutes</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module4-microwin" title="2. Skill Preview & Micro-Win Practice (15-20 min)" expanded={expandedSections["module4-microwin"] || false} onToggle={function () { return toggleSection("module4-microwin"); }} gradient="from-primary to-primary/70">
            <div className="space-y-4">
              <p className="font-semibold">Pick a light version of their weakest concept</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">Follow the TT teaching model:</p>
                <ol className="space-y-2 ml-4">
                  <li>1. <strong>Model</strong> the process</li>
                  <li>2. Let them <strong>Apply</strong> the method</li>
                  <li>3. <strong>Guide</strong> and correct gently</li>
                  <li>4. Reinforce with a win</li>
                </ol>
              </div>

              <p className="italic text-sm">Win = Momentum. You're not trying to teach a full concept—you're showing them that they can.</p>
            </div>
          </SectionCard>

          <SectionCard id="module4-boss" title="3. Assign First Boss Battle (5 min)" expanded={expandedSections["module4-boss"] || false} onToggle={function () { return toggleSection("module4-boss"); }} gradient="from-primary/90 to-primary/80">
            <div className="space-y-4">
              <p>Test the waters with a few more examples, then start the first log.</p>
              
              <div className="bg-card p-4 rounded-lg border-l-4 border-primary">
                <p className="font-bold mb-2">Explain:</p>
                <p className="italic">"Here and there, you get a Boss Battle. It's just one challenge to show what you've learned."</p>
              </div>

              <div className="bg-accent p-4 rounded-lg border border-primary/10 mt-4">
                <p className="font-bold mb-2">Celebrate either way:</p>
                <ul className="space-y-1">
                  <li>✓ "Great job getting it done. You now understand how to use the 3 layers"</li>
                  <li>✓ "Next week, we'll beat this. Easy."</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module4-close" title="4. Confirm Next Step & Reaffirm Confidence" expanded={expandedSections["module4-close"] || false} onToggle={function () { return toggleSection("module4-close"); }} gradient="from-primary to-primary/80">
            <div className="space-y-4">
              <p>Let them know what they'll focus on next session</p>
              
              <div className="bg-card p-4 rounded-lg border-l-4 border-primary">
                <p className="italic">"Today we got your profile set up, explored your strengths, and started cracking the code on __. You're officially on the TT journey. You're gonna be a great problem-solver"</p>
              </div>
            </div>
          </SectionCard>

          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-xl mb-4">📂 First Session Deliverables</h4>
            <ul className="space-y-2">
              <li>✅ Session Logged</li>
              <li>✅ TT Learning ID chosen</li>
              <li>✅ First skill logged</li>
              <li>✅ First Boss Battle recorded (optional)</li>
              <li>✅ Student feels clear, supported, and hyped</li>
            </ul>
          </div>

          {!isComplete && (<Button onClick={onComplete} className="w-full" size="lg">
              Mark Module 4 Complete <CheckCircle2 className="ml-2 w-5 h-5"/>
            </Button>)}
          {isComplete && (<div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5"/>
              Module Completed
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
function ModuleFive(_a) {
    var expandedSections = _a.expandedSections, toggleSection = _a.toggleSection, onComplete = _a.onComplete, isComplete = _a.isComplete;
    return (<div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8"/>
            <div>
              <CardTitle className="text-2xl">Module 5: Standardized Tutoring Execution Process</CardTitle>
              <CardDescription className="text-white/95 text-lg mt-2">
                The ongoing flow that ensures consistent, high-impact sessions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <SectionCard id="module5-prepare" title='1. Prepare – "Know Before You Go"' expanded={expandedSections["module5-prepare"] || false} onToggle={function () { return toggleSection("module5-prepare"); }} gradient="from-primary to-primary/80">
            <div className="space-y-4">
              <p className="font-semibold">Enter every session fully equipped. No guesswork. No improvising.</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">✅ Pre-Session Checklist:</p>
                <ol className="space-y-2 ml-4">
                  <li>1. <strong>Review Past Data</strong> - Check last Boss Battles and Learning Notes</li>
                  <li>2. <strong>Identify Session Objective</strong> - "Today's mission: __"</li>
                  <li>3. <strong>Prepare Teaching Tools</strong> - Example problems, backup problems</li>
                  <li>4. <strong>Mentally Rehearse</strong> - Break into 3-5 micro-steps</li>
                  <li>5. <strong>Plan a Warm Opening</strong> - Start with confidence</li>
                </ol>
              </div>

              <p className="text-sm italic">A well-prepared tutor inspires trust, delivers more value, and uses time efficiently.</p>
            </div>
          </SectionCard>

          <SectionCard id="module5-teach" title="2. Model, Apply & Guide – Show, Don't Just Tell" expanded={expandedSections["module5-teach"] || false} onToggle={function () { return toggleSection("module5-teach"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">The "Model-Apply-Guide" Loop:</p>
                <ol className="space-y-2 ml-4">
                  <li><strong>Step 1 - Model it:</strong> You solve an example out loud (get them "Ready")</li>
                  <li><strong>Step 2 - Make student Apply:</strong> They try similar problem (let them "Fire")</li>
                  <li><strong>Step 3 - You Guide:</strong> Correct using mistakes to help them "Aim"</li>
                </ol>
              </div>

              <div className="mt-4">
                <p className="font-bold mb-2">Key Check-Ins (after every move):</p>
                <ul className="space-y-1 ml-4">
                  <li>• "Can you explain why I did that?"</li>
                  <li>• "What do you think happens next?"</li>
                </ul>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-primary mt-4">
                <p className="font-bold">💡 Remember:</p>
                <p>After student masters all 3 layers, track it as "Solutions Unlocked"</p>
                <p className="mt-2">Then implement a Boss Battle challenge and record in Battle Log</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module5-correct" title='3. Reflect & Correct – "Fix It to Master It."' expanded={expandedSections["module5-correct"] || false} onToggle={function () { return toggleSection("module5-correct"); }} gradient="from-primary to-primary/70">
            <div className="space-y-4">
              <p className="font-semibold">Use mistakes as moments of learning. Make the student feel safe to mess up.</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">✅ Correction Framework:</p>
                <ol className="space-y-3 ml-4">
                  <li>1. <strong>Let Them Explain First:</strong> "Tell me what you did here" (Teach-Back Method)</li>
                  <li>2. <strong>Reinforce the 3 Layers:</strong> "Which layer did we crack?"</li>
                  <li>3. <strong>Celebrate Recovery:</strong> "See? That's growth right there."</li>
                  <li>4. <strong>Record Learning Notes:</strong> Log in Challenge Tracker</li>
                </ol>
              </div>

              <p className="text-sm italic mt-4">It normalizes mistakes and replaces shame with strategy.</p>
            </div>
          </SectionCard>

          <SectionCard id="module5-reinforce" title='4. Reinforce & Grow – "Drill It. Track It. Win."' expanded={expandedSections["module5-reinforce"] || false} onToggle={function () { return toggleSection("module5-reinforce"); }} gradient="from-primary/90 to-primary/80">
            <div className="space-y-4">
              <p className="font-semibold">End the session with momentum.</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">✅ Post-Session Routine (Every Session):</p>
                <ol className="space-y-2 ml-4">
                  <li>1. <strong>Assign a Boss Battle</strong> - Based on today's skill</li>
                  <li>2. <strong>Update Boss Battle Log</strong> - Track results, difficulty, confidence</li>
                  <li>3. <strong>Motivate & Close Strong</strong> - Give specific praise</li>
                </ol>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-primary mt-4">
                <p className="italic">"Next week we level up. This is where it gets fun. I'm so proud of you."</p>
              </div>
            </div>
          </SectionCard>

          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-xl mb-4">🔠 LEXICON SNAP-IN</h4>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-2 text-left">Phrase</th>
                  <th className="p-2 text-left">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/10">
                  <td className="p-2">"Boss Battle"</td>
                  <td className="p-2">A challenge task that tests full understanding</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2">"Solutions Unlocked"</td>
                  <td className="p-2">A concept or skill fully mastered</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2">"3-Layer Lens"</td>
                  <td className="p-2">The core diagnostic + teaching framework</td>
                </tr>
                <tr>
                  <td className="p-2">"Progress is data"</td>
                  <td className="p-2">Why we track everything</td>
                </tr>
              </tbody>
            </table>
          </div>

          {!isComplete && (<Button onClick={onComplete} className="w-full" size="lg">
              Mark Module 5 Complete <CheckCircle2 className="ml-2 w-5 h-5"/>
            </Button>)}
          {isComplete && (<div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5"/>
              Module Completed
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
function ModuleSix(_a) {
    var expandedSections = _a.expandedSections, toggleSection = _a.toggleSection, onComplete = _a.onComplete, isComplete = _a.isComplete;
    return (<div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8"/>
            <div>
              <CardTitle className="text-2xl">Module 6: Balancing Tutoring & School</CardTitle>
              <CardDescription className="text-white/95 text-lg mt-2">
                Systems beat moods. Structure beats chaos. Every time.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-accent p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-bold mb-4">The Truth (No Glitter, No Hacks)</h3>
            <p className="text-muted-foreground mb-4">
              You don't need more motivation. You need a machine.
            </p>
            <p className="font-semibold">The winners aren't the most motivated - they're the most systemized.</p>
          </div>

          <SectionCard id="module6-systems" title="What Systems Actually Do For You" expanded={expandedSections["module6-systems"] || false} onToggle={function () { return toggleSection("module6-systems"); }} gradient="from-primary to-primary/80">
            <div className="space-y-4">
              <p className="font-semibold mb-3">They convert:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border border-primary/20">
                  <p className="font-bold text-destructive">Confusion</p>
                  <ArrowRight className="w-4 h-4 inline mx-2"/>
                  <p className="font-bold text-primary inline">Structure</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-primary/20">
                  <p className="font-bold text-destructive">Forgetfulness</p>
                  <ArrowRight className="w-4 h-4 inline mx-2"/>
                  <p className="font-bold text-primary inline">Flow</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-primary/20">
                  <p className="font-bold text-destructive">Burnout</p>
                  <ArrowRight className="w-4 h-4 inline mx-2"/>
                  <p className="font-bold text-primary inline">Rhythm</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-primary/20">
                  <p className="font-bold text-destructive">"I'm overwhelmed"</p>
                  <ArrowRight className="w-4 h-4 inline mx-2"/>
                  <p className="font-bold text-primary inline">"I'm in control"</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module6-hub" title="The Response Hub = Your Operating System" expanded={expandedSections["module6-hub"] || false} onToggle={function () { return toggleSection("module6-hub"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <p className="font-semibold">What TT used to give you individually is now centralized:</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <ul className="space-y-2">
                  <li>✓ Challenge Tracker → automated, visual, impossible to ignore</li>
                  <li>✓ Boss Battles → integrated into session-logging</li>
                  <li>✓ Session Planner → inside your workflow</li>
                  <li>✓ Student Identity Sheet → intelligence stored per student</li>
                  <li>✓ 3-Layer Lens → embedded into lesson flow</li>
                </ul>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-primary mt-4">
                <p className="font-bold">The Hub holds the structure. You follow it.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module6-formula" title="The Student-Tutor Reality Formula" expanded={expandedSections["module6-formula"] || false} onToggle={function () { return toggleSection("module6-formula"); }} gradient="from-primary to-primary/70">
            <div className="space-y-4">
              <p>You're building one identity that carries both:</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">Here's the formula:</p>
                <ol className="space-y-3 ml-4">
                  <li>1. <strong>Keep Your Commitments</strong> - Build patterns for your future self</li>
                  <li>2. <strong>Don't Rely on Emotion</strong> - When tired, use the system more</li>
                  <li>3. <strong>Routine &gt; "Trying Hard"</strong> - Let repetition do the lifting</li>
                </ol>
              </div>
            </div>
          </SectionCard>

          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-xl mb-4">💪 Mantras for When You Slip</h4>
            <ul className="space-y-3">
              <li>"I don't rely on pressure. I rely on process."</li>
              <li>"I don't trust motivation. I trust my systems."</li>
              <li>"I'm not overwhelmed. I'm under-organized."</li>
              <li>"If I follow the Hub, my life stays clean."</li>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="font-bold text-lg">The Final Truth:</p>
              <p className="mt-2">If you win inside TT, you'll win in school.</p>
              <p className="mt-2 italic">Structure is structure. Discipline is discipline. Character is character.</p>
            </div>
          </div>

          {!isComplete && (<Button onClick={onComplete} className="w-full" size="lg">
              Mark Module 6 Complete <CheckCircle2 className="ml-2 w-5 h-5"/>
            </Button>)}
          {isComplete && (<div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5"/>
              Module Completed
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
function ModuleSeven(_a) {
    var expandedSections = _a.expandedSections, toggleSection = _a.toggleSection, onComplete = _a.onComplete, isComplete = _a.isComplete;
    return (<div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8"/>
            <div>
              <CardTitle className="text-2xl">Module 7: Time Mastery for Soul-Led Teachers</CardTitle>
              <CardDescription className="text-white/95 text-lg mt-2">
                "You're not just a tutor. You're a presence."
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-accent p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-bold mb-4">🔥 Main Problem</h3>
            <p className="text-muted-foreground mb-4">
              Most student-tutors think teaching is about technique.
            </p>
            <p className="font-semibold">But in reality? They're mastered by urgency, guilt, and grind.</p>
          </div>

          <SectionCard id="module7-solution" title="🔧 The Real Solution" expanded={expandedSections["module7-solution"] || false} onToggle={function () { return toggleSection("module7-solution"); }} gradient="from-primary to-primary/80">
            <div className="space-y-4">
              <p className="font-bold text-lg">Training tutors not just to manage time — but to hold space with rhythm, calm, and inner clarity.</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <p className="font-bold mb-3">🎯 Outcome - TT Tutors will know how to:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Work in flow blocks, not panic hours</li>
                  <li>• Maintain emotional peace before, during, and after sessions</li>
                  <li>• Prioritize presence over perfection</li>
                  <li>• Create internal stillness, even when life is chaotic</li>
                  <li>• Build sessions that breathe, not rush</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="module7-pause" title='✅ 1. The "Sacred Pause" Strategy' expanded={expandedSections["module7-pause"] || false} onToggle={function () { return toggleSection("module7-pause"); }} gradient="from-primary/90 to-primary">
            <div className="space-y-4">
              <p className="font-semibold">Sometimes the best thing you can do in a session is: Pause.</p>
              
              <div className="bg-card p-4 rounded-lg border-l-4 border-primary">
                <ul className="space-y-2">
                  <li>• Let the student think</li>
                  <li>• Let the silence teach</li>
                  <li>• Let their brain breathe</li>
                </ul>
              </div>

              <p className="italic mt-4">Silence isn't a lack of teaching. It's the space where learning downloads.</p>
            </div>
          </SectionCard>

          <SectionCard id="module7-reset" title="✅ 2. Emotional Reset Checklist" expanded={expandedSections["module7-reset"] || false} onToggle={function () { return toggleSection("module7-reset"); }} gradient="from-primary to-primary/70">
            <div className="space-y-4">
              <p className="font-semibold">Before any session, scan this mental list:</p>
              
              <div className="bg-accent p-4 rounded-lg border border-primary/10">
                <ul className="space-y-2">
                  <li>☐ Did I eat / hydrate?</li>
                  <li>☐ Do I feel rushed or grounded?</li>
                  <li>☐ What's the student's emotional state likely to be today?</li>
                  <li>☐ Am I here to prove something or serve someone?</li>
                  <li>☐ Deep breath. Shoulders down. Eyes soft. Calm energy ON.</li>
                </ul>
              </div>

              <p className="font-bold mt-4">No session starts without intention.</p>
            </div>
          </SectionCard>

          <SectionCard id="module7-rhythm" title="🧘 Why This Matters" expanded={expandedSections["module7-rhythm"] || false} onToggle={function () { return toggleSection("module7-rhythm"); }} gradient="from-primary/90 to-primary/80">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-bold mb-2 text-destructive">The World's Way</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Hustle harder</li>
                    <li>• Do more</li>
                    <li>• Grind 24/7</li>
                    <li>• Sacrifice well-being</li>
                  </ul>
                </div>
                <div className="bg-accent p-4 rounded-lg border border-primary/10">
                  <p className="font-bold mb-2 text-primary">TT's Way</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Slow down + focus deeper</li>
                    <li>• Feel more, hold better energy</li>
                    <li>• Work in sprints, then reset</li>
                    <li>• Prioritize your presence</li>
                  </ul>
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border-l-4 border-primary mt-4">
                <p className="font-bold text-center">Calm mentors create confident students.</p>
              </div>
            </div>
          </SectionCard>

          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-xl mb-4">🌊 Rhythm Note</h4>
            <ul className="space-y-3">
              <li>"Teaching isn't a race. It's a rhythm."</li>
              <li>"A calm mind teaches faster than a rushed one."</li>
              <li>"The more still you are, the more they trust you."</li>
              <li>"A structured rhythm feels safer than a fast syllabus."</li>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="font-bold text-lg">Final Truth:</p>
              <p className="mt-2 italic">A dysregulated tutor can't regulate a student.</p>
              <p className="mt-2">The most powerful tool is self-regulation.</p>
            </div>
          </div>

          {!isComplete && (<Button onClick={onComplete} className="w-full" size="lg">
              Mark Module 7 Complete <CheckCircle2 className="ml-2 w-5 h-5"/>
            </Button>)}
          {isComplete && (<div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5"/>
              Module Completed
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
