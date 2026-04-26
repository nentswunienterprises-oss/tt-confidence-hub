# Transition Engine Outputs Breakdown

## Overview
This document provides a complete, unambiguous breakdown of the PodDigitizer transition logic engine outputs. It covers all phases, stability states, transitions, associated drills, and exactly what displays in each user interface component (tutor Map tab, session log, parent dashboard, weekly/monthly reports) for each phase+stability scenario. Areas of weakness and potential improvements are identified at the end.

## Phases in the System (4 Total)
The system defines four sequential phases for topic conditioning:

1. **Clarity** -Establish vocabulary, method, and reason through full 3-Layer Lens (modeling + vocabulary + reason + light apply)
2. **Structured Execution** -Force consistent step-by-step method execution structure without help
3. **Controlled Discomfort** -Introduce Boss Battles (uncertainty) while maintaining structure
4. **Time Pressure Stability** -Sustain structure under time constraint + begin cross-topic transfer preparation

## Stability States and Transitions (4 Levels)
The system uses four stability states that represent a student's consistency level:

- **Low** -Unstable, frequent breakdowns
- **Medium** -Bridge state, inconsistent execution
- **High** -Stable, meets threshold for repeatability check
- **High Maintenance** -Confirmed repeatable stability (gates phase advancement)

### Transition Rules (Based on Session Score 0-100)

| From State → | Score 0-49 | Score 50-79 | Score 80-100 |
|---------------|------------|-------------|--------------|
| **Low** | Remain Low | → Medium | → High |
| **Medium** | ↓ Low | Remain Medium | → High |
| **High** | ↓ Medium | Remain High | → **High Maintenance** |
| **High Maintenance** | ↓ High | Remain High Maintenance | → **Phase Progress** |

### Critical Gate Rule
Phase advancement is **only legal** when:
- Previous stability = High Maintenance **AND**
- Current session score ≥ 85

This means: High cannot directly advance phase. It must first reach High Maintenance.

## Drills by Phase and Stability State

### Clarity Phase
| Stability | Primary Drill | Primary Rules | Transition Focus |
|-----------|---------------|---------------|------------------|
| Low | Clarity drill | No Boss Battles, No time pressure, No layer skipping | Reinforce V/M/R basics |
| Medium | Clarity drill | Reduce explanation, Increase execution checks | Light independence attempts |
| High | Clarity High Maintenance drill | **Do NOT advance yet**, Prove repeatability | Reduce modeling, Independent attempts |
| High Maintenance | Structured Execution drill | **Move forward** | → Advances to Structured Execution |

### Structured Execution Phase
| Stability | Primary Drill | Primary Rules | Transition Focus |
|-----------|---------------|---------------|------------------|
| Low | SE drill | No time pressure, Boss Battles only if student starts | Force immediate starts, Strict steps |
| Medium | SE drill | Don't rush time pressure, Reinforce structure | Reduce modeling, Multiple problems |
| High | SE High Maintenance drill | **Do NOT advance yet** | Confirm repeatability across full set |
| High Maintenance | Controlled Discomfort drill | **Move forward** | → Advances to Controlled Discomfort |

### Controlled Discomfort Phase
| Stability | Primary Drill | Primary Rules | Transition Focus |
|-----------|---------------|---------------|------------------|
| Low | CD drill | No rescuing, No full explanations, No time pressure | Introduce uncertainty carefully |
| Medium | CD drill | Keep difficulty in, Don't over-guide | Push independent starts, Calm execution |
| High | CD High Maintenance drill | **Do NOT advance yet** | Confirm composed uncertainty response |
| High Maintenance | Time Pressure Stability drill | **Move forward** | → Advances to Time Pressure Stability |

### Time Pressure Stability Phase
| Stability | Primary Drill | Primary Rules | Transition Focus |
|-----------|---------------|---------------|------------------|
| Low | TPS drill | Don't push speed, Maintain process focus | Debrief, Re-anchor structure |
| Medium | TPS drill | Structure > speed, Method discipline | Reduce breakdowns, Full execution |
| High | TPS High Maintenance drill | **Do NOT declare transfer yet** | Confirm sustained skill under time |
| High Maintenance | TPS Maintenance drill | Avoid over-training, Begin cross-topic training | **Transfer Ready** (terminal state) |

## Engine Outputs by Phase + Stability Scenario

### Clarity + Low Scenario
**Tutor Map Tab**: Shows "Clarity" phase label, "Low" stability badge, topic name (e.g., "Fractions"), "Updated 2h ago"

**Session Log**: Shows Clarity observation categories (Vocabulary Precision, Method Recognition, Reason Clarity, Immediate Apply Response), auto-calculates score (e.g., "45/100"), projects "Remain Low"

