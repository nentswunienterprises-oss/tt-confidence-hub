# TT Confidence Hub - Design Guidelines

## Design Philosophy
**"Build confidence first, grades follow naturally."**

The interface should feel warm, personal, and encouraging - like a mentor's workspace, not a corporate dashboard. Every interaction should reinforce confidence and progress.

## Color Palette

### Warm Earth Tones Foundation
- **Background**: Warm cream `#FAF7F2` - Main canvas, breathing room
- **Surface**: Light beige `#F5F1EC` - Card backgrounds, elevated surfaces
- **Border**: Soft tan `#E8E0D5` - Gentle separators
- **Divider**: Light beige `#EDE7DD` - Subtle divisions

### Typography Colors (Brown Hierarchy)
- **Primary Text**: Deep brown `#3D2E1F` - Headings, important content
- **Secondary Text**: Medium brown `#6B5A47` - Body text, descriptions
- **Tertiary Text**: Light brown `#9B8977` - Metadata, subtle information

### Confidence Orange (Primary Accent)
- **Primary**: Warm orange `#E67E22` - CTAs, progress, active states
- **Light**: Soft peach `#F39C6B` - Hover states, highlights
- **Subtle**: Pale orange `#FFF4E6` - Background tints, badges
- **Gradient**: `#E67E22` → `#F39C12` - Progress bars

### Semantic Colors
- **Success**: Warm green `#52A675` - Completed sessions, achievements
- **Warning**: Amber `#F39C12` - Attention needed
- **Error**: Soft red `#E74C3C` - Issues, alerts
- **Info**: Warm teal `#3498DB` - Information, notes

## Typography System

### Font Stack
**Primary:** Inter (via Google Fonts)
- Clean, modern, highly readable
- Warm when paired with brown colors
- Excellent for data-dense interfaces

### Type Scale & Hierarchy
- **Hero/Landing**: 2.5rem - 3rem (bold) - Confidence-building headlines
- **Page Titles**: 2rem - 2.5rem (semibold) - Dashboard headers
- **Section Headers**: 1.5rem - 1.75rem (semibold) - Card titles
- **Subsection**: 1.25rem (semibold) - Component headers
- **Body**: 1rem (regular) - Main content, descriptions
- **Small**: 0.875rem (regular) - Metadata, secondary info
- **Tiny**: 0.75rem (medium, uppercase) - Labels, badges

### Line Heights
- Headings: 1.25 (tight, impactful)
- Body: 1.625 (relaxed, readable)
- Data/Metrics: 1.375 (snug, efficient)

## Spacing System (Generous & Breathable)

### Spacing Scale
- **xs**: 8px - Tight internal spacing
- **sm**: 12px - Related elements
- **md**: 16px - Component padding
- **lg**: 24px - Section spacing
- **xl**: 32px - Major divisions
- **2xl**: 48px - Page sections

### Component Padding
- Cards: 24px (generous, comfortable)
- Buttons: 12px 24px
- Inputs: 12px 16px
- Containers: 16px mobile, 24px desktop

## Component Specifications

### Cards
```
Background: #F5F1EC (light beige)
Border: 1px solid #E8E0D5
Border Radius: 16px (generous rounding)
Padding: 24px
Shadow: 0 1px 3px rgba(61, 46, 31, 0.08)
Hover: 0 4px 12px rgba(61, 46, 31, 0.12)
```

### Buttons
**Primary (Confidence Orange):**
- Background: #E67E22
- Text: White
- Border Radius: 8px
- Padding: 12px 24px
- Hover: Slightly darker, subtle scale (1.02)

**Secondary:**
- Background: #F5F1EC (beige)
- Text: #3D2E1F (brown)
- Border: 1px solid #E8E0D5

**Ghost:**
- Background: Transparent
- Text: #6B5A47
- Hover: #F5F1EC background

### Badges/Pills (Status Indicators)
```
Background: #E67E22 (orange) for active
Border Radius: 24px (full pill)
Padding: 4px 12px
Font: 0.75rem, semibold, uppercase
Text: White
Variations: 
  - Active: Orange (#E67E22)
  - Pending: Amber (#F39C12)
  - Completed: Green (#52A675)
```

### Progress Bars (Dual Indicators)
```
Container:
  - Background: #EDE7DD (light tan)
  - Height: 8px
  - Border Radius: 4px
  
Fill:
  - Gradient: linear-gradient(90deg, #E67E22, #F39C12)
  - Smooth transition: 300ms ease
  
Labels:
  - Position: Above bar
  - Text: "5 of 9 completed" / "3/10"
  - Color: #E67E22 (orange numbers)
```

### Avatars (Profile Pictures)
```
Size: 48px - 64px standard
Border Radius: 50% (perfect circle)
Background (fallback): Soft pastels
  - Peach: #FFE5D9
  - Cream: #FFF4E6
  - Light orange: #FFE8D6
Border: 2px solid white (optional lift)
Initials: Bold, brown text
```

### Form Inputs
```
Background: White (#FFFFFF)
Border: 1px solid #E8E0D5
Border Radius: 8px
Padding: 12px 16px
Height: 44px minimum (touch-friendly)

Focus State:
  - Border: 2px solid #E67E22
  - Shadow: 0 0 0 3px rgba(230, 126, 34, 0.1)

Label:
  - Position: Above input
  - Font: 0.875rem, medium
  - Color: #3D2E1F
  - Margin: 0 0 8px
```

