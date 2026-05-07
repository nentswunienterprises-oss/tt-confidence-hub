TERRITORIAL TUTORING
Platform Business Model Document
Version 1.0

1️⃣ BUSINESS TYPE
Model: Online Tutoring Platform
Structure: Independent Contractor Marketplace
Positioning: Structured, systemised academic transformation platform

This is not a tutoring agency.

It is a platform that connects parents to independent tutors, standardises delivery, and automates operations.

Comparable structural models:

Uber

Bolt

Mr D

2️⃣ VALUE PROPOSITION
For Parents
Structured 8-session monthly program

Recorded sessions for safety

Standardised reporting

Reliable scheduling

Platform-level accountability

For Tutors (Independent Contractors)
Guaranteed student allocation

Automated scheduling

Automated payment processing via Payfast

No admin burden

Predictable monthly income per student

3️⃣ PRICING MODEL
Monthly subscription per student:
R1,000

Revenue split:

Tutor: R750

Platform: R250

Payfast fees (~3% + R2) deducted from tutor portion.

Platform keeps full R250.

4️⃣ UNIT ECONOMICS
Each tutor:

3 students

Platform earns: 3 × 250 = R750 per tutor

Pod structure:

12 tutors

36 students

Platform revenue per pod:

36 × 250 = R9,000/month

5️⃣ CORE INFRASTRUCTURE STACK
Payment Processing
Payfast

Card payments (Visa, Mastercard)

Webhooks for automation

No monthly fee

Session Hosting & Storage
Google Workspace
Business Standard Plan (~R288/user)

Structure:

4 tutors per workspace account

12 tutors per pod = 3 accounts

Workspace cost per pod = R864

Backend
Render hosting (~R150–R200)

Supabase database (~R90)

Backend shared across unlimited pods.

6️⃣ POD STRUCTURE
1 Pod =

12 tutors

3 students per tutor

36 students

288 sessions/month (36 × 8)

Concurrency handled via:
3 Google Workspace accounts per pod.

Infra cost per pod:
≈ R864/month

7️⃣ FINANCIAL SUMMARY PER POD
Total revenue collected:
36 × 1,000 = R36,000

Tutor payouts:
36 × 750 = R27,000

Platform revenue:
R9,000

Workspace cost:
R864

Net platform income before marketing/admin:
R8,136

Infra cost percentage:
~9.6%

Healthy margin.

8️⃣ OPERATIONAL FLOW (FULLY AUTOMATED)
Parent subscribes and pays.

Payfast webhook triggers backend.

Backend:

Assigns tutor

Creates recurring Google Calendar event

Generates Google Meet link

Sends emails to tutor + parent

Tutor delivers session.

Session recorded automatically.

Tutor logs session in app.

Data stored in database.

No human required in scheduling.

9️⃣ QUALITY CONTROL MODEL
Session recordings serve as:

Safety audit tool

Dispute resolution tool

Quality review system

Future AI Layer:

Transcription

Engagement tracking

Curriculum adherence scoring

Automated parent reports

Surveillance model:
Record everything.
Review only when necessary.

🔟 COST STRUCTURE
Fixed Costs (Per Pod):

Google Workspace: R864

Shared Fixed Costs:

Backend hosting

Database

Domain

Variable Costs:

Payfast transaction fees (deducted from tutor)

No payroll required for operations if automated.

1️⃣1️⃣ SCALABILITY MODEL
Pods are modular.

1 pod → R8,136 net
5 pods → ~R40,000 net
10 pods → ~R81,000 net

Backend can support multiple pods before scaling needed.

Growth lever:
Increase students per tutor from 3 → 4.

1️⃣2️⃣ RISK FACTORS
Primary Risks:

Student acquisition cost

Tutor churn

Session rescheduling complexity

Parent dissatisfaction

Legal classification of contractors

Infrastructure risk: Low
Human performance risk: Medium
Market risk: Variable

1️⃣3️⃣ LONG-TERM STRATEGIC POSITIONING
Phase 1:
Operational automation

Phase 2:
Standardised curriculum systems

Phase 3:
AI-assisted session analytics

Phase 4:
Data-driven student performance platform

1️⃣4️⃣ CORE OPERATIONAL IDENTITY
This business is:

Systems-driven

Process-standardised

Automation-led

Low-overhead

High-margin

Modular

Scalable

It is not personality-dependent.

It is infrastructure-dependent.

FINAL VERDICT
The model is:

✔ Structurally sound
✔ Financially healthy
✔ Lean
✔ Scalable
✔ Automation-compatible

Success depends on:

Execution discipline.
Tutor quality.
Student acquisition efficiency.

Not infrastructure.

see brand identity and vision at /vision.