**Parent Dashboard**: Shows "Your child is still building a clear understanding of this topic." with meaning "They are not yet fully comfortable with the terms, steps, or logic involved." and focus "We are rebuilding the foundation so they can clearly recognize and understand the problem."

**Weekly Report**: Auto-populates "Main Topics Covered: This week focused on building clarity in Fractions." and "The main challenge this week was regression in Fractions with low stability sessions."

**Monthly Report**: Aggregates "Response Pattern Trend: Regressing" and "Main Areas Covered: Building foundational clarity in Fractions."

### Clarity + Medium Scenario
**Tutor Map Tab**: Shows "Clarity" phase label, "Medium" stability badge, topic name, recent timestamp

**Session Log**: Shows Clarity observations, score (e.g., "72/100"), projects "Remain Medium"

**Parent Dashboard**: Shows "Your child is beginning to understand more clearly." with meaning "They can follow explanations but need reinforcement." and focus "We are increasing practice and independence."

**Weekly Report**: Auto-populates "What Improved: The student showed level gains in Fractions clarity." and "Student Response Pattern: improved independence"

**Monthly Report**: Aggregates "Skills That Became Stronger: Better recognition of Fractions concepts" and "Response Pattern Trend: Improving"

### Clarity + High Scenario
**Tutor Map Tab**: Shows "Clarity" phase label, "High" stability badge, topic name, recent timestamp

**Session Log**: Shows Clarity observations, score (e.g., "88/100"), projects "→ High Maintenance"

**Parent Dashboard**: Shows "Your child understands clearly now." with meaning "They can recognize problems and explain steps with confidence." and focus "We are moving into independent problem-solving."

**Weekly Report**: Auto-populates "What Improved: Strong clarity gains in Fractions." and "System Movement: The student moved from Clarity(Medium) to Clarity(High)."

**Monthly Report**: Aggregates "Skills That Became Stronger: Clear understanding of Fractions" and "Most Effective Intervention: Clarity drills"

### Clarity + High Maintenance Scenario
**Tutor Map Tab**: Shows "Clarity" phase label, "High Maintenance" stability badge, topic name, recent timestamp

**Session Log**: Shows Clarity observations, score (e.g., "91/100"), projects "Phase Progress → Structured Execution"

**Parent Dashboard**: Shows "Your child has sustained strong clarity." with meaning "They have held high performance consistently." and focus "We are transitioning to Structured Execution training."

**Weekly Report**: Auto-populates "Conditioning Progress: Fractions progressed from Clarity(High) to Structured Execution(Low)." and "Reinforcement Next Week: Run Structured Execution drill"

**Monthly Report**: Aggregates "Recurring Challenge: None - strong clarity maintained" and "Next Month Priority: Structured Execution in Fractions"

### Structured Execution + Low Scenario
**Tutor Map Tab**: Shows "Structured Execution" phase label, "Low" stability badge, topic name, recent timestamp

**Session Log**: Shows SE observations (Start Behavior, Step Execution, Repeatability, Independence Level), score (e.g., "38/100"), projects "Remain Low"

**Parent Dashboard**: Shows "Your child is learning to apply steps correctly." with meaning "They understand the topic but struggle with consistency alone." and focus "We are reinforcing step-by-step approach."

**Weekly Report**: Auto-populates "Main Breakdown: The main challenge was inconsistent execution in Fractions." and "Student Response Pattern: inconsistent execution"

**Monthly Report**: Aggregates "Response Pattern Trend: Stable" and "Recurring Challenge: Execution consistency"

### Structured Execution + Medium Scenario
**Tutor Map Tab**: Shows "Structured Execution" phase label, "Medium" stability badge, topic name, recent timestamp

**Session Log**: Shows SE observations, score (e.g., "65/100"), projects "Remain Medium"

**Parent Dashboard**: Shows "Your child is becoming more consistent at solving." with meaning "They follow the method in many cases with occasional lapses." and focus "We are increasing independent practice."

**Weekly Report**: Auto-populates "What Improved: Better consistency in Fractions execution." and "Boss Battle Summary: Introduced first uncertainty challenges"

**Monthly Report**: Aggregates "Skills That Became Stronger: Independent problem solving" and "Boss Battle Trend: Beginning exposure"

### Structured Execution + High Scenario
**Tutor Map Tab**: Shows "Structured Execution" phase label, "High" stability badge, topic name, recent timestamp

**Session Log**: Shows SE observations, score (e.g., "87/100"), projects "→ High Maintenance"

**Parent Dashboard**: Shows "Your child can solve problems consistently now." with meaning "They follow steps independently with minimal support." and focus "We are introducing challenging questions."

**Weekly Report**: Auto-populates "System Movement: Moved from SE(Medium) to SE(High)." and "Conditioning Progress: High stability achieved"

**Monthly Report**: Aggregates "Most Effective Intervention: Structured execution drills" and "Next Month Priority: Controlled discomfort introduction"

