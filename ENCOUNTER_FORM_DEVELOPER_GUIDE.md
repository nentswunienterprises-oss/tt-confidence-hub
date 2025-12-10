# Encounter Form - Developer Implementation Guide

## System Architecture

```
User (Affiliate) 
    ↓
EncounterForm.tsx (React Component)
    ↓
POST /api/affiliate/encounters
    ↓
server/routes.ts (Express)
    ↓
server/storage.ts (logEncounter)
    ↓
Supabase Database
    ↓
encounters table
```

## File Structure

```
client/
  src/
    components/
      EncounterForm.tsx          ← NEW: Reusable form component
    pages/
      affiliate/
        affiliate/
          home.tsx              ← UPDATED: Now uses EncounterForm
          
shared/
  schema.ts                     ← UPDATED: Added 8 new columns & Zod validations
  
server/
  storage.ts                    ← UPDATED: logEncounter function
  
add_encounter_properties.sql    ← NEW: Database migration
ENCOUNTER_FORM_UPDATE.md        ← NEW: Full documentation
ENCOUNTER_FORM_QUICK_REFERENCE.md ← NEW: User guide
```

## Database Schema

### encounters Table - New Columns

```typescript
// Before (existing)
- id (Primary Key)
- affiliateId (Foreign Key)
- parentName (string, required)
- parentEmail (string, optional)
- parentPhone (string, optional)
- childName (string, optional)
- childGrade (string, optional)
- notes (text, optional)
- status (enum: "prospect" | "objected")
- createdAt (timestamp)
- updatedAt (timestamp)

// After (added)
+ dateMet (timestamp, optional)
+ contactMethod (varchar, optional)
+ discoveryOutcome (text, optional)
+ deliveryNotes (text, optional)
+ finalOutcome (varchar, optional)
+ result (text, optional)
+ confidenceRating (integer, optional)
+ myThoughts (text, optional)
```

### Migration SQL

File: `add_encounter_properties.sql`

```sql
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS date_met TIMESTAMP;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS contact_method VARCHAR(255);
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS discovery_outcome TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS final_outcome VARCHAR(255);
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS confidence_rating INTEGER;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS my_thoughts TEXT;
```

## API Endpoint

### POST /api/affiliate/encounters

**Request Body:**
```typescript
{
  parentName: string                // Required
  parentEmail?: string
  parentPhone?: string
  childName?: string
  childGrade?: string
  dateMet?: Date                   // ISO date string
  contactMethod?: string           // "phone" | "dm" | "referral" | etc.
  discoveryOutcome?: string
  deliveryNotes?: string
  finalOutcome?: string            // "enrolled" | "objected" | "follow_up_needed"
  result?: string
  confidenceRating?: number        // 1-5
  myThoughts?: string
  notes?: string                   // Legacy field
}
```

**Response:**
```typescript
{
  id: string
  affiliateId: string
  parentName: string
  // ... all fields echoed back
  status: "prospect" | "objected"  // Auto-set from finalOutcome
  createdAt: string
  updatedAt: string
}
```

**Status Code Mapping:**
- 200: Encounter created successfully
- 400: Validation error (missing required fields)
- 401: Unauthorized (not logged in)
- 500: Server error

## Component Usage

### Basic Implementation (home.tsx)

```tsx
import EncounterForm from "@/components/EncounterForm";

export default function AffiliateDashboard() {
  return (
    <div>
      {/* Other components */}
      <EncounterForm onSuccess={() => {
        // Optional callback after successful submission
        // Can be used to refetch stats, etc.
      }} />
    </div>
  );
}
```

### Component Props

```typescript
interface EncounterFormProps {
  onSuccess?: () => void;  // Called after successful submission
}
```

### Component Features

- **Expandable UI**: Click header to show/hide form
- **Form State Management**: Internal useState for form data
- **Mutation Handling**: Uses React Query useMutation
- **Error Handling**: Toast notifications on success/error
- **Auto-reset**: Form clears after successful submission
- **Responsive**: Grid layouts for mobile/tablet/desktop
- **Accessibility**: Proper labels, semantic HTML

## Validation Rules

Implemented in `shared/schema.ts` using Zod:

```typescript
insertEncounterSchema = createInsertSchema(encounters)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    parentName: z.string().min(1, "Parent name is required"),
    parentEmail: z.string().email().optional(),
    parentPhone: z.string().optional(),
    dateMet: z.date().optional(),
    contactMethod: z.string().optional(),
    discoveryOutcome: z.string().optional(),
    deliveryNotes: z.string().optional(),
    finalOutcome: z.string().optional(),
    result: z.string().optional(),
    confidenceRating: z.number().min(1).max(5).optional(),
    myThoughts: z.string().optional(),
  });
```

## Backend Logic

### logEncounter Function (storage.ts)

