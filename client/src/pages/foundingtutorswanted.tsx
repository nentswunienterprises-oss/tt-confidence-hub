import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TerritorialTutoringLogoSVG } from "@/components/TerritorialTutoringLogoSVG";

function FoundingTutorsWanted() {
  const navigate = useNavigate();
  const signupUrl = "/operational/tutorsignup";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5ED] to-[#F9E3D8] flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#F3D2C1] w-full backdrop-blur-md" style={{ background: 'linear-gradient(135deg, #FFF5ED 0%, #F9E3D8 100%)', boxShadow: '0 2px 8px 0 rgba(233, 57, 70, 0.04)', backgroundColor: 'rgba(255,245,237,0.95)' }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center">
            <span className="flex-shrink-0 block md:hidden">
              <TerritorialTutoringLogoSVG width={150} />
            </span>
            <span className="flex-shrink-0 hidden md:block">
              <TerritorialTutoringLogoSVG width={200} />
            </span>
            <span className="hidden md:block flex-1 text-2xl lg:text-4xl font-bold tracking-tight text-[#2D1A1A] ml-6">FOUNDING TUTOR COHORT</span>
            <div className="flex-shrink-0 md:hidden flex flex-col items-start justify-center -ml-2">
              <span className="block text-sm sm:text-base font-bold tracking-tight text-[#2D1A06] leading-tight">Founding</span>
              <span className="block text-sm sm:text-base font-bold tracking-tight text-[#2D1A06] leading-tight -ml-3">Tutor Cohort</span>
            </div>
            <Button
              className="flex-shrink-0 ml-auto text-sm sm:text-base font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border-0 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: "#E63946", color: "white" }}
              onClick={() => navigate("/operational/signup?role=tutor")}
            >
              <span className="hidden sm:inline">Apply for the Founding Cohort</span>
              <span className="sm:hidden">Apply</span>
            </Button>
          </div>
        </header>
        <div className="h-16 sm:h-20" />
        <main className="w-full max-w-3xl mx-auto px-3 sm:px-6 md:px-12 py-6 sm:py-10 md:py-12 flex-1">
          <section className="mb-8 sm:mb-10">
            <div className="rounded-xl shadow-lg p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-[#F3D2C1] bg-white/90 w-full sm:max-w-2xl mx-auto">
              <p className="text-base sm:text-lg md:text-xl text-[#1A1A1A] mb-3 sm:mb-4 font-semibold leading-relaxed">Most students do not fail because they are unintelligent.<br />They fail because their response to difficulty was never trained.<br />We are building the first cohort of tutors who know how to train that response.</p>
              <p className="text-base sm:text-lg md:text-xl text-[#E63946] font-bold mb-3 sm:mb-4">Territorial Tutoring is not looking for ordinary tutors.</p>
              <p className="text-base sm:text-lg md:text-xl text-[#1A1A1A] mb-3 sm:mb-4 leading-relaxed">We are building a small group of disciplined academic mentors who can train students to stay calm, think clearly, and execute when math becomes difficult.</p>
              <p className="text-base sm:text-lg md:text-xl text-[#1A1A1A] mb-3 sm:mb-4 leading-relaxed">This is the Founding Tutor Cohort.</p>
              <p className="text-base sm:text-lg md:text-xl text-[#1A1A1A] mb-3 sm:mb-4 leading-relaxed">If selected, you will not just teach math.</p>
              <p className="text-base sm:text-lg md:text-xl text-[#1A1A1A] mb-3 sm:mb-4 leading-relaxed">You will be trained in the methods and response-conditioning standards that TT is built on.</p>
              <div className="flex flex-col items-center mt-6 sm:mt-8 mb-4">
                <Button
                  size="lg"
                  className="w-full px-6 sm:px-8 py-5 sm:py-6 rounded-full font-semibold mb-2 bg-[#E63946] hover:bg-[#C92B2B] transition-all border-0 shadow-xl text-base sm:text-lg"
                  style={{ color: "white" }}
                  onClick={() => navigate("/operational/signup?role=tutor")}
                >
                  Apply for the Founding Tutor Cohort
                </Button>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">What Territorial Tutoring Actually Does</h2>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">Most schools teach the content.<br />Very few systems train how students respond when the work becomes difficult.<br />That is our focus.</p>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">When a student sees an unfamiliar question, pressure appears.</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li>Some panic.</li>
              <li>Some rush.</li>
              <li>Some freeze.</li>
            </ul>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">At that moment, the issue is not always intelligence.<br />The issue is execution under pressure.</p>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">TT trains students to:</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-1">remain composed when difficulty appears</li>
              <li className="mb-1">read questions fully</li>
              <li className="mb-1">identify what is known</li>
              <li className="mb-1">execute the next step calmly</li>
              <li>continue without emotional negotiation</li>
            </ul>
            <p className="text-base sm:text-lg leading-relaxed">Math is the subject.<br />Response is the craft.<br />Pressure is the environment.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">Who This Is For</h2>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">This is for recent matric graduates or gap-year students who:</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-1">performed well in mathematics</li>
              <li className="mb-1">are disciplined and teachable</li>
              <li className="mb-1">naturally explain things clearly</li>
              <li className="mb-1">value structure over hype</li>
              <li className="mb-1">want meaningful responsibility, not casual side-income</li>
              <li>are interested in mentorship, leadership, and skill development</li>
            </ul>
            <p className="text-base sm:text-lg leading-relaxed">You do not need to be loud.<br />You do not need to be perfect.<br />But you must be calm, serious, and willing to be trained properly.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">Who This Is Not For</h2>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">This is not for people who:</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-1">want an easy tutoring side hustle</li>
              <li className="mb-1">rely on motivation instead of discipline</li>
              <li className="mb-1">are impatient with students</li>
              <li className="mb-1">only care about "looking smart"</li>
              <li className="mb-1">cannot follow standards</li>
              <li>want freedom without structure</li>
            </ul>
            <p className="text-base sm:text-lg leading-relaxed">If you are looking for a casual opportunity, this is the wrong place.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">What Makes TT Different</h2>
            <ol className="list-decimal ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-4"><span className="font-semibold">This is not ordinary tutoring</span><br />You will not just explain methods.<br />You will be trained to observe and correct how students respond when math becomes difficult.<br />That is a different skill.</li>
              <li className="mb-4"><span className="font-semibold">This is doctrine-driven</span><br />Territorial Tutoring operates through clear standards.<br />Every tutor is trained in:<ul className="list-disc ml-5 sm:ml-6 mt-2 mb-2"><li className="mb-1">calm communication</li><li className="mb-1">structured problem-solving</li><li className="mb-1">response-conditioning protocols</li><li className="mb-1">session discipline</li><li>student composure under pressure</li></ul>We do not improvise the core system.</li>
              <li className="mb-4"><span className="font-semibold">This is selective</span><br />We are not building a large random tutor pool.<br />We are building a small founding group that sets the standard for everyone who enters later.<br />Selection matters.</li>
              <li className="mb-4"><span className="font-semibold">This builds real skill</span><br />If selected, you will develop:<ul className="list-disc ml-5 sm:ml-6 mt-2 mb-2"><li className="mb-1">teaching clarity</li><li className="mb-1">mentorship discipline</li><li className="mb-1">leadership maturity</li><li className="mb-1">structured thinking</li><li className="mb-1">communication under pressure</li><li>income-generating tutoring skills</li></ul>This is not just work.<br />It is capability development.</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">What You Will Be Trained In</h2>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-3"><span className="font-semibold">TT Doctrine</span><br />The worldview and operating standards behind Territorial Tutoring.</li>
              <li className="mb-3"><span className="font-semibold">Response Conditioning</span><br />How to train students to remain calm and execute when difficulty appears.</li>
              <li className="mb-3"><span className="font-semibold">Structured Session Delivery</span><br />How to guide one-on-one online math sessions with precision and control.</li>
              <li className="mb-3"><span className="font-semibold">Student Observation</span><br />How to identify panic habits, hesitation patterns, and execution breakdown.</li>
              <li><span className="font-semibold">Mentorship Conduct</span><br />How to lead with calm authority, responsibility, and professionalism.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">Why This Cohort Matters</h2>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">The Founding Tutor Cohort is not just the first intake.<br />It is the group that helps establish:</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-1">the teaching standard</li>
              <li className="mb-1">the cultural standard</li>
              <li className="mb-1">the discipline standard</li>
              <li>the execution standard</li>
            </ul>
            <p className="text-base sm:text-lg leading-relaxed">The tutors selected here will shape how Territorial Tutoring operates as it grows.<br />This role carries responsibility.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">What We Look For</h2>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">We look for people who show signs of:</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-1">academic competence</li>
              <li className="mb-1">psychological composure</li>
              <li className="mb-1">patience</li>
              <li className="mb-1">discipline</li>
              <li className="mb-1">responsibility</li>
              <li className="mb-1">teachability</li>
              <li>strong communication potential</li>
            </ul>
            <p className="text-base sm:text-lg leading-relaxed">We are not looking for performers.<br />We are looking for people who can become calm operators inside the TT system.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">What Selected Tutors Receive</h2>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">Selected applicants will receive:</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-1">structured training in TT methodology</li>
              <li className="mb-1">mentorship and doctrine-based development</li>
              <li className="mb-1">practical tutoring experience</li>
              <li className="mb-1">a pathway into paid tutoring opportunities as they qualify</li>
              <li>the chance to become part of the first generation of TT operators</li>
            </ul>
            <p className="text-base sm:text-lg leading-relaxed">Tutors are not placed blindly.<br />They are trained first.<br />Standards come before student allocation.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">The Standard</h2>
            <ul className="list-disc ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-1">execution reveals the truth</li>
              <li className="mb-1">composure is trainable</li>
              <li className="mb-1">structure defeats talent</li>
              <li>responsibility creates composure</li>
            </ul>
            <p className="text-base sm:text-lg leading-relaxed">If those ideas make immediate sense to you, you may belong here.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">Application Process</h2>
            <ol className="list-decimal ml-5 sm:ml-6 mb-3 sm:mb-4 text-base sm:text-lg">
              <li className="mb-3"><span className="font-semibold">Step 1 - Apply</span><br />Submit your application and basic details.</li>
              <li className="mb-3"><span className="font-semibold">Step 2 - Screening</span><br />We review for alignment, seriousness, and potential.</li>
              <li className="mb-3"><span className="font-semibold">Step 3 - Selection</span><br />A small number of applicants are chosen for the founding cohort.</li>
              <li className="mb-3"><span className="font-semibold">Step 4 - Training</span><br />Selected applicants begin TT doctrine and tutor training.</li>
              <li><span className="font-semibold">Step 5 - Qualification Pathway</span><br />Tutors who meet the standard move into real tutoring opportunities.</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-[#1A1A1A]">Before You Apply</h2>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">Do not apply because you need "something to do."</p>
            <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">Apply if:</p>
            <ul className="list-disc ml-5 sm:ml-6 mb-4 sm:mb-6 text-base sm:text-lg">
              <li className="mb-1">you care about doing meaningful work well</li>
              <li className="mb-1">you want to learn a real system</li>
              <li className="mb-1">you are willing to be trained and held to standards</li>
              <li>you want to become part of something structured from the beginning</li>
            </ul>
            <div className="text-[#E63946] font-semibold mt-4 sm:mt-6 mb-6 sm:mb-8 text-base sm:text-lg">This cohort is small by design.</div>
            <div className="flex flex-col items-center my-6 sm:my-8">
              <Button
                className="w-full sm:max-w-md text-base sm:text-lg font-bold px-8 sm:px-10 py-5 sm:py-6 rounded-full shadow-xl border-0 bg-[#E63946] hover:bg-[#C92B2B] transition-all"
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
