# Tech Update: Last 7 Days

Here’s the clean version of what moved over the last week.

## Big picture

This week was mostly about tightening the operational core:

- parent enrollment got smarter and more topic-specific
- tutor diagnosis and session prep got much closer to the real live flow
- parent-facing training and reporting views were rewritten to read more cleanly
- COO assignment and onboarding surfaces got cleaned up
- the affiliate / EGP track expanded a lot, including onboarding, gateway, crews, and landing work

There was also a lot of system-hardening underneath that, especially around route rules, eligibility, onboarding acceptance, and state handling.

## 1. Parent enrollment and intake got reworked

The biggest enrollment shift was moving away from blended symptom capture.

Now the system is set up around topic-by-topic intake:

- parents add a topic
- they map symptoms for that topic
- if they add another topic, that topic gets its own symptom mapping too

Why that matters:

- diagnosis recommendations can now be tied to a real topic instead of a mixed blob
- tutor pre-session intelligence can read cleaner topic-specific signals
- COO can review a more useful intake trail

Other related changes:

- fallback symptom options were added like `None of the above` and `I don't know / Not sure`
- old enrollment sections were reordered and cleaned up
- duplicate symptom-mapping headings were removed
- legacy symptom packaging got handled so older enrollments still display intelligibly

## 2. Parent views were tightened a lot

The parent proposal / training-plan side got a major copy and structure cleanup.

The main goal was to stop exposing engine logic too directly and make the output read like a clear parent-facing interpretation instead.

That included:

- removing repetitive state phrasing
- simplifying the live training plan structure
- splitting single-topic vs multi-topic handling more cleanly
- documenting the exact output rules and matrices

On the reporting side, weekly and monthly reports were also rebuilt around a tighter structure:

- less duplication
- clearer state movement + behavior shift language
- capped signal counts
- more explicit output matrices and docs

## 3. Tutor diagnosis and live session flow got much stronger

A lot of work went into diagnosis-first behavior and session flow realism.

Main improvements:

- diagnosis-first topic entry was enforced
- adaptive intro diagnosis flow was implemented
- diagnosis transition reasoning was clarified
- handover verification drill flow was added
- unknown-topic prep state was clarified
- training mode and drill launch behavior were loosened where needed

There was also a steady effort to make demo and prep surfaces match the real runner:

- logging system demo prep was aligned closer to live runner behavior
- result screens were matched to the real flow
- prep modals and deep dives were cleaned up
- diagnosis demo screens were added and refined

So overall, the tutor-side experience moved away from “demo-ish” and closer to “this behaves like the actual live system.”

## 4. COO assignment and traffic surfaces got cleaned up

COO traffic and pod-assignment UX improved in a few important ways:

- traffic badges and action labels were refined
- parent enrollment cards in COO traffic were redesigned into clearer review cards
- in-pod quick assignment cards were brought into the same design language
- pod assignment rules were tightened server-side
- tutor reassignment was adjusted to preserve training state

There was also cleanup around onboarding review:

- COO onboarding review UI was simplified
- onboarding field-source rules were hardened
- upload evidence retention improved in review flows

## 5. Tutor onboarding moved deeper into the app

Tutor onboarding got a serious pass this week.

The flow moved more fully into in-app acceptance and review, with a lot of polish around:

- onboarding reader behavior
- accepted copy generation / export
- upload state handling
- metadata display
- mobile layout
- document wording and formatting
- action feedback and pending-review state

This was not just UI polish. It also included schema alignment and rule hardening so the onboarding flow behaves more consistently end to end.

## 6. Affiliate / EGP work expanded a lot

A big chunk of the week also went into the affiliate / EGP track.

New or expanded areas included:

- affiliate gateway flow
- affiliate application form work
- affiliate landing page updates
- OD encounters and new crews work
- EGP onboarding document set
- EGP certified ID step
- EGP gateway flow
- public tracking support

This looks like the start of a much more complete affiliate / EGP operational lane rather than scattered experiments.

## 7. Communications, notifications, and portal cleanup

A quieter but important set of changes landed around communication quality:

- reply references were added to communications
- inbox refresh and unread handling were tightened
- parent communication resolution bugs were fixed
- swipe / unread UX was improved
- push notification branding and opt-in behavior were refined

Portal cleanup also happened:

- tutor portal routes were canonicalized
- double-header and layout wrapping issues were fixed
- loading states were improved

## 8. Docs and internal clarity improved

A lot of supporting docs were added or expanded this week too, especially around:

- live training view rules
- weekly / monthly report output matrices
- feedback-driven fixes
- EGP initiative materials

That matters because a lot of the recent work was not just “build a feature,” but “lock the output contract so the system stays consistent.”

## Practical summary

If I had to describe the week in one line:

We moved several key surfaces from loosely connected UI + logic into more explicit operational systems.

The clearest examples are:

- topic-specific parent intake
- diagnosis-first tutor flow
- stricter parent report structure
- cleaner COO assignment review
- stronger in-app onboarding

So the week was less about flashy new end-user features and more about making the core system behave like one coherent machine.