```typescript
async logEncounter(affiliateId: string, encounter: any): Promise<any> {
  const { data, error } = await supabase
    .from("encounters")
    .insert({
      affiliate_id: affiliateId,
      parent_name: encounter.parentName,
      parent_email: encounter.parentEmail || null,
      parent_phone: encounter.parentPhone || null,
      child_name: encounter.childName || null,
      child_grade: encounter.childGrade || null,
      date_met: encounter.dateMet || null,
      contact_method: encounter.contactMethod || null,
      discovery_outcome: encounter.discoveryOutcome || null,
      delivery_notes: encounter.deliveryNotes || null,
      final_outcome: encounter.finalOutcome || null,
      result: encounter.result || null,
      confidence_rating: encounter.confidenceRating || null,
      my_thoughts: encounter.myThoughts || null,
      notes: encounter.notes || null,
      status: encounter.finalOutcome === "objected" ? "objected" : "prospect",
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

**Key Logic:**
1. All fields optional except parentName (handled by schema)
2. Null coalescing for optional fields
3. Auto-set status: "objected" if finalOutcome is "objected", otherwise "prospect"
4. Returns the full created record

## Frontend Form Flow

### State Management
```typescript
const [expanded, setExpanded] = useState(false);
const [formData, setFormData] = useState({
  parentName: "",
  parentEmail: "",
  parentPhone: "",
  childName: "",
  childGrade: "",
  dateMet: new Date().toISOString().split("T")[0],
  contactMethod: "phone",
  discoveryOutcome: "",
  deliveryNotes: "",
  finalOutcome: "follow_up_needed",
  result: "",
  confidenceRating: 3,
  myThoughts: "",
});
```

### Form Submission Flow
1. User fills form fields
2. User clicks "Log Encounter" button
3. Form validates (Zod on backend)
4. POST request sent to `/api/affiliate/encounters`
5. On success:
   - Show success toast
   - Reset form to defaults
   - Collapse form
   - Call onSuccess callback
6. On error:
   - Show error toast with message
   - Keep form data for correction

## Testing

### Manual Testing Steps

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to affiliate dashboard:**
   - Go to `/affiliate/affiliate/home`

3. **Expand the encounter form:**
   - Click "Log New Encounter" header

4. **Fill in minimum data:**
   - Parent Name (required)
   - Leave others blank initially

5. **Submit:**
   - Click "Log Encounter"
   - Should see success toast
   - Form should collapse and reset

6. **Fill complete form:**
   - Fill all 9 fields
   - Submit again
   - Check database for complete record

### Database Verification

```sql
SELECT * FROM encounters 
WHERE affiliate_id = 'your-affiliate-id' 
ORDER BY created_at DESC 
LIMIT 1;
```

## Performance Considerations

- **Form submission**: Single POST request with all data
- **No polling**: Form doesn't auto-refresh
- **Debouncing**: Not needed (form submission only)
- **State**: Minimal, only form data + expanded state
- **Rendering**: Only re-renders on state changes

## Future Enhancements

1. **Encounter Editing:**
   - Add PATCH endpoint to update encounters
   - Modal or dedicated page for editing

2. **Encounter Viewing:**
   - Display encounter in Tracking page
   - Show all 9 fields in detail view

3. **Analytics Dashboard:**
   - Graph conversion rates by contact method
   - Track confidence rating trends
   - Reflection sentiment analysis

4. **Templated Reflections:**
   - Pre-built reflection prompts
   - Best practice suggestions
   - Coach feedback integration

5. **Encounter Templates:**
   - Save common discovery outcomes as templates
   - Reusable delivery positioning snippets
   - Next steps templates

6. **Integration with Leads/Closes:**
   - Link encounters to eventual leads
   - Link leads to closes
   - Show encounter→lead→close journey

## Debugging

### Common Issues

**Issue: Form not submitting**
- Check network tab for 401 (auth error)
- Verify affiliateId is being sent from context
- Check database has new columns

**Issue: Values not being saved**
- Check Supabase permissions for encounters table
- Verify row-level security policies
- Check types match schema (dates, numbers, etc.)

**Issue: Form shows errors**
- Check browser console for JS errors
- Look for validation errors in response
- Verify required fields are filled

### Debug Logging

Add to EncounterForm.tsx:
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Submitting encounter:", formData);
  logEncounterMutation.mutate(formData);
};
```

Add to server route:
```typescript
app.post("/api/affiliate/encounters", async (req, res) => {
  console.log("Encounter payload:", req.body);
  // ... rest of handler
});
```

## Documentation Files

- `ENCOUNTER_FORM_UPDATE.md` - Complete implementation overview
- `ENCOUNTER_FORM_QUICK_REFERENCE.md` - User guide for affiliates
- `ENCOUNTER_IMPLEMENTATION.md` - Additional implementation notes (if exists)
