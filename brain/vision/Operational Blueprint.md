Platform Business Model Document
Version 1.0

1️⃣ BUSINESS TYPE
Model: <Math Pressure Response-Conditioning>
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

Automated payment processing via Stripe

No admin burden

Predictable monthly income per student

3️⃣ PRICING MODEL
Monthly subscription per student:
R1,000

Revenue split:

Tutor: R750

Platform: R250

Stripe fees (~3% + R2) deducted from tutor portion.

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
Stripe

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

Stripe webhook triggers backend.

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

Stripe transaction fees (deducted from tutor)

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

TERRITORIAL TUTORING 2-LAYER ONBOARDING SYSTEM 1️⃣ OVERVIEW We have two onboarding flows: Commercial Onboarding – Standard, paying parents immediately after proposal acceptance. Pilot Onboarding – Pilot program giving parents 9 free sessions before payment begins, structured for trials, demos, and conversion. Both flows share the same platform infrastructure (Stripe, app, Google Workspace, backend, pods), but differ in timing of payment and initial session assignment. 2️⃣ COMMERCIAL ONBOARDING FLOW Objective: Parent subscribes, pays, and enters full program immediately. Step-by-step: Parent Signup: Creates account in app (Parent enters gateway) Completes enrolment form Form Review: Admin/automation reviews form Parent accepted → proceed Tutor Assignment: Backend assigns tutor automatically based on availability, pod, student load Introductory Session Booking: Parent schedules first session with assigned tutor Google Meet link auto-generated via workspace account Recording enabled Intro Session: Tutor completes diagnostic report in app Triggers monthly proposal for 8 sessions via app Proposal Acceptance & Payment: Parent reviews proposal Accepts → Stripe payment triggered Payment confirms subscription Student Portal Access: Unique student access code generated Student account created Sessions scheduled automatically in backend (Parent leaves gateway) Operational Flow: Scheduling, session logging, and recording proceeds as usual Key Points: Payment begins after proposal acceptance Standard workflow for all commercial parents 3️⃣ PILOT ONBOARDING FLOW Objective: Encourage parent adoption via trial program, with 9 free sessions before payment starts. Step-by-step: Parent Signup: Creates account in app (Enters parent gateway) Completes enrolment form Form Review: Admin/automation reviews form Parent accepted → proceed Tutor Assignment: Backend assigns tutor automatically Parent notified Introductory Session Booking: Parent schedules intro session with tutor Google Meet link auto-generated Introductory Session: Tutor completes diagnostic report Triggers proposal for 8-session/month package Proposal visible to parent, but no payment required yet Parent accepts proposal Pilot Sessions Allocation: Backend schedules first 9 sessions free Student portal access code created (Parent leaves gateway) Sessions tracked independently Pilot Completion: After 9 sessions, backend triggers payment request Stripe subscription automatically starts Parent notified via app/email Standard operations resume for monthly subscription Key Points: 9 sessions are free → counted by backend Payment begins automatically after trial All automation and logging identical to commercial onboarding