current repo already has the right mental model:

workflow state on the student card
intro booking before intro diagnosis
active training after intro
drill runner as execution engine
backend scoring and deterministic state updates on submit

So Meet scheduling should wrap the drill flow, not replace it.

The clean architecture

Think in 3 layers:

1. Operational layer

This is the scheduling/compliance layer.

It answers:

when is the session
who is attending
what Meet link is used
was it recorded
did the tutor actually execute inside a valid scheduled session
2. Instruction layer

This is your existing drill/session selection layer.

It answers:

is this intro diagnosis, single drill, or training session
what topic(s) are being run
what phase/stability applies
what sets/reps/rules must execute

Your current app already does this. Intro diagnosis requires confirmed intro booking and a diagnostic topic. Active training then exposes Start Single Drill and Start Training Session. A training session is already a container that can hold multiple topic drills, while state movement still happens per topic drill.

3. Deterministic engine layer

This is your locked TT-OS runtime.

It answers:

what drill library applies
what observation blocks render
how scoring works
how phase/stability transitions occur
what deterministic reporting is produced

That engine is already phase/stability driven and uses diagnosis/training mode properly.

What changes now

Not the drill engine.

What changes is the entry gate into it.

Right now the tutor can conceptually do:

click student card
click Start Training Session
enter drill runner

Now that needs one extra operational condition:

A valid scheduled TT session must exist right now, or be explicitly attached, before the runner opens in live mode.

That’s it.

The right model
Existing concept

You already have:

Intro Booking
Intro Confirmed
Active Training
Add this underneath

A separate scheduled_session entity.

Not a new philosophical flow.
Just an operational object.

scheduled_session

Fields:

id
student_id
tutor_id
session_kind = intro | training
scheduled_start
scheduled_end
google_event_id
meet_url
recording_status
attendance_status
status = scheduled | live | completed | cancelled | flagged

Then optionally:

drill_session_id for training session container created when tutor starts
intro_run_id for intro diagnosis run
How it aligns to your current flows
A. Intro flow

Your repo already says:

assignment accepted
intro booking
intro confirmed
diagnostic topic added
tutor opens intro runner

So the new truth becomes:

assignment accepted
intro booking confirmed
backend creates TT Meet event
system stores scheduled_session(session_kind='intro')
tutor adds diagnostic topic
at session time, tutor clicks Join Intro Session
from that live session record, tutor clicks Open Intro Drill
intro drill submits as normal
submission is linked back to that scheduled session
Important

The booking flow already exists for intro.
You are not inventing one.
You are just making intro confirmation produce a real Meet session record.

B. Active training flow

This is where your repo currently has the gap.

Right now active training exposes:

Start Single Drill
Start Training Session from topic conditioning

That is good for drill execution, but weak for operational compliance because it is not tied to a scheduled TT-owned meeting.

So add a lightweight weekly scheduling layer before those buttons are truly usable live.

New training flow
parent confirms two weekly slots
backend creates two scheduled_session rows with TT Meet links
student card / tutor dashboard shows upcoming sessions
at scheduled time, tutor opens that session
inside that live session screen, tutor chooses:
Run Single Drill
Run Training Session

So the drill choice stays.
But it happens inside an active scheduled session envelope.

That preserves your current design.

The critical distinction your dev must understand
scheduled_session is not training_session

You already have a concept where a training session can contain multiple topic drills and the backend submits them together, but state movement is still per topic.

That means:

scheduled_session = operational calendar/compliance container
training_session = pedagogical container of one or more topic drills

These are not the same thing.

Example
Saturday 10:00–11:30 Meet call exists
→ that is scheduled_session

Inside that call, tutor selects:

Fractions
Algebraic expressions

Runs a multi-topic training session in the runner
→ that is training_session

Then submits drills
→ backend scores per topic and updates state as it already does

This separation keeps your repo clean.

What should happen in UI
Do not add “Book Session” inside drill runner

Never.

The drill runner should remain sacred:

sets
reps
rules
observations
submit

Nothing else. That is your TT-OS execution chamber.

Add a new wrapper screen

Call it something like:

Live Session Room


This sits between student card/dashboard and drill runner.

For intro

