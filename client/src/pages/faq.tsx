import React from "react";

const faqs = [
  {
    question: "What exactly is Territorial Tutoring?",
    answer: (
      <>
        <p>Territorial Tutoring is not a tutoring company.</p>
        <p>It is a performance-conditioning system for students in Grades 6–7.<br />
        Math is the arena.<br />
        Response under pressure is the skill.</p>
        <p>We train how students respond when:</p>
        <ul>
          <li>they get stuck</li>
          <li>time runs out</li>
          <li>certainty disappears</li>
        </ul>
        <p>Marks improve as a consequence of that training - not the other way around.</p>
      </>
    ),
  },
  {
    question: "How is TT different from other tutoring services?",
    answer: (
      <>
        <p>Most tutoring focuses on understanding content.</p>
        <p>TT focuses on execution under pressure.</p>
        <p>Here’s the distinction:</p>
        <ul>
          <li>Other tutors ask: “Do you understand this?”</li>
          <li>TT asks: “What do you do when you don’t?”</li>
        </ul>
        <p>Students don’t fail exams because they never saw the work before.<br />
        They fail because their response collapses when things stop feeling clear.</p>
        <p>We train the response until it becomes calm, repeatable, and automatic.</p>
      </>
    ),
  },
  {
    question: "Is this about motivation or confidence coaching?",
    answer: (
      <>
        <p>No.</p>
        <p>TT does not motivate students.<br />
        TT does not “build confidence” directly.</p>
        <p>Confidence is a by-product of repeated, calm execution.</p>
        <p>We remove:</p>
        <ul>
          <li>guesswork</li>
          <li>emotional spirals</li>
          <li>last-minute cramming</li>
          <li>dependency on reassurance</li>
        </ul>
        <p>When chaos is removed, confidence appears naturally.<br />
        No hype required.</p>
      </>
    ),
  },
  {
    question: "What does a typical TT session look like?",
    answer: (
      <>
        <p>Sessions are structured, disciplined, and predictable.</p>
        <p>Every session includes:</p>
        <ul>
          <li>clear problem setup</li>
          <li>slow, deliberate execution</li>
          <li>verbalised thinking</li>
          <li>correction of response errors (not just math errors)</li>
        </ul>
        <p>Students are not rushed.<br />
        They are not rescued.<br />
        They are trained to stay composed and continue.</p>
        <p>This is how pressure tolerance is built.</p>
      </>
    ),
  },
  {
    question: "Do you help with homework and school content?",
    answer: (
      <>
        <p>Yes but that’s not the focus.</p>
        <p>Homework and school topics are used as training material, not the goal.</p>
        <p>We care less about finishing a worksheet and more about:</p>
        <ul>
          <li>how the student approaches it</li>
          <li>what they do when unsure</li>
          <li>how they recover from mistakes</li>
        </ul>
        <p>The content changes.<br />
        The response standard and pressure-preparing environment does not.</p>
      </>
    ),
  },
  {
    question: "My child struggles with math anxiety. Is TT suitable?",
    answer: (
      <>
        <p>Math anxiety is not treated as a condition.</p>
        <p>It is treated as an untrained response to uncertainty.</p>
        <p>We do not avoid pressure.<br />
        We introduce it gradually, deliberately, and safely - until it no longer controls behaviour.</p>
        <p>Students don’t become “less anxious” because we talk about feelings.<br />
        They become calm because they know what to do next, even when unsure.</p>
      </>
    ),
  },
  {
    question: "Is TT too strict or intense for younger students?",
    answer: (
      <>
        <p>TT is disciplined, not harsh.</p>
        <p>There is:</p>
        <ul>
          <li>no shouting</li>
          <li>no humiliation</li>
          <li>no pressure to perform perfectly</li>
        </ul>
        <p>But there are standards.</p>
        <p>Students are expected to:</p>
        <ul>
          <li>think slowly</li>
          <li>explain their reasoning</li>
          <li>stay present when it gets uncomfortable</li>
        </ul>
        <p>This structure creates safety, not fear.</p>
      </>
    ),
  },
  {
    question: "How do Pods work?",
    answer: (
      <>
        <p>Pods are small, structured groups led by a trained tutor and overseen by a Territory Director.</p>
        <p>Pods:</p>
        <ul>
          <li>are limited in size</li>
          <li>run on fixed schedules</li>
          <li>follow the same response-training doctrine</li>
        </ul>
        <p>This ensures:</p>
        <ul>
          <li>consistency</li>
          <li>accountability</li>
          <li>controlled environments</li>
        </ul>
        <p>Scarcity exists by design.<br />
        We don’t expand Pods until standards are protected.</p>
      </>
    ),
  },
  {
    question: "Who are your tutors?",
    answer: (
      <>
        <p>TT tutors are not random hires.</p>
        <p>They are:</p>
        <ul>
          <li>trained through TT’s internal system</li>
          <li>evaluated on response discipline, not personality</li>
          <li>supervised continuously</li>
        </ul>
        <p>Tutors do not improvise.<br />
        They execute the system.</p>
      </>
    ),
  },
  {
    question: "How do you measure progress if it’s not just about marks?",
    answer: (
      <>
        <p>Marks are tracked -0.02em but they’re lagging indicators.</p>
        <p>We track:</p>
        <ul>
          <li>response speed under uncertainty</li>
          <li>error recovery</li>
          <li>verbal clarity</li>
          <li>time discipline</li>
        </ul>
        <p>Parents usually notice the change before report cards do:</p>
        <ul>
          <li>less avoidance</li>
          <li>calmer test behaviour</li>
          <li>improved independence</li>
        </ul>
        <p>The results become obvious.</p>
      </>
    ),
  },
  {
    question: "How quickly will results appear?",
    answer: (
      <>
        <p>There are no instant transformations.</p>
        <p>Typically:</p>
        <ul>
          <li>behavioural shifts appear within 2-4 weeks</li>
          <li>academic improvement follows after</li>
        </ul>
        <p>TT is not a quick fix.<br />
        It is a conditioning process.</p>
        <p>That’s why it works long-term.</p>
      </>
    ),
  },
  {
    question: "Is TT only for struggling students?",
    answer: (
      <>
        <p>No.</p>
        <p>TT is for:</p>
        <ul>
          <li>anxious students</li>
          <li>average students</li>
          <li>high performers who collapse under pressure</li>
        </ul>
        <p>Anyone who wants reliable execution, not emotional swings.</p>
      </>
    ),
  },
  {
    question: "Is TT aligned with the school curriculum?",
    answer: (
      <>
        <p>Yes.</p>
        <p>We work within the school syllabus.<br />
        We do not replace school.<br />
        We train how students engage with it.</p>
      </>
    ),
  },
  {
    question: "What does TT not do?",
    answer: (
      <>
        <p>TT does not:</p>
        <ul>
          <li>cram before exams</li>
          <li>inflate confidence artificially</li>
          <li>chase motivation</li>
          <li>entertain students</li>
          <li>lower standards to keep comfort</li>
        </ul>
        <p>If that’s what you’re looking for, TT is not the right fit.</p>
      </>
    ),
  },
  {
    question: "Who is TT for, really?",
    answer: (
      <>
        <p>TT is for families who:</p>
        <ul>
          <li>respect discipline</li>
          <li>value structure</li>
          <li>understand that confidence is earned</li>
          <li>want capability that lasts</li>
        </ul>
        <p>Belonging signal:<br />
        “We don’t avoid pressure. We train for it.”</p>
      </>
    ),
  },
  {
    question: "How do we get started?",
    answer: (
      <>
        <p>Enrollment happens when readiness is clear.</p>
        <p>Pods are limited.<br />
        Standards are enforced.</p>
        <p>You don’t convince your way in.<br />
        You self-select.</p>
        <p>Students aren’t broken.<br />
        They’re untrained for pressure.</p>
        <p>We train the response.<br />
        Everything else follows.</p>
      </>
    ),
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">TT removes chaos until confidence has no choice but to appear.</h1>
      <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <details key={idx} className="bg-white rounded shadow p-4">
            <summary className="font-semibold cursor-pointer text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500">{faq.question}</summary>
            <div className="mt-2 text-gray-700 text-base">{faq.answer}</div>
          </details>
        ))}
      </div>
      <div className="mt-12 text-center rounded-xl p-6 sm:p-8" style={{ backgroundColor: "#FFF0F0" }}>
        <p className="text-base sm:text-lg font-semibold mb-1" style={{ color: "#1A1A1A" }}>Still have questions?</p>
        <p className="text-sm sm:text-base mb-4" style={{ color: "#5A5A5A" }}>Reach out directly and we'll respond with clarity.</p>
        <a
          href="mailto:admin@territorialtutoring.co.za"
          className="inline-block rounded-lg px-6 py-3 text-sm sm:text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#CC0000" }}
        >
          admin@territorialtutoring.co.za
        </a>
      </div>
    </div>
  );
}
