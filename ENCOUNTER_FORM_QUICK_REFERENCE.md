# Encounter Form - Quick Reference

## What Changed

Your affiliate encounter form has been completely redesigned to capture all 9 key properties that define a successful parent interaction.

## The 9 Properties

### 1. **Parent Name** ⭐ (Required)
The primary contact person. This is mandatory to log an encounter.

### 2. **Date Met**
Calendar picker - defaults to today. Records exactly when the encounter occurred.

### 3. **Contact Method/Source**
Dropdown selection:
- Phone Call
- Direct Message
- Referral
- School Outreach
- Social Media
- Email
- In Person
- Other

### 4. **Discovery Outcome**
Text area for documenting parent pain points and needs:
- What challenges did they share?
- What are they struggling with?
- What did they admit or reveal?

### 5. **Delivery Notes**
Text area for how you positioned the solution:
- How did you explain TT's approach?
- What examples did you use?
- What resonated with them?

### 6. **Final Outcome**
Dropdown - the conclusion of the meeting:
- **Enrolled**: Parent ready to start with TT
- **Objected**: Parent declined/not interested
- **Follow Up Needed**: Still undecided, needs more info

### 7. **Result / Next Steps**
Action items and follow-up plan:
- When will you follow up?
- What information will you send?
- Any commitments made?

### 8. **Confidence Rating** (1-5)
Self-assessment of how the interaction went:
- 1 = Not confident at all
- 3 = Neutral
- 5 = Very confident this will convert

### 9. **My Thoughts / Reflection**
Personal learning and growth:
- What did you do well?
- What could you improve?
- Any insights for next time?

## Form Layout

The form is **expandable** - click the section header to show/hide it, keeping your dashboard clean.

### Organized in 4 Sections:
1. **Parent Information** - Name, email, phone
2. **Child Information** - Child's name and grade
3. **Encounter Details** - Date, contact method, discovery & delivery
4. **Meeting Outcome** - Outcome, confidence, next steps, and reflection

## How It Works

### When You Submit:
1. Your encounter is saved to the database
2. Parent info is stored (or updated if they already exist)
3. The status auto-sets based on final outcome
4. Achievement data is prepared for your performance dashboard
5. Your reflection becomes part of your coaching record

### What Happens Next:
- Encounters appear in your **Tracking** page
- Data feeds into **Performance Metrics**
- Your reflections help identify coaching opportunities
- Pattern analysis shows which techniques work best

## Tips for Great Entries

✅ **Do:**
- Be specific in discovery outcomes (actual pain points, not vague)
- Record delivery notes immediately after the call (memory fades!)
- Be honest in confidence ratings (helps identify where to get coaching)
- Reflect on what you can improve (growth mindset)
- Fill in next steps even for "objected" encounters (everyone's a future prospect)

❌ **Don't:**
- Leave fields blank - they're all helpful for analysis
- Use generic language ("went well", "talked about TT")
- Forget about the encounter - log it within 24 hours
- Be negative in reflections (this is a learning tool, not judgment)

## Database Changes

New columns in your encounters table:
- `date_met` - When you met
- `contact_method` - How you connected
- `discovery_outcome` - Their pain points
- `delivery_notes` - How you positioned us
- `final_outcome` - Enrolled/Objected/Follow-up
- `result` - Next steps
- `confidence_rating` - 1-5 self-assessment
- `my_thoughts` - Your reflection

## Running the Migration

```bash
npm run db:push
```

This will add all new columns to your database automatically.

## Support & Questions

The encounter data flows directly into:
- Your affiliate dashboard performance metrics
- Coaching feedback from your OD (Outreach Director)
- Performance reports
- Pattern analysis for strategy optimization