### Shadows (Warm & Soft)
Use brown-tinted shadows, not harsh black:
```
Low: 0 1px 3px rgba(61, 46, 31, 0.08)
Medium: 0 4px 12px rgba(61, 46, 31, 0.12)
High: 0 8px 24px rgba(61, 46, 31, 0.16)
Focus Ring: 0 0 0 3px rgba(230, 126, 34, 0.15)
```

## Layout Patterns

### Dashboard Grid
- Mobile: Single column (stack all)
- Tablet: 2 columns for stat cards
- Desktop: 3 columns max for data cards
- Gap: 24px between cards

### Navigation
**Mobile:**
- Top bar with hamburger
- Bottom tab bar for primary actions
- Fixed positioning

**Desktop:**
- Left sidebar (collapsible)
- Horizontal tab navigation within pages
- Sticky header

### Content Width
- Max width: 1400px
- Padding: 16px mobile, 24px desktop
- Center aligned with mx-auto

## Personality & Voice

### Tone Guidelines
✅ **DO:**
- Warm and encouraging
- Personal and direct
- Confidence-focused
- Use first names
- Celebrate progress

❌ **DON'T:**
- Corporate/formal
- Generic/impersonal
- Negative framing
- Technical jargon

### Copy Examples
**Greetings:**
- "Welcome back, Thendo! 🔥"
- "Great to see you, [Name]!"
- "You're making progress!"

**Encouragement:**
- "You're building confidence, one session at a time"
- "Keep showing up!"
- "Every session matters"
- "Transform confidence, change lives"

**Empty States:**
- "No sessions scheduled today. Take a breather!"
- "You don't have any students assigned yet. Check with your Territory Director."
- "Ready to start? Click below to log your first session."

**Progress:**
- "5 of 9 completed - you're over halfway!"
- "4 sessions remaining - keep it up!"
- "Confidence Level: 3/10 - growing stronger"

## Iconography

### Style & Usage
- Library: Lucide React (outline style)
- Color: Match text hierarchy
- Size: 20px - 24px typical, 16px for inline
- Stroke: 2px
- Use sparingly for clarity

### Common Icons
- User profile: User icon
- Sessions: Calendar icon
- Progress: TrendingUp icon
- Students: Users icon
- Documents: FileText icon
- Notifications: Bell icon
- Menu: Menu icon

## Animation Principles

### Timing
- Duration: 200ms - 300ms
- Easing: ease-in-out
- Stagger: 50ms between items in lists

### Use Cases
✅ **Animate:**
- Button hover states
- Card hover lift
- Page transitions (fade)
- Progress bar fills
- Modal open/close

❌ **Don't Animate:**
- Text changes
- Data updates (use instant swap)
- Continuous loops
- Scroll-triggered effects

## Mobile-First Principles

### Touch Targets
- Minimum: 44px x 44px
- Comfortable: 48px x 48px
- Spacing: 8px minimum between

### Priority Hierarchy
1. Current session status
2. Quick actions (log session)
3. Student overview
4. Navigation

### Gestures
- Swipe to navigate between tabs
- Pull to refresh data
- Tap to expand cards

## Accessibility

### Color Contrast
- Text on cream: WCAG AA minimum
- Orange buttons: AAA contrast
- All interactive elements: Clear focus states

### Keyboard Navigation
- Tab order logical
- Focus visible
- Skip links for main content

### Screen Readers
- Semantic HTML
- ARIA labels for icons
- Alt text for images
- Live regions for updates

## Data Visualization

### Metrics Display
**Large Numbers:**
- Font: 2.5rem - 3rem, bold
- Color: #3D2E1F (brown)
- Label below: 0.875rem, #6B5A47

**Progress Indicators:**
- Dual bars (Sessions + Confidence)
- Side-by-side layout
- Visual hierarchy through size

**Student Cards:**
- Avatar prominent
- Name bold, large
- Metadata smaller, lighter
- Progress bars with gradient

## Role-Specific Patterns

### Tutor Dashboard
- Personal greeting with emoji
- Session metrics prominent (7, 2, 0 layout)
- Student cards in grid
- Encouraging empty states

### TD Dashboard
- Pod overview cards
- Tutor profile list with photos
- Metrics summary at top
- Quick actions accessible

### COO Dashboard
- Application queue prominent
- Pod management interface
- System-wide metrics
- Broadcast center

## Responsive Breakpoints

```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: ≥ 1024px
```

### Adaptations
**Mobile:**
- Stack all cards
- Bottom navigation
- Simplified headers
- Touch-optimized

**Tablet:**
- 2-column grid
- Side navigation
- Expanded cards

**Desktop:**
- 3-column grid
- Full sidebar
- Hover interactions
- Dense data views

## Key Differentiators from Corporate UX

1. **Warm colors** instead of blue/purple tech palette
2. **Generous spacing** instead of dense layouts
3. **Personal copy** instead of generic labels
4. **Rounded shapes** instead of sharp corners
5. **Soft shadows** instead of flat design
6. **Encouraging tone** instead of neutral/formal
7. **Human touches** (photos, names) prominently displayed
8. **Progress celebration** instead of just data display
