Tutor Conditioning & Training Pathway to Certification
System-Driven Progression Engine
1. OBJECTIVE

Build a fully systemized tutor development engine where tutor progression is determined by measured alignment, not time served or manual judgment.

The system must condition tutors through doctrine + operations until certification standards are earned.

This mirrors TT-OS student progression:

👉 proof-based advancement
👉 repeated performance
👉 no subjective progression

2. CORE MODES
A. Applicant Mode

Status after signup + documentation completion.

Access:

onboarding docs
agreements
profile setup

No TT-OS access yet.

B. Training Mode

Access granted after documentation completion.

Purpose:
Tutor studies TT-OS modules and undergoes weekly battle tests.

Substates:

B1. Module 1 Training

Transformation Phases

B2. Module 2 Training

Session Infrastructure

C. Sandbox Mode

Unlocked after Module 1 completion.

Tutor gets fake parent/student accounts to learn live system operations.

Used concurrently with Module 2 training.

D. Certified Live Mode

Unlocked after all required modules complete.

Tutor eligible for real paid assignments/ real parents and students.

E. Watchlist Mode

Tutor active but flagged due to declining alignment.

Restrictions configurable.

F. Suspended Mode

Training or live access frozen.

(Modes no more dependent on coo control)

3. MODULE STRUCTURE
Module 1 — Transformation Phases

Deep dives:

Topic Conditioning
Clarity
Structured Execution
Controlled Discomfort
Time Pressure Stability
Module 2 — Session Infrastructure

Deep dives:

Intro Session Structure
Logging System
Session Context & Drill Flow
Drill Library
Handover Verification
Tools Required
4. CERTIFICATION MODEL

Each deep dive has two states:

A. Historical Certification State
In Progress
Completed

Completed when:

👉 3 consecutive battle test scores of 96+

B. Current Health State

Based on latest score:

Locked = 96–100
Watchlist = 90–95
Drift = <90
5. PROGRESSION RULES
Deep Dive Completion Rule

If a tutor scores 96+ three consecutive attempts on a deep dive:

Set:

completed = true
current_streak = 3
completed_at = timestamp
Streak Logic

If score >=96:

current_streak += 1
(max 3 for completion display, but raw streak may continue optionally)

If score <96:

current_streak = 0
Module Completion Rule

Module complete when all deep dives inside module have:

completed = true
Pathway Unlocks
Module 1 Complete

Unlock:

Sandbox Mode
Module 2 access
Module 2 Complete + Module 1 Complete

Unlock:

Certified Live Mode
Eligible for assignments
6. WEEKLY BATTLE TEST ENGINE
Purpose

System selects 2–3 deep dives per live audit session.

TD runs session. No manual topic choosing.

Selection Priority Logic

For each tutor, calculate priority score per deep dive.

Highest Priority Factors:
Not completed
Lowest streak
Recent fail/watchlist
Longest time since last tested
Optional random maintenance on completed dives
Output

Generate weekly assigned session:

Tutor A:
1. Clarity
2. Logging System
3. Controlled Discomfort


TD Dashboard

Button:

Run Weekly Tutor Audit/Battle Test