### Structured Execution + High Maintenance Scenario
**Tutor Map Tab**: Shows "Structured Execution" phase label, "High Maintenance" stability badge, topic name, recent timestamp

**Session Log**: Shows SE observations, score (e.g., "92/100"), projects "Phase Progress → Controlled Discomfort"

**Parent Dashboard**: Shows "Your child has sustained strong execution consistency." with meaning "They have held high quality across sessions." and focus "We are transitioning to Controlled Discomfort training."

**Weekly Report**: Auto-populates "Conditioning Progress: Fractions progressed to Controlled Discomfort(Low)." and "Reinforcement Next Week: Run Controlled Discomfort drill"

**Monthly Report**: Aggregates "Skills That Became Stronger: Consistent structured execution" and "Boss Battle Trend: Ready for increased difficulty"

### Controlled Discomfort + Low Scenario
**Tutor Map Tab**: Shows "Controlled Discomfort" phase label, "Low" stability badge, topic name, recent timestamp

**Session Log**: Shows CD observations (Boss Response, First-Step Control, Discomfort Tolerance, Rescue Dependence), score (e.g., "42/100"), projects "Remain Low"

**Parent Dashboard**: Shows "Your child is starting with more challenging problems." with meaning "They can solve basic problems but struggle when harder." and focus "We are staying calm and starting correctly."

**Weekly Report**: Auto-populates "Main Breakdown: Difficulty handling uncertainty in Fractions." and "Boss Battle Summary: 3 boss battles, mixed responses"

**Monthly Report**: Aggregates "Response Pattern Trend: Regressing" and "Recurring Challenge: Uncertainty tolerance"

### Controlled Discomfort + Medium Scenario
**Tutor Map Tab**: Shows "Controlled Discomfort" phase label, "Medium" stability badge, topic name, recent timestamp

**Session Log**: Shows CD observations, score (e.g., "68/100"), projects "Remain Medium"

**Parent Dashboard**: Shows "Your child is improving at handling difficult questions." with meaning "They work through unfamiliar problems with hesitation at times." and focus "We are increasing harder question exposure."

**Weekly Report**: Auto-populates "What Improved: Better composure under difficulty." and "Student Response Pattern: improved uncertainty response"

**Monthly Report**: Aggregates "Skills That Became Stronger: Handling challenging problems" and "Boss Battle Trend: Increasing success rate"

### Controlled Discomfort + High Scenario
**Tutor Map Tab**: Shows "Controlled Discomfort" phase label, "High" stability badge, topic name, recent timestamp

**Session Log**: Shows CD observations, score (e.g., "89/100"), projects "→ High Maintenance"

**Parent Dashboard**: Shows "Your child is handling difficult problems well." with meaning "They stay structured and solve unfamiliar problems with stability." and focus "We are preparing for time pressure."

**Weekly Report**: Auto-populates "System Movement: Moved from CD(Medium) to CD(High)." and "Boss Battle Summary: 5 boss battles, strong composure"

**Monthly Report**: Aggregates "Most Effective Intervention: Controlled discomfort drills" and "Next Month Priority: Time pressure introduction"

### Controlled Discomfort + High Maintenance Scenario
**Tutor Map Tab**: Shows "Controlled Discomfort" phase label, "High Maintenance" stability badge, topic name, recent timestamp

**Session Log**: Shows CD observations, score (e.g., "94/100"), projects "Phase Progress → Time Pressure Stability"

**Parent Dashboard**: Shows "Your child has sustained strong performance under challenge." with meaning "They have held high stability in difficult work." and focus "We are transitioning to Time Pressure Stability."

**Weekly Report**: Auto-populates "Conditioning Progress: Fractions progressed to Time Pressure Stability(Low)." and "Reinforcement Next Week: Run Time Pressure Stability drill"

**Monthly Report**: Aggregates "Skills That Became Stronger: Sustained performance under challenge" and "Boss Battle Trend: High success rate maintained"

### Time Pressure Stability + Low Scenario
**Tutor Map Tab**: Shows "Time Pressure Stability" phase label, "Low" stability badge, topic name, recent timestamp

**Session Log**: Shows TPS observations (Start Under Time, Structure Under Time, Pace Control, Completion Integrity), score (e.g., "45/100"), projects "Remain Low"

**Parent Dashboard**: Shows "Your child is learning to stay structured under time." with meaning "They can solve but lose structure against the clock." and focus "We are maintaining method while timed."

**Weekly Report**: Auto-populates "Main Breakdown: Structure loss under time pressure." and "Student Response Pattern: time pressure instability"

**Monthly Report**: Aggregates "Response Pattern Trend: Stable" and "Recurring Challenge: Time pressure structure"

### Time Pressure Stability + Medium Scenario
**Tutor Map Tab**: Shows "Time Pressure Stability" phase label, "Medium" stability badge, topic name, recent timestamp

