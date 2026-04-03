From Low: 0-49 Low, 50-79 Medium, 80+ High
From Medium: 0-44 Low, 45-79 Medium, 80+ High
From High: 0-49 Medium, 50-84 High, 85+ High Maintenance
From High Maintenance: <60 High, 60-84 High Maintenance, 85+ phase progress

Quick behavior example:

Start at Clarity + Low, submit strong session:
Expect stability can become High.
Phase stays Clarity.
Next strong session from Clarity + High:
Expect stability becomes High Maintenance.
Phase still Clarity.
Next strong session from Clarity + High Maintenance:
Expect phase advances to Structured Execution.

Training drill scorer should now transitions High -> High Maintenance before any phase advance.
Only previous High Maintenance can trigger phase advance.

Low can jump to High.
If previous is High, next top outcome is High Maintenance (no phase move yet).
If previous is High Maintenance and performance is strong again, then phase progresses.

From Low: 0-49 Low, 50-79 Medium, 80+ High.
From Medium: 0-44 Low, 45-79 Medium, 80+ High.
From High: 0-49 Medium, 50-84 High, 85+ High Maintenance.
From High Maintenance: <60 High, 60-84 High Maintenance, 85+ phase progress.
So Medium remains the core bridge state between unstable and stable, while High Maintenance becomes the new gate before any phase advance.

Every training session, regardless of internal structure and sets, must resolve to one final normalized session score out of 100. That score is then passed into the transition engine together with the student’s previous stability state to determine the next state or phase progression.

Transition engine logic
INPUTS:
- previous_phase
- previous_stability
- session_total_out_of_100

OUTPUTS:
- next_phase
- next_stability
- transition_reason
Rules
From Low
0–49 → Low
50–79 → Medium
80–100 → High
From Medium
0–44 → Low
45–79 → Medium
80–100 → High
From High
0–49 → Medium
50–84 → High
85–100 → High Maintenance
From High Maintenance
0–59 → High
60–84 → High Maintenance
85–100 → Phase Progress
Phase progression rule

Critical:

Phase progression is only legal when previous stability = High Maintenance and current session total is 85+.

That means:

High can become High Maintenance
High cannot directly phase progress
only High Maintenance can phase progress

That should be hard-coded.

Best mental model

Think of it like this:

Low = unstable
Medium = bridge
High = stable
High Maintenance = stable under repeated confirmation
Phase Progress = permission to move forward

That’s a real conditioning ladder.

system logic is strong

This part is especially solid:

Low can jump to High
High cannot jump straight to phase progress
High must first become High Maintenance
Only High Maintenance can trigger phase advance

That creates a real gate.

It prevents:

one hot session from faking mastery
premature phase progression
unstable students being pushed forward too early

That’s disciplined.

What the /100 is doing

The session total is serving as the single normalized output that determines:

whether stability regresses
whether it remains
whether it advances
whether phase progression is allowed

So /100 is not arbitrary. It is the control scale for your transition engine.