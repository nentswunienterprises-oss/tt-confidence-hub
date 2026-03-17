import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TutorCohortApplicationForm() {
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    phone: "",
    email: "",
    city: "",
    matricStatus: "",
    matricYear: "",
    mathLevel: "",
    mathResult: "",
    otherSubjects: "",
    currentSituation: [],
    interestReason: "",
    helpedBefore: "",
    helpExplain: "",
    whatDoFirst: "",
    testStruggle: "",
    pressureResponses: [],
    panicReason: "",
    disciplineWhy: "",
    repeatMistake: "",
    ttMeaning: "",
    structurePref: "",
    weeklyHours: "",
    availableAfternoon: "",
    finalWhy: "",
    commitment: [],
    finalAgreement: false
  });

  // ...form handlers and submit logic will go here...

  return (
    <form className="space-y-8 max-w-2xl mx-auto bg-white/90 rounded-xl shadow-lg p-8 border border-[#F3D2C1] mt-10 mb-20">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#2D1A06]">Founding Tutor Cohort Application</h1>
      {/* Section 1 - Basic Information */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 1 - Basic Information</h2>
        <label className="block mb-2">Full Name<input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></label>
        <label className="block mb-2">Age<input className="input" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} /></label>
        <label className="block mb-2">Phone Number (WhatsApp preferred)<input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
        <label className="block mb-2">Email Address<input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
        <label className="block mb-2">City / Area<input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></label>
      </section>
      {/* Section 2 - Academic Background */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 2 - Academic Background</h2>
        <div className="mb-2">Did you complete matric?</div>
        <label className="mr-4"><input type="radio" name="matricStatus" checked={form.matricStatus === "Yes"} onChange={() => setForm(f => ({ ...f, matricStatus: "Yes" }))} /> Yes</label>
        <label className="mr-4"><input type="radio" name="matricStatus" checked={form.matricStatus === "Currently completing"} onChange={() => setForm(f => ({ ...f, matricStatus: "Currently completing" }))} /> Currently completing</label>
        <label><input type="radio" name="matricStatus" checked={form.matricStatus === "No"} onChange={() => setForm(f => ({ ...f, matricStatus: "No" }))} /> No</label>
        <label className="block mt-2">Year of matric completion<input className="input" value={form.matricYear} onChange={e => setForm(f => ({ ...f, matricYear: e.target.value }))} /></label>
        <div className="mt-2">Mathematics Level</div>
        <label className="mr-4"><input type="radio" name="mathLevel" checked={form.mathLevel === "Core Mathematics"} onChange={() => setForm(f => ({ ...f, mathLevel: "Core Mathematics" }))} /> Core Mathematics</label>
        <label><input type="radio" name="mathLevel" checked={form.mathLevel === "Mathematical Literacy"} onChange={() => setForm(f => ({ ...f, mathLevel: "Mathematical Literacy" }))} /> Mathematical Literacy</label>
        <label className="block mt-2">Final Mathematics Result (%)<input className="input" value={form.mathResult} onChange={e => setForm(f => ({ ...f, mathResult: e.target.value }))} /></label>
        <label className="block mt-2">Other strong subjects (if any)<input className="input" value={form.otherSubjects} onChange={e => setForm(f => ({ ...f, otherSubjects: e.target.value }))} /></label>
      </section>
      {/* Section 3 - Current Situation */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 3 - Current Situation</h2>
        <div className="mb-2">What are you currently doing?</div>
        <label className="mr-4"><input type="checkbox" checked={form.currentSituation.includes("Gap year")} onChange={e => setForm(f => ({ ...f, currentSituation: e.target.checked ? [...f.currentSituation, "Gap year"] : f.currentSituation.filter(x => x !== "Gap year") }))} /> Gap year</label>
        <label className="mr-4"><input type="checkbox" checked={form.currentSituation.includes("Waiting for university")} onChange={e => setForm(f => ({ ...f, currentSituation: e.target.checked ? [...f.currentSituation, "Waiting for university"] : f.currentSituation.filter(x => x !== "Waiting for university") }))} /> Waiting for university</label>
        <label className="mr-4"><input type="checkbox" checked={form.currentSituation.includes("Studying part-time")} onChange={e => setForm(f => ({ ...f, currentSituation: e.target.checked ? [...f.currentSituation, "Studying part-time"] : f.currentSituation.filter(x => x !== "Studying part-time") }))} /> Studying part-time</label>
        <label className="mr-4"><input type="checkbox" checked={form.currentSituation.includes("Working")} onChange={e => setForm(f => ({ ...f, currentSituation: e.target.checked ? [...f.currentSituation, "Working"] : f.currentSituation.filter(x => x !== "Working") }))} /> Working</label>
        <label className="mr-4"><input type="checkbox" checked={form.currentSituation.includes("Other")} onChange={e => setForm(f => ({ ...f, currentSituation: e.target.checked ? [...f.currentSituation, "Other"] : f.currentSituation.filter(x => x !== "Other") }))} /> Other</label>
        <label className="block mt-2">Why are you interested in this opportunity?<textarea className="input" value={form.interestReason} onChange={e => setForm(f => ({ ...f, interestReason: e.target.value }))} /></label>
      </section>
      {/* Section 4 - Teaching & Communication */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 4 - Teaching & Communication</h2>
        <div className="mb-2">Have you ever helped someone understand schoolwork before?</div>
        <label className="mr-4"><input type="radio" name="helpedBefore" checked={form.helpedBefore === "Yes"} onChange={() => setForm(f => ({ ...f, helpedBefore: "Yes" }))} /> Yes</label>
        <label><input type="radio" name="helpedBefore" checked={form.helpedBefore === "No"} onChange={() => setForm(f => ({ ...f, helpedBefore: "No" }))} /> No</label>
        <label className="block mt-2">If yes, briefly explain the situation.<textarea className="input" value={form.helpExplain} onChange={e => setForm(f => ({ ...f, helpExplain: e.target.value }))} /></label>
        <label className="block mt-2">A student says: “I don’t get this at all.” What would you do first?<textarea className="input" value={form.whatDoFirst} onChange={e => setForm(f => ({ ...f, whatDoFirst: e.target.value }))} /></label>
      </section>
      {/* Section 5 - Response Under Pressure */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 5 - Response Under Pressure</h2>
        <label className="block mb-2">Think about a time you struggled with a difficult question in a test. What happened in your mind?<textarea className="input" value={form.testStruggle} onChange={e => setForm(f => ({ ...f, testStruggle: e.target.value }))} /></label>
        <div className="mb-2">When work becomes difficult, which of these do you relate to most? (Select all that apply)</div>
        <label className="mr-4"><input type="checkbox" checked={form.pressureResponses.includes("I rush to finish quickly")} onChange={e => setForm(f => ({ ...f, pressureResponses: e.target.checked ? [...f.pressureResponses, "I rush to finish quickly"] : f.pressureResponses.filter(x => x !== "I rush to finish quickly") }))} /> I rush to finish quickly</label>
        <label className="mr-4"><input type="checkbox" checked={form.pressureResponses.includes("I freeze and don’t know where to start")} onChange={e => setForm(f => ({ ...f, pressureResponses: e.target.checked ? [...f.pressureResponses, "I freeze and don’t know where to start"] : f.pressureResponses.filter(x => x !== "I freeze and don’t know where to start") }))} /> I freeze and don’t know where to start</label>
        <label className="mr-4"><input type="checkbox" checked={form.pressureResponses.includes("I second-guess myself")} onChange={e => setForm(f => ({ ...f, pressureResponses: e.target.checked ? [...f.pressureResponses, "I second-guess myself"] : f.pressureResponses.filter(x => x !== "I second-guess myself") }))} /> I second-guess myself</label>
        <label className="mr-4"><input type="checkbox" checked={form.pressureResponses.includes("I stay calm and work step-by-step")} onChange={e => setForm(f => ({ ...f, pressureResponses: e.target.checked ? [...f.pressureResponses, "I stay calm and work step-by-step"] : f.pressureResponses.filter(x => x !== "I stay calm and work step-by-step") }))} /> I stay calm and work step-by-step</label>
        <label className="mr-4"><input type="checkbox" checked={form.pressureResponses.includes("It depends on the situation")} onChange={e => setForm(f => ({ ...f, pressureResponses: e.target.checked ? [...f.pressureResponses, "It depends on the situation"] : f.pressureResponses.filter(x => x !== "It depends on the situation") }))} /> It depends on the situation</label>
        <label className="block mt-2">What do you think causes students to panic, rush or freeze in tests even though they understand the work?<textarea className="input" value={form.panicReason} onChange={e => setForm(f => ({ ...f, panicReason: e.target.value }))} /></label>
      </section>
      {/* Section 6 - Discipline & Responsibility */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 6 - Discipline & Responsibility</h2>
        <label className="block mb-2">This role requires consistency, preparation, and calm behaviour under pressure. Why do you believe you can handle that responsibility?<textarea className="input" value={form.disciplineWhy} onChange={e => setForm(f => ({ ...f, disciplineWhy: e.target.value }))} /></label>
        <label className="block mb-2">How would you respond if a student keeps making the same mistake repeatedly?<textarea className="input" value={form.repeatMistake} onChange={e => setForm(f => ({ ...f, repeatMistake: e.target.value }))} /></label>
      </section>
      {/* Section 7 - Alignment With TT */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 7 - Alignment With TT</h2>
        <div className="mb-2">Read this carefully:</div>
        <blockquote className="italic text-[#E63946] mb-2">“Most schools teach the work.<br />Very few systems train how students respond when the work becomes difficult.”</blockquote>
        <label className="block mb-2">What do you think this means?<textarea className="input" value={form.ttMeaning} onChange={e => setForm(f => ({ ...f, ttMeaning: e.target.value }))} /></label>
        <div className="mb-2">Which of the following best describes you?</div>
        <label className="mr-4"><input type="radio" name="structurePref" checked={form.structurePref === "structure"} onChange={() => setForm(f => ({ ...f, structurePref: "structure" }))} /> I prefer structure and clear systems</label>
        <label><input type="radio" name="structurePref" checked={form.structurePref === "flexibility"} onChange={() => setForm(f => ({ ...f, structurePref: "flexibility" }))} /> I prefer flexibility and doing things my own way</label>
      </section>
      {/* Section 8 - Availability */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 8 - Availability</h2>
        <label className="block mb-2">How many hours per week can you realistically commit?<input className="input" value={form.weeklyHours} onChange={e => setForm(f => ({ ...f, weeklyHours: e.target.value }))} /></label>
        <div className="mb-2">Are you available for online sessions in the afternoon/evening?</div>
        <label className="mr-4"><input type="radio" name="availableAfternoon" checked={form.availableAfternoon === "Yes"} onChange={() => setForm(f => ({ ...f, availableAfternoon: "Yes" }))} /> Yes</label>
        <label className="mr-4"><input type="radio" name="availableAfternoon" checked={form.availableAfternoon === "No"} onChange={() => setForm(f => ({ ...f, availableAfternoon: "No" }))} /> No</label>
        <label><input type="radio" name="availableAfternoon" checked={form.availableAfternoon === "Sometimes"} onChange={() => setForm(f => ({ ...f, availableAfternoon: "Sometimes" }))} /> Sometimes</label>
      </section>
      {/* Section 9 - Final Filter */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 9 - Final Filter</h2>
        <div className="mb-2">This is not a casual tutoring role.<br />It requires training, discipline, and adherence to a structured system.</div>
        <label className="block mb-2">Why should you be considered for the Founding Tutor Cohort?<textarea className="input" value={form.finalWhy} onChange={e => setForm(f => ({ ...f, finalWhy: e.target.value }))} /></label>
      </section>
      {/* Section 10 - Commitment */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Section 10 - Commitment</h2>
        <div className="mb-2">If selected, are you willing to:</div>
        <label className="block"><input type="checkbox" checked={form.commitment.includes("Complete structured TT training before tutoring")}
          onChange={e => setForm(f => ({ ...f, commitment: e.target.checked ? [...f.commitment, "Complete structured TT training before tutoring"] : f.commitment.filter(x => x !== "Complete structured TT training before tutoring") }))} /> Complete structured TT training before tutoring</label>
        <label className="block"><input type="checkbox" checked={form.commitment.includes("Follow TT session protocols")}
          onChange={e => setForm(f => ({ ...f, commitment: e.target.checked ? [...f.commitment, "Follow TT session protocols"] : f.commitment.filter(x => x !== "Follow TT session protocols") }))} /> Follow TT session protocols</label>
        <label className="block"><input type="checkbox" checked={form.commitment.includes("Be evaluated before working with students")}
          onChange={e => setForm(f => ({ ...f, commitment: e.target.checked ? [...f.commitment, "Be evaluated before working with students"] : f.commitment.filter(x => x !== "Be evaluated before working with students") }))} /> Be evaluated before working with students</label>
        <div className="mt-2">Yes/No</div>
        <label className="mr-4"><input type="radio" name="finalAgreement" checked={form.finalAgreement === true} onChange={() => setForm(f => ({ ...f, finalAgreement: true }))} /> Yes</label>
        <label><input type="radio" name="finalAgreement" checked={form.finalAgreement === false} onChange={() => setForm(f => ({ ...f, finalAgreement: false }))} /> No</label>
      </section>
      {/* Final Section - Instruction */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Final Section - Instruction</h2>
        <div className="mb-2">Submit your application only if you are serious about being trained and held to a high standard.</div>
      </section>
      <div className="flex justify-center mt-8">
        <Button type="submit" className="text-lg font-bold px-8 py-4 rounded-full shadow-xl border-0 bg-[#E63946] hover:bg-[#C92B2B] transition-all" style={{ color: "white" }}>
          Submit Application
        </Button>
      </div>
    </form>
  );
}
