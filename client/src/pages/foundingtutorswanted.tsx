import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TerritorialTutoringLogoSVG } from "@/components/TerritorialTutoringLogoSVG";

function FoundingTutorsWanted() {
  const navigate = useNavigate();
  const signupUrl = "/operational/tutorsignup";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5ED] to-[#F9E3D8]">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#F3D2C1]" style={{ background: 'linear-gradient(135deg, #FFF5ED 0%, #F9E3D8 100%)', boxShadow: '0 2px 8px 0 rgba(233, 57, 70, 0.04)' }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
            <TerritorialTutoringLogoSVG width={190} />
            <div className="hidden md:block">
              <span className="text-2xl lg:text-4xl font-bold tracking-tight text-[#2D1A06]">FOUNDING TUTOR COHORT</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                className="text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-5 rounded-full border-0 shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "#E63946", color: "white" }}
                onClick={() => navigate("/operational/signup?role=tutor")}
              >
                Apply for the Founding Tutor Cohort
              </Button>
            </div>
          </div>
        </header>
        <div className="h-16 sm:h-20" />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12 py-12">
            <section className="mb-8 sm:mb-10">
            {/* Removed intro section heading as requested */}
              <div className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-[#F3D2C1] bg-white/90">
              <p className="text-lg md:text-xl text-[#1A1A1A] mb-2 font-semibold">Most students do not fail because they are unintelligent.<br />They fail because their response to difficulty was never trained.<br />We are building the first cohort of tutors who know how to train that response.</p>
              <p className="text-lg md:text-xl text-[#E63946] font-bold mb-2">Territorial Tutoring is not looking for ordinary tutors.</p>
              <p className="text-lg md:text-xl text-[#1A1A1A] mb-2">We are building a small group of disciplined academic mentors who can train students to stay calm, think clearly, and execute when math becomes difficult.</p>
              <p className="text-lg md:text-xl text-[#1A1A1A] mb-2">This is the Founding Tutor Cohort.</p>
              <p className="text-lg md:text-xl text-[#1A1A1A] mb-2">If selected, you will not just teach math.</p>
              <p className="text-lg md:text-xl text-[#1A1A1A] mb-2">You will be trained in the doctrine, methods, and response conditioning standards that Territorial Tutoring is built on.</p>
              <div className="flex justify-center my-6">
                <Button
                  className="text-lg font-bold px-8 py-4 rounded-full shadow-xl border-0 bg-[#E63946] hover:bg-[#C92B2B] transition-all"
                  style={{ color: "white" }}
                  onClick={() => navigate("/operational/signup?role=tutor")}
                >
                  Apply for the Founding Tutor Cohort
                </Button>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">What Territorial Tutoring Actually Does</h2>
            <p className="mb-2">Most schools teach the content.<br />Very few systems train how students respond when the work becomes difficult.<br />That is our focus.</p>
            <p className="mb-2">When a student sees an unfamiliar question, pressure appears.</p>
            <ul className="list-disc ml-6 mb-2">
              <li>Some panic.</li>
              <li>Some rush.</li>
              <li>Some freeze.</li>
            </ul>
            <p className="mb-2">At that moment, the issue is not always intelligence.<br />The issue is execution under pressure.</p>
            <p className="mb-2">Territorial Tutoring trains students to:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>remain composed when difficulty appears</li>
              <li>read questions fully</li>
              <li>identify what is known</li>
              <li>execute the next step calmly</li>
              <li>continue without emotional negotiation</li>
            </ul>
            <p className="mb-2">Math is the subject.<br />Response is the craft.<br />Pressure is the environment.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Who This Is For</h2>
            <p className="mb-2">This is for recent matric graduates or gap-year students who:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>performed well in mathematics</li>
              <li>are disciplined and teachable</li>
              <li>naturally explain things clearly</li>
              <li>value structure over hype</li>
              <li>want meaningful responsibility, not casual side-income</li>
              <li>are interested in mentorship, leadership, and skill development</li>
            </ul>
            <p className="mb-2">You do not need to be loud.<br />You do not need to be perfect.<br />But you must be calm, serious, and willing to be trained properly.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Who This Is Not For</h2>
            <p className="mb-2">This is not for people who:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>want an easy tutoring side hustle</li>
              <li>rely on motivation instead of discipline</li>
              <li>are impatient with students</li>
              <li>only care about “looking smart”</li>
              <li>cannot follow standards</li>
              <li>want freedom without structure</li>
            </ul>
            <p className="mb-2">If you are looking for a casual opportunity, this is the wrong place.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">What Makes TT Different</h2>
            <ol className="list-decimal ml-6 mb-2">
              <li className="mb-2"><span className="font-semibold">This is not ordinary tutoring</span><br />You will not just explain methods.<br />You will be trained to observe and correct how students respond when math becomes difficult.<br />That is a different skill.</li>
              <li className="mb-2"><span className="font-semibold">This is doctrine-driven</span><br />Territorial Tutoring operates through clear standards.<br />Every tutor is trained in:<ul className="list-disc ml-6 mt-2"><li>calm communication</li><li>structured problem-solving</li><li>response-conditioning protocols</li><li>session discipline</li><li>student composure under pressure</li></ul>We do not improvise the core system.</li>
              <li className="mb-2"><span className="font-semibold">This is selective</span><br />We are not building a large random tutor pool.<br />We are building a small founding group that sets the standard for everyone who enters later.<br />Selection matters.</li>
              <li className="mb-2"><span className="font-semibold">This builds real skill</span><br />If selected, you will develop:<ul className="list-disc ml-6 mt-2"><li>teaching clarity</li><li>mentorship discipline</li><li>leadership maturity</li><li>structured thinking</li><li>communication under pressure</li><li>income-generating tutoring skills</li></ul>This is not just work.<br />It is capability development.</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">What You Will Be Trained In</h2>
            <ul className="list-disc ml-6 mb-2">
              <li><span className="font-semibold">TT Doctrine</span><br />The worldview and operating standards behind Territorial Tutoring.</li>
              <li><span className="font-semibold">Response Conditioning</span><br />How to train students to remain calm and execute when difficulty appears.</li>
              <li><span className="font-semibold">Structured Session Delivery</span><br />How to guide one-on-one online math sessions with precision and control.</li>
              <li><span className="font-semibold">Student Observation</span><br />How to identify panic habits, hesitation patterns, and execution breakdown.</li>
              <li><span className="font-semibold">Mentorship Conduct</span><br />How to lead with calm authority, responsibility, and professionalism.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Why This Cohort Matters</h2>
            <p className="mb-2">The Founding Tutor Cohort is not just the first intake.<br />It is the group that helps establish:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>the teaching standard</li>
              <li>the cultural standard</li>
              <li>the discipline standard</li>
              <li>the execution standard</li>
            </ul>
            <p className="mb-2">The tutors selected here will shape how Territorial Tutoring operates as it grows.<br />This role carries responsibility.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">What We Look For</h2>
            <p className="mb-2">We look for people who show signs of:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>academic competence</li>
              <li>psychological composure</li>
              <li>patience</li>
              <li>discipline</li>
              <li>responsibility</li>
              <li>teachability</li>
              <li>strong communication potential</li>
            </ul>
            <p className="mb-2">We are not looking for performers.<br />We are looking for people who can become calm operators inside the TT system.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">What Selected Tutors Receive</h2>
            <p className="mb-2">Selected applicants will receive:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>structured training in TT methodology</li>
              <li>mentorship and doctrine-based development</li>
              <li>practical tutoring experience</li>
              <li>a pathway into paid tutoring opportunities as they qualify</li>
              <li>the chance to become part of the first generation of TT operators</li>
            </ul>
            <p className="mb-2">Tutors are not placed blindly.<br />They are trained first.<br />Standards come before student allocation.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">The Standard</h2>
            <ul className="list-disc ml-6 mb-2">
              <li>execution reveals the truth</li>
              <li>composure is trainable</li>
              <li>structure defeats talent</li>
              <li>responsibility creates composure</li>
            </ul>
            <p className="mb-2">If those ideas make immediate sense to you, you may belong here.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Application Process</h2>
            <ol className="list-decimal ml-6 mb-2">
              <li><span className="font-semibold">Step 1 - Apply</span><br />Submit your application and basic details.</li>
              <li><span className="font-semibold">Step 2 - Screening</span><br />We review for alignment, seriousness, and potential.</li>
              <li><span className="font-semibold">Step 3 - Selection</span><br />A small number of applicants are chosen for the founding cohort.</li>
              <li><span className="font-semibold">Step 4 - Training</span><br />Selected applicants begin TT doctrine and tutor training.</li>
              <li><span className="font-semibold">Step 5 - Qualification Pathway</span><br />Tutors who meet the standard move into real tutoring opportunities.</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Before You Apply</h2>
            <p className="mb-2">Do not apply because you need “something to do.”</p>
            <p className="mb-2">Apply if:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>you care about doing meaningful work well</li>
              <li>you want to learn a real system</li>
              <li>you are willing to be trained and held to standards</li>
              <li>you want to become part of something structured from the beginning</li>
            </ul>
            <div className="text-[#E63946] font-semibold mt-2">This cohort is small by design.</div>
            <div className="flex justify-center my-6">
              <Button
                className="text-lg font-bold px-8 py-4 rounded-full shadow-xl border-0 bg-[#E63946] hover:bg-[#C92B2B] transition-all"
                style={{ color: "white" }}
                onClick={() => navigate("/operational/tutor/signup")}
              >
                Apply for the Founding Tutor Cohort
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
// ...existing code ends here
}

export default FoundingTutorsWanted;