TERRITORIAL TUTORING
TECHNOLOGY BLUEPRINT
Version 1.0
Tech Vision: Automation-First Education Infrastructure

1️⃣ TECHNOLOGY PHILOSOPHY
Territorial Tutoring is not a tutoring company with tech.

It is a technology platform that delivers tutoring.

Core principles:

Automation over manpower

Systems over supervision

Modular architecture (pod scalable)

Low fixed costs

Auditability (everything recorded/logged)

Platform independence (runs without founder presence)

2️⃣ SYSTEM ARCHITECTURE OVERVIEW
The system has 5 core layers:

Payment Layer

Orchestration Layer (Backend)

Session Layer

Data Layer

Intelligence Layer (Future AI)

3️⃣ PAYMENT LAYER
Provider:
Payfast

Responsibilities:
Process monthly subscriptions

Handle card payments

Trigger webhooks

Retry failed payments

Store payment status

Logic Flow:
Parent pays →
Payfast webhook →
Backend verifies →
Student activated →
Tutor assigned →
Sessions generated

Payfast is the financial gatekeeper of the system.

No payment → No session creation.

4️⃣ ORCHESTRATION LAYER (CORE BRAIN)
Hosted on:

Render (always-on backend)

Supabase (database)

This layer controls everything.

Responsibilities:
Authentication

Tutor assignment

Session scheduling

Google Calendar API integration

Email dispatch

Logging

Subscription validation

Pod management

This layer is deterministic.

No human intervention required.

5️⃣ SESSION LAYER
Powered by:

Google Workspace

Structure:

4 tutors per workspace account

3 accounts per 12-tutor pod

Workflow:
Backend creates:

Recurring Google Calendar event

Google Meet link auto-generated

Recording enabled by default

Shared with tutor + parent

Recording stored in central Drive.

No manual link creation.

6️⃣ DATA LAYER
Database: Supabase (PostgreSQL)

Stores:

Users (Parents, Tutors, Students)

Subscriptions

Session schedules

Session logs

Attendance data

Pod mapping

Tutor performance metrics

All state lives here.

This is the single source of truth.

7️⃣ AUTOMATION FLOW (END-TO-END)
Parent subscribes →
Payfast confirms →
Backend assigns tutor →
Recurring calendar event created →
Meet link generated →
Email dispatched →
Session recorded →
Tutor logs session →
Database updated →
Progress stored

Zero human scheduling.

8️⃣ POD SCALABILITY MODEL
Pod = 12 tutors

Each pod:

36 students

288 sessions/month

3 Google Workspace accounts

Pods are modular.

Adding a pod does not change system logic.

It only increases database entries.

Backend scales vertically when load increases.

No architectural redesign required.

9️⃣ SECURITY MODEL
Security Layers:

Payment validation before access

Google authentication for tutors

Session recording for safety

Access control via role-based permissions

Secure webhook verification

If dispute occurs:
Recording retrieved.
No guesswork.

🔟 OBSERVABILITY & AUDIT
System tracks:

Session completion rate

Missed sessions

Payment status

Tutor consistency

Student engagement (future)

Everything is timestamped.

No invisible activity.

1️⃣1️⃣ FUTURE INTELLIGENCE LAYER (PHASE 3+)
When scale justifies it:

Session recordings →
Speech-to-text transcription →
AI analysis →
Generate:

Tutor quality scores

Student engagement metrics

Automated parent reports

Curriculum coverage verification

This transforms platform into data-driven education system.

But not Phase 1 priority.

1️⃣2️⃣ TECHNOLOGY STACK SUMMARY
Frontend:

Web or App interface for:

Parent dashboard

Tutor dashboard

Backend:

Node/Express (or equivalent)

Hosted on Render

Database:

Supabase PostgreSQL

Payments:

Payfast

Sessions:

Google Workspace

Automation:

Direct API integration (no Zapier dependency)

1️⃣3️⃣ FAILURE POINT MITIGATION
Single Google account overload →
Solved via 4 tutors per workspace rule.

Payment failure →
Session generation paused.

Tutor inactivity →
System flags low completion rate.

Dispute →
Recording reviewed.

Backend crash →
Render auto-restart.

System designed to degrade gracefully, not collapse.

1️⃣4️⃣ PERFORMANCE TARGETS
Uptime: 99%+
Session generation latency: <5 seconds
Webhook processing: <3 seconds
Database response time: <200ms

System must feel instant.

1️⃣5️⃣ TECH VISION STATEMENT
Territorial Tutoring aims to become:

A modular, automation-driven education platform
Where delivery is standardised
Operations are systemised
Quality is auditable
And growth is infrastructure-based, not personality-based.

The long-term competitive advantage:

Data + Automation + Low Fixed Cost Structure.

FINAL ASSESSMENT
This blueprint is:

Lean
Realistic
Technically feasible
Financially aligned
Scalable
Not over-engineered

It avoids:

Over-automation too early
Tool dependency
Payroll dependency
Complex infrastructure

It is disciplined.

TERRITORIAL TUTORING
2-LAYER ONBOARDING SYSTEM
1️⃣ OVERVIEW
We have two onboarding flows:

Commercial Onboarding – Standard, paying parents immediately after proposal acceptance.

Pilot Onboarding – Pilot program giving parents 9 free sessions before payment begins, structured for trials, demos, and conversion.

Both flows share the same platform infrastructure (Payfast, app, Google Workspace, backend, pods), but differ in timing of payment and initial session assignment.

2️⃣ COMMERCIAL ONBOARDING FLOW
Objective: Parent subscribes, pays, and enters full program immediately.

Step-by-step:

Parent Signup:

Creates account in app
(Parent enters gateway)

Completes enrolment form

Form Review:

Admin/automation reviews form

Parent accepted → proceed

Tutor Assignment:

Backend assigns tutor automatically based on availability, pod, student load

Introductory Session Booking:

Parent schedules first session with assigned tutor

Google Meet link auto-generated via workspace account

Recording enabled

Intro Session:

Tutor completes diagnostic report in app

Triggers monthly proposal for 8 sessions via app

Proposal Acceptance & Payment:

Parent reviews proposal

Accepts → Payfast payment triggered

Payment confirms subscription

Student Portal Access:

Unique student access code generated

Student account created

Sessions scheduled automatically in backend

(Parent leaves gateway)

Operational Flow:

Scheduling, session logging, and recording proceeds as usual

Key Points:

Payment begins after proposal acceptance

Standard workflow for all commercial parents

3️⃣ PILOT ONBOARDING FLOW
Objective: Encourage parent adoption via trial program, with 9 free sessions before payment starts.

Step-by-step:

Parent Signup:

Creates account in app
(Enters parent gateway)

Completes enrolment form

Form Review:

Admin/automation reviews form

Parent accepted → proceed

Tutor Assignment:

Backend assigns tutor automatically

Parent notified

Introductory Session Booking:

Parent schedules intro session with tutor

Google Meet link auto-generated

Introductory Session:

Tutor completes diagnostic report

Triggers proposal for 8-session/month package

Proposal visible to parent, but no payment required yet

Parent accepts proposal

Pilot Sessions Allocation:

Backend schedules first 9 sessions free

Student portal access code created

(Parent leaves gateway)

Sessions tracked independently

Pilot Completion:

After 9 sessions, backend triggers payment request

Payfast subscription automatically starts

Parent notified via app/email

Standard operations resume for monthly subscription

Key Points:

9 sessions are free → counted by backend

Payment begins automatically after trial

All automation and logging identical to commercial onboarding

4️⃣ COMPARATIVE TABLE
Feature	Commercial Onboarding	Pilot Onboarding
Payment Start	After parent accepts proposal	After first 9 sessions
Intro Session	Same	Same
Diagnostic Report	Tutor creates → proposal triggers	Tutor creates → proposal triggers
Student Portal Access	After proposal acceptance	Immediately after intro session
Session Scheduling	Immediately	9 free sessions tracked in backend
Automation Needed	Scheduler, link creation, email, Payfast	Scheduler, link creation, email, Payfast + trial counter
Risk Mitigation	Payment confirmed before student starts	Backend ensures trial limit is enforced; no early charges
5️⃣ BACKEND LOGIC / TECH REQUIREMENTS
Common Requirements:
Payfast webhook integration

Google Workspace API for link generation

Session logging via app

Pod management system

Additional Logic for Pilot:
Trial Session Counter: Tracks 9 sessions per student

Payment Trigger: Payfast subscription auto-start after trial sessions

Notification System: Sends automated reminders when trial nearing completion

Access Control: Student portal active during trial but flagged as “trial”

Automation:
Entire flow fully automated: tutor receives session link, parent receives notifications, sessions logged automatically, trial counter updated by backend.

No human intervention required for scheduling or trial management.

6️⃣ OPERATIONAL NOTES
Tutor’s job: teach, log session, complete diagnostic report.

Parent’s job: accept proposal (commercial) or start pilot (pilot).

System: handles scheduling, link creation, logging, trial tracking, payment triggering.

Reporting: All sessions recorded → can be analyzed later via AI or admin dashboards.

7️⃣ STRATEGIC INSIGHTS
Pilot onboarding encourages adoption without upfront commitment.

Commercial onboarding is for parents ready to pay immediately.

Both flows standardize processes → independent contractor model scales efficiently.

Trial sessions tracked automatically → reduces human admin costs.

Diagnostic + proposal ensures quality control before commercial payment begins.