Student card shows:

Intro Confirmed
Join Meet
Open Intro Drill
For training

Student card/tutor schedule shows:

Next session time
Join Meet
Run Single Drill
Run Training Session
The real backend relationship

Here’s the exact model.

1. Scheduling creates the operational session

scheduled_session

2. Tutor joins and starts execution


link it to scheduled_session_id
3. Each topic drill is logged under that run

You already have per-topic drill logic.

So store:

scheduled_session_id
training_session_run_id
topic_id
phase_at_start
stability_at_start
drill payload
scoring result
resulting state
4. On submit

Your current backend keeps doing:

score drill(s)
update topic state
invalidate/refetch reports

But now also:

attach drill result to the scheduled Meet session
mark operational session completed
later reconcile recording
What the gate rules should be
Intro drill gate

Allow opening intro drill only if:

assignment accepted
intro booking status = confirmed
diagnostic topic exists
there is a live or scheduled intro session record attached

These repo rules already exist except the last one.

Training gate

Allow live training drill execution only if:

assignment accepted
student is in active training
there is an active or imminently scheduled training session record
tutor is launching from that session context

This is the real fix.

Why this is better than stuffing scheduling into the existing flow

Because your current drill UX is already sharp:

session mode can hold multiple topics
single drill mode stays single-topic
intro diagnosis remains separate
reporting already groups drill outcomes into session-level windows

If you force booking into that engine:

you pollute drill runner state
you mix compliance state with pedagogy state
you make deterministic reporting dirty
you create drift in TT-OS

Bad move.

Minimal flow map
Intro

Assignment Accepted
→ Intro Booking Confirmed
→ backend creates scheduled_session[intro]
→ tutor adds diagnostic topic
→ tutor opens live intro session
→ tutor opens intro runner
→ submit intro drill
→ intro state updates
→ scheduled session marked complete

Training

Active Training
→ weekly availability confirmed
→ backend creates two scheduled_session[training] rows
→ tutor opens upcoming session
→ joins Meet
→ chooses Single Drill or Training Session
→ runner executes as normal
→ submit drill(s)
→ state transitions + deterministic reports
→ recording reconciled against that scheduled session

The one thing you should rename mentally

When the tutor clicks Start Training Session today, it sounds like they are starting the whole real-world lesson.

But in the repo, that is actually:

Start drill container inside the lesson

That’s why this feels confusing.

So internally for devs, distinguish:

Lesson / scheduled session = real-world Meet lesson
Training session = multi-topic drill container inside that lesson

Once your dev sees that distinction, everything snaps into place.

The core lock is this:

Do not touch the drill engine logic.
Add a scheduled lesson wrapper around it.

Your current repo already separates:

workflow state on student card
intro booking before intro diagnosis
active training after intro
single drill vs training session
per-topic scoring and state movement on submit

So the implementation is:

Lesson scheduling + Meet + recording = outer shell
TT drill runner + scoring + state engine = inner core

REPO IMPLEMENTATION SPEC
1. Architectural rule

Add a new domain layer:

Scheduled Lesson = real-world TT lesson on Meet
Training Session Run = multi-topic drill container inside lesson
Drill Run = per-topic execution unit already aligned to your engine

This aligns with your current UX truth:

intro session is separate
single drill is one topic
training session is one container with multiple topic drills
state movement is still per drill/topic, not per lesson 

A. scheduled_lessons

This is the outer operational shell.

Purpose

Represents a TT-owned, scheduled Meet lesson tied to a tutor and student.

Fields
type ScheduledLesson = {
  id: string;
  studentId: string;
  tutorId: string;

  kind: "intro" | "training";
  workflowStage: "intro_booking" | "intro_confirmed" | "active_training";

  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;

  hostAccountId: string | null;
  googleCalendarId: string | null;
  googleEventId: string | null;
  googleMeetUrl: string | null;
  googleConferenceId: string | null;

  schedulingStatus:
    | "pending_confirmation"
    | "scheduled"
    | "ready"
    | "live"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "flagged";

  attendanceStatus:
    | "not_started"
    | "tutor_joined"
    | "student_joined"
    | "both_joined"
    | "no_show";

  recordingStatus:
    | "not_expected_yet"
    | "pending"
    | "found"
    | "missing"
    | "failed_lookup";

  recordingFileId: string | null;
  recordingDetectedAt: string | null;

  createdAt: string;
  updatedAt: string;
};
B. training_session_runs

