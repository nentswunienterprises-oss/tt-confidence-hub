import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TerritorialTutoringLogoSVG } from "@/components/TerritorialTutoringLogoSVG";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LeadershipDevelopmentPilot() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5ED" }}>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(255, 245, 237, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerritorialTutoringLogoSVG width={160} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-sm sm:text-base font-medium hover:bg-transparent px-2 sm:px-4"
              style={{ color: "#1A1A1A" }}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="h-16 sm:h-20" />

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

            <h2>THE ONE-SENTENCE POSITIONING</h2>
            <p className="font-semibold">Territorial Tutoring enables high schools to develop academic leaders who prevent failure upstream - before panic becomes identity.</p>

            <div className="text-center mt-6">
              <Button size="lg" className="px-6 py-3 rounded-full font-semibold" style={{ backgroundColor: "#E63946", color: "white" }} onClick={() => window.location.href = "mailto:info@territorialtutoring.co.za?subject=Leadership Pilot Interest"}>
                Initiate High School Leadership Pilot Consideration
              </Button>
              <p className="text-xs text-gray-600 mt-2">This submission registers interest only. No obligation. No activation without alignment.</p>
            </div>

          </CardContent>
        </Card>
      </section>
    </div>
  );
}
