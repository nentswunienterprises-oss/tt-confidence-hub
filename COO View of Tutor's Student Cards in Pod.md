COO View of Tutor's Student Cards in Pod Detail
In the Pod Detail page (/coo/pods/{podId}), the COO can expand each assigned tutor to see their student cards. This provides a hierarchical view:

Tutor Level: Shows certification status and student count
Student Level: Displays simplified cards with:
Student name and grade
Session progress (e.g., "Sessions this cycle: 3/8")
Action buttons: "Topic Conditioning" and "View Tracking Systems"
This gives the COO visibility into tutor workloads and student progress without needing to log in as each tutor.

Map Tab Intelligence
The "Map tab" refers to the tutor's operational view of student progress (as detailed in Transition_Engine_Breakdown.md). For each student, it shows:

Phase: Clarity → Structured Execution → Controlled Discomfort → Time Pressure Stability
Stability: Low/Medium/High/High Maintenance
Topic: Current focus area
Timestamp: Last updated
The COO sees this same intelligence through the pod detail view, allowing them to assess tutor effectiveness and student advancement across the entire pod.

Tracking Systems Integration
The "View Tracking Systems" button opens a comprehensive dialog with two main tabs:

Reports Tab (with sub-tabs):

Session Logs: Detailed deterministic logs showing what was trained, observed responses, performance results, and next moves
Weekly Reports: Aggregated progress summaries
Monthly Reports: Long-term trend analysis
Student Assignments Tab: Homework and practice assignments

This provides the COO with the same detailed student intelligence that tutors use for decision-making.

Gateway as Pre-Dashboard Filter
The gateway (/client/parent/gateway for parents, /operational/tutor/gateway for tutors) serves as a critical operational filter:

Prevents premature access: Users must complete onboarding steps before reaching the full dashboard
Standardizes entry: Ensures all users go through the same initial flow
Reduces support burden: Catches incomplete profiles before they cause issues
Enables progressive disclosure: Users only see what they're ready for
Traffic Sub-Tabs Structure
The Traffic page (/executive/hr/traffic or /executive/coo/traffic) organizes enrollment and application management:

Main Tabs:

Tutor Applications: Managing tutor onboarding
Parent Enrollments: Managing student enrollment pipeline
Tutor Applications Sub-tabs:

Pending: New applications
Approved: Ready for pod assignment
Rejected: Filtered out applications
Verify: Document verification (trial agreements, background checks)
Verified: Fully onboarded tutors

Parent Enrollments Sub-tabs:

Awaiting: Parents waiting for tutor assignment
Assigned: Matched with tutors, awaiting session booking
Active Pods: Currently in training cycles
Confirmed: Completed enrollment process
How This Makes Ops for COO
This architecture creates scalable oversight by:

Hierarchical Visibility: COO can drill down from pod → tutor → student without switching accounts
Standardized Intelligence: Same data tutors use for decisions is available to COO for quality assurance
Pipeline Management: Traffic tabs provide clear visibility into bottlenecks (e.g., too many awaiting assignments)
Quality Gates: Gateway prevents incomplete users from cluttering dashboards
Progressive Access: Users only access complexity they're prepared for
Accountability Loops: COO can verify tutors are using the same systems they monitor
The system ensures COO can maintain oversight without micromanaging, while tutors get the tools they need to execute effectively. The gateway acts as the first quality filter, Traffic manages the pipeline, and the pod detail/Map view provides operational intelligence.