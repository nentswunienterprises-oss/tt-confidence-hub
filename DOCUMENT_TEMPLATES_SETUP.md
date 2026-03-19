/* 
  DOCUMENT TEMPLATE SETUP GUIDE
  
  These are the 5 document templates needed for the sequential submission system.
  Each document should be customized with your organization's specific requirements.
*/

// ============================================
// 1. TUTOR_AGREEMENT.PDF
// ============================================
/*
Content should include:
- Title: "Territorial Tutoring - Tutor Agreement"
- Sections:
  1. Position & Responsibilities
     - Role as a Tutor
     - Student confidentiality
     - Attendance & punctuality
     - Preparation & professionalism
     
  2. Compensation & Payment
     - Payment amount per session
     - Payment schedule
     - Tax implications
     
  3. Code of Conduct
     - Professional behavior
     - Student interaction boundaries
     - Parent communication protocols
     
  4. Termination
     - At-will employment clause
     - Notice period
     
  5. Signature Section
     - Tutor name (printed)
     - Tutor signature
     - Date
     - Witness (optional)

Action: Create this PDF and save as "client/public/pdfs/Tutor_Agreement.pdf"
*/

// ============================================
// 2. CODE_OF_CONDUCT.PDF
// ============================================
/*
Content should include:
- Title: "Code of Professional Conduct"
- Sections:
  1. Professional Standards
     - Punctuality
     - Preparation
     - Communication quality
     
  2. Student Interaction
     - Respectful treatment
     - No discriminatory behavior
     - Age-appropriate interactions
     - Physical boundaries
     
  3. Confidentiality
     - Student information privacy
     - Family information confidentiality
     - No social media sharing
     
  4. Conflict Resolution
     - How to handle disagreements
     - Escalation procedures
     - Support available
     
  5. Acknowledgment
     - "I have read and understand..."
     - Signature line
     - Date

Action: Create this PDF and save as "client/public/pdfs/Code_of_Conduct.pdf"
*/

// ============================================
// 3. EMERGENCY_CONTACT_LIABILITY.PDF
// ============================================
/*
Content should include:
- Title: "Emergency Contact & Liability Waiver"
- Sections:
  1. Emergency Contact Information
     - Name
     - Phone number
     - Relation
     - Alternate contact
     
  2. Health Information (Optional)
     - Allergies
     - Medical conditions
     - Medications
     
  3. Liability Waiver
     - Acknowledgment of risks
     - Release of liability clause
     - Assumption of risk statement
     
  4. Background & Screening Consent
     - Consent to background check
     - Criminal record disclosure
     - Reference checks consent
     
  5. Signatures
     - Tutor signature
     - Witness (optional)
     - Date

Action: Create this PDF and save as "client/public/pdfs/Emergency_Contact_Liability.pdf"
*/

// ============================================
// 4. BACKGROUND_CHECK_AUTHORIZATION.PDF
// ============================================
/*
Content should include:
- Title: "Background Check Authorization Form"
- Sections:
  1. Authorization
     - Authorization to conduct background check
     - Release of information clause
     - Scope of check (criminal, employment, education)
     
  2. Applicant Information
     - Full legal name
     - Date of birth
     - Social security number (if applicable)
     - Previous addresses
     
  3. Disclosure
     - Do you have any criminal convictions? Yes/No
     - If yes, explain:
     - Have you ever been terminated? Yes/No
     
  4. Acknowledgments
     - Info is accurate and complete
     - Understand background check will be conducted
     - Understand I may be disqualified if issues found
     
  5. Signatures & Consent
     - Signature line
     - Date
     - Printed name

Action: Create this PDF and save as "client/public/pdfs/Background_Check_Authorization.pdf"
*/

// ============================================
// 5. TAX_INFORMATION_FORM.PDF
// ============================================
/*
Content should include:
- Title: "Tax Information & 1099 Form (US) or Tax Equivalent"
- Sections:
  1. Legal Information
     - Full legal name
     - Date of birth
     - SSN / Tax ID
     
  2. Address
     - Street address
     - City, state, zip
     
  3. Business Information (if applicable)
     - Business name
     - Business structure (sole proprietor, LLC, etc.)
     - EIN (if applicable)
     
  4. Banking Information (Optional - for direct deposit)
     - Bank name
     - Account type (checking/savings)
     - Routing number
     - Account number
     [NOTE: Should be encrypted if collected online]
     
  5. Tax Withholding
     - W-9 attachment / equivalent
     - State tax ID (if applicable)
     
  6. Certification
     - "I certify that the information..."
     - Signature
     - Date
     - Printed name

Action: Create this PDF and save as "client/public/pdfs/Tax_Information_Form.pdf"
*/

// ============================================
// ALTERNATIVE APPROACHES
// ============================================

/*
Option 1: Embedded Google Form
Instead of PDF, redirect to Google Form:

Modify: server/routes.ts in the download endpoint
app.get("/api/tutor/onboarding-documents/:docStep/download", ..., (req, res) => {
  const googleFormUrls = {
    1: "https://docs.google.com/forms/...",
    2: "https://docs.google.com/forms/...",
    // etc
  };
  res.redirect(googleFormUrls[docStep]);
});

In SequentialDocumentSubmission.tsx:
const handleDownloadTemplate = (docStep) => {
  window.open(`/api/tutor/onboarding-documents/${docStep}/download`);
};
*/

/*
Option 2: Fillable PDF Forms
Use tools like:
- PDF-Fill.com (create fillable forms)
- Acrobat Professional (create form fields)
- Canva (for design)
- Document software with form capabilities

This allows tutors to fill directly in the PDF before uploading.
*/

/*
Option 3: Custom React Component
For complex forms, create React components:

client/src/components/tutor/DocumentForms/TutorAgreementForm.tsx
- Build entire form in React
- Handle validation
- Generate PDF on submit
- Upload generated PDF

Then modify:
SequentialDocumentSubmission.tsx:
if (currentStep === 1) {
  return <TutorAgreementForm onSubmit={uploadMutate} />;
}
*/

// ============================================
// QUICK SETUP
// ============================================

/*
For development/testing quickly:
1. Create simple PDF files (even empty ones will work)
2. Save as: client/public/pdfs/[DocumentName].pdf
3. System will handle download/upload flow
4. Customize PDF content later

File names MUST be EXACT:
- Tutor_Agreement.pdf
- Code_of_Conduct.pdf  
- Emergency_Contact_Liability.pdf
- Background_Check_Authorization.pdf
- Tax_Information_Form.pdf

If files don't exist, endpoint returns 404 message prompting user to contact support.
*/