This is the pedagogical container created when tutor clicks Start Training Session from inside a live lesson.

type TrainingSessionRun = {
  id: string;
  scheduledLessonId: string;
  studentId: string;
  tutorId: string;

  mode: "training_session";
  topicCount: number;

  startedAt: string;
  submittedAt: string | null;

  status: "in_progress" | "submitted" | "abandoned";

  createdAt: string;
  updatedAt: string;
};
C. drill_runs

This is the per-topic execution unit.

type DrillRun = {
  id: string;
  scheduledLessonId: string | null;
  trainingSessionRunId: string | null;

  studentId: string;
  tutorId: string;
  topicId: string;
  topicLabel: string;

  mode: "diagnosis" | "training" | "single_drill" | "session_topic";
  phaseAtStart: "Clarity" | "Structured Execution" | "Controlled Discomfort" | "Time Pressure Stability";
  stabilityAtStart: "Low" | "Medium" | "High" | "High Maintenance";

  drillPayload: any;
  scoreResult: any | null;
  stateTransitionResult: any | null;

  status: "in_progress" | "submitted" | "scored" | "failed";

  createdAt: string;
  updatedAt: string;
};
D. lesson_audit_logs

Operational and compliance events.

type LessonAuditLog = {
  id: string;
  scheduledLessonId: string;
  eventType: string;
  payload: any;
  createdAt: string;
};

Examples:

LESSON_CREATED
MEET_ATTACHED
LESSON_OPENED
DRILL_RUN_STARTED
DRILL_RUN_SUBMITTED
RECORDING_FOUND
RECORDING_MISSING

IMPORTANT NOTE: we actually already have types of scheduled_sessions = intro vs training

so instead of introducing scheduled_lessons you can either change current from scheduled_sessions to scheduled_lessons or keep current structure,... just don't mix or build on top of existing

What existing repo concepts remain unchanged

Do not change these:

IntroSessionDrillRunner.tsx
diagnosis vs training mode separation
phase/stability logic
observation scoring positional rules
training session multi-topic drill sequence
backend scoring and deterministic state update behavior

Your current core truth stays:

tutor runs structured observations
system scores drills
topic state updates from drill results
reporting groups drills into session windows later
4. Where to insert the new layer in the current UX
Current flow

Student card states:

Assignment Pending
Intro Booking
Intro Confirmed
Active Training
New repo behavior

Keep those states.
Under them, attach lesson state.

Example student card behavior
Assignment Pending

No changes.

Intro Booking

No Meet lesson yet until booking is confirmed.

Intro Confirmed

Show:

intro time
Join Meet
Open Intro Drill

Only allow Open Intro Drill from a valid intro lesson context.

Active Training

Show:

next 2 weekly scheduled lessons
Join Meet
Open Live Lesson
inside live lesson: Run Single Drill / Run Training Session

That means the tutor no longer launches training directly from the topic conditioning modal in live execution mode.
They launch it through the live lesson wrapper.

5. New UI surfaces to add
A. TutorLessonScheduleCard

New component on student card or tutor dashboard.

Shows
next lesson date/time
lesson kind
Meet readiness
recording status after completion
button: Join Meet
button: Open Lesson
B. LiveLessonRoom

This is the new wrapper page/modal.

Purpose

Operational shell around the existing drill flows.

Props
type LiveLessonRoomProps = {
  scheduledLessonId: string;
};
What it shows
student name
tutor name
scheduled time
lesson kind
Meet link
attendance state
recording required banner
allowed actions
Allowed actions by kind
If kind = intro
Open Intro Drill
If kind = training
Run Single Drill
Run Training Session

This preserves the current active training UX but relocates the launch point into a valid live lesson context. That fits your current distinction between single-drill and session mode without changing engine behavior.

C. LessonGateBanner

Display above runner when launched from lesson context:

Lesson ID
Scheduled time
Recording required
Meet-linked session active

No runner logic change. Just context display.

