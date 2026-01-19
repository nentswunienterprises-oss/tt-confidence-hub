# TT Media Portal — Usage Guide

## Access

Navigate to `/media` in the application.

## Carousel Creation Flow

### 1. Selection (4-Step Process)

No blank states. Only structured selection.

**Step 1: Pillar**
- Response Training
- Pressure Environment  
- Calm Execution
- Structure

**Step 2: Situation**
- Enrollment
- Onboarding
- Progress Update
- Exam Preparation
- Retention
- Referral

**Step 3: Audience**
- Parent (Decision maker, seeks relief)
- Student (Performer, needs structure)
- Tutor (Operator, executes system)

**Step 4: Platform**
- Instagram (Square/4:5)
- TikTok (9:16 vertical)

### 2. Carousel Editor

## Slide Types

### SLIDE 1 — THE CONFRONTATION (Hero Slide)

**Font:** Anton  
**Alignment:** Left, stacked  
**Structure:** Always vertical hierarchy

**Rules:**
- Only ONE word may be red
- Red = rupture point
- Red is never decorative
- Text feels compressed, not airy

**Example:**
```
THE
MOMENT        <-- This word is red
A STUDENT
ACTUALLY
FAILS
```

**Optional Iconography:**
- Single circular red button
- Right-facing arrow only
- Directional, not persuasive

### SLIDES 2–N — THE OBSERVATION

**Font:** Helvetica World / Inter  
**Alignment:** Center-left aligned block  
**Tone:** Declarative, observational, emotionless, calm

**Rules:**
- Max 2 sentences per slide
- No emphasis words
- No color changes
- No bolding for drama
- Short lines, controlled breaks

**Example:**
```
Most students don't fail the question.
They fail the moment when certainty disappears.
```

## Text Color Controls

### Available Colors (Locked)

1. **Dark (#1A1A1A)** — Default text
2. **Red (#E63946)** — Rupture point (slide 1 only)
3. **Light Pink (#FFF0F0)** — Subtle emphasis
4. **Cream (#FFF5ED)** — Background/reversal

### How to Apply Color

1. Select text in the Title or Body field
2. Click a color button
3. Text is wrapped with color tags: `<color:#E63946>WORD</color>`

### Removing Color

Click "Clear Formatting" button to remove all color tags from the active field.

## Spacing Controls

**Title Spacing:** 60–200px (line height)  
**Body Spacing:** 40–150px (line height)

Adjust with sliders for precise vertical rhythm.

Default:
- Slide 1 (Hook): Title 140px, Body 70px
- Slides 2+ (Observation): Title 75px, Body 65px

## Technical Format

Text with color is stored as:
```
THE\n<color:#E63946>MOMENT</color>\nA STUDENT\nACTUALLY\nFAILS
```

The canvas renderer parses these tags and applies the correct colors during rendering.

## Export

- **Download Slide:** Export current slide as PNG (1080x1080)
- **Download All:** Export all slides sequentially

## Locked Rules (Non-Negotiable)

✓ Fonts: Anton (slide 1), Helvetica World/Inter (slides 2+)  
✓ Colors: #FFF5ED, #E63946, #FFF0F0, #1A1A1A  
✓ Red only on slide 1  
✓ Only ONE word red per carousel  
✓ Max 2 sentences on observation slides  
✓ No creativity theater  
✓ No expressive freedom  

**If something violates these rules, it's not TT.**