**Session Log**: Shows TPS observations, score (e.g., "71/100"), projects "Remain Medium"

**Parent Dashboard**: Shows "Your child is becoming stable under time pressure." with meaning "They are improving ability to complete within time while structured." and focus "We are increasing timed practice."

**Weekly Report**: Auto-populates "What Improved: Better time pressure stability." and "Boss Battle Summary: Time pressure challenges introduced"

**Monthly Report**: Aggregates "Skills That Became Stronger: Structured completion under time" and "Boss Battle Trend: Time pressure adaptation"

### Time Pressure Stability + High Scenario
**Tutor Map Tab**: Shows "Time Pressure Stability" phase label, "High" stability badge, topic name, recent timestamp

**Session Log**: Shows TPS observations, score (e.g., "88/100"), projects "→ High Maintenance"

**Parent Dashboard**: Shows "Your child is performing consistently under time." with meaning "They solve accurately and maintain structure under timed conditions." and focus "We are maintaining and preparing for transfer."

**Weekly Report**: Auto-populates "System Movement: Moved from TPS(Medium) to TPS(High)." and "Conditioning Progress: Time pressure stability achieved"

**Monthly Report**: Aggregates "Most Effective Intervention: Time pressure drills" and "Next Month Priority: Transfer preparation"

### Time Pressure Stability + High Maintenance Scenario
**Tutor Map Tab**: Shows "Time Pressure Stability" phase label, "High Maintenance" stability badge, topic name, recent timestamp

**Session Log**: Shows TPS observations, score (e.g., "93/100"), projects "Transfer Ready"

**Parent Dashboard**: Shows "Your child has sustained top stability under time." with meaning "They consistently maintain structure and accuracy under timed conditions." and focus "We are maintaining and expanding transfer."

**Weekly Report**: Auto-populates "Conditioning Progress: Fractions reached Transfer Ready state." and "Reinforcement Next Week: Begin cross-topic transfer training"

**Monthly Report**: Aggregates "Skills That Became Stronger: Complete time pressure mastery" and "Boss Battle Trend: Sustained excellence"

## Areas of Weakness

1. **No Auto-Update of Phase in Student Record**: Phase advances display as recommendations but don't auto-save to database until next drill submission or explicit observation entry.

2. **No Drill Registry in Database**: Drill definitions are hardcoded in code; cannot configure per-phase drill parameters without code changes. No database tables for drills, observation blocks, or scoring rules.

3. **No Low-Streak Persistence**: Auto-regression counter resets if drills aren't submitted continuously; not persisted in database.

4. **No Cross-Topic Transfer Tracking**: System doesn't flag when High Maintenance in one topic could accelerate onboarding for similar topics.

5. **Partial Auto-Progression**: Logic exists to detect advancement conditions but doesn't automatically apply phase changes to the student record.

## Potential Improvements

1. **Database-Persisted Auto-Progression**: When session score ≥ 85 and previous stability = High Maintenance, automatically update phase in student record and notify tutor.

2. **Persistent Low-Streak Counter**: Store consecutive Low session count in database to maintain regression triggers across non-continuous drill submissions.

3. **Database Drill Registry**: Create `drills` table with drill_id, phase, stability_band, set structure (reps, rep type, difficulty), observation block IDs, scoring logic, state update rules.

4. **Cross-Topic Transfer Intelligence**: When topic reaches Time Pressure Stability + High Maintenance, flag similar topics for "accelerated onboarding" -skip Clarity, start in Structured Execution.

5. **Auto-Regression Safeguard**: Implement 3-strike regression where 3+ consecutive Low scores auto-regress stability by 1 level, persisted across sessions.

6. **Observation Block Configurability**: Move observation categories and scoring from hardcoded UI to database-configurable rules.

7. **Tutor Alert System**: Auto-notify tutors when: High Maintenance stability sustained 2+ sessions → "Ready to advance?", 3+ Low scores → "Consider regression check", New topic activated → Suggest entry phase based on topic similarity.

## Database Schema References

- **Proposal (diagnosis entry)**: `onboarding_proposals` -stores `topicConditioningTopic`, `topicConditioningEntryPhase`, `topicConditioningStability`
- **Live topic state**: `students.conceptMastery` JSONB with `topicConditioning.topics` map
- **Topic activations**: `topic_conditioning_activations` table
- **Reports**: `parent_reports` table
- **Auto-progression logic**: `server/routes.ts` lines 368-396
- **Auto-regression logic**: `server/routes.ts` lines 405-415
- **Deterministic reporting**: `server/routes.ts` lines 614-980+
- **Parent-facing indicators**: `client/src/pages/client/parent/dashboard.tsx` lines 65-230
- **Drill registry**: `client/src/components/tutor/IntroSessionDrillRunner.tsx` lines 1-50