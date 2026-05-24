Build a responsive Marriage Biodata Maker web application.

Goal:
Create a free biodata maker where users can enter matrimonial details, see a live preview, clear the form, and download/print the final biodata.

Core Layout:
- Page title: "Begin Your Marriage Biodata"
- Subtitle explaining that the biodata preview updates live
- Two-column desktop layout:
  - Left: form sections
  - Right: live biodata preview
- Mobile layout:
  - Form first
  - Preview below
- Use clean modern UI with cards, rounded corners, soft borders, and Inter-style typography.

Form Sections:

1. Personal Details
Fields:
- First Name *
- Last Name *
- Gender *: Male, Female
- Date of Birth *
- Place of Birth
- Time of Birth: hour, minute, AM/PM
- Height *
- Marital Status *: Never Married, Divorced, Widowed, Separated
- Religion *
- Mother Tongue
- Community *
- Diet *: Veg, Non-Veg, Eggetarian, Vegan
- Complexion
- Living In *
- State / Province *
- City *

2. Education & Career
Fields:
- Highest Qualification *
- College Name *
- Work Sector *: Private, Government, Business, Defence, Not Working
- Job / Occupation *
- Company Name *
- Annual Income *

3. Family Details
Fields:
- Father's Name
- Father's Occupation
- Mother's Name
- Mother's Occupation
- Siblings field/support can be added optionally

4. Contact Information
Fields:
- Contact Number * with country code
- Email ID *
- Father's Contact Number
- Mother's Contact Number
- Address
- Show small consent text below contact section:
  "By entering your number, you agree to receive a WhatsApp message to help complete your biodata if you leave this page."

5. Photo Upload
Features:
- Allow user to upload profile photo
- Show uploaded image in preview
- If no image uploaded, show placeholder portrait
- Validate image type: jpg, jpeg, png, webp
- Optional max file size: 5MB

Live Preview:
- Preview must update instantly as user types
- Display full name at top
- Display DOB and uploaded photo
- Group details into sections:
  - Personal Details
  - Education & Career
  - Family Details
  - Contact Information
- Hide empty optional fields from preview
- Use elegant marriage biodata style with warm cream/gold theme
- Preview should fit A4-style export

Actions:
- Clear Form:
  - Resets all fields
  - Removes uploaded photo
  - Resets preview
- Preview and Download:
  - Validate required fields
  - If invalid, show inline errors
  - Generate downloadable PDF or printable biodata
  - Filename format: marriage-biodata-{firstName}-{lastName}.pdf

Validation:
- Required fields must show error message
- Email must be valid
- Phone number should accept digits only after country code
- DOB cannot be future date
- DOB should ensure user is at least 18 years old
- Trim whitespace before saving/exporting

Technical Requirements:
- Use React or Next.js
- Use TypeScript
- Use controlled form state
- Create reusable components:
  - AccordionSection
  - FormInput
  - FormSelect
  - PhoneInput
  - PhotoUpload
  - BiodataPreview
  - PreviewRow
- Store dropdown options in separate constants file
- Keep form model strongly typed
- No backend required for MVP
- Do not save user data unless explicitly implemented later
- Optional: persist draft in localStorage

Suggested Data Model:
```ts
type BiodataForm = {
  personal: {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    placeOfBirth?: string;
    timeOfBirth?: {
      hour?: string;
      minute?: string;
      meridiem?: "AM" | "PM";
    };
    height: string;
    maritalStatus: string;
    religion: string;
    motherTongue?: string;
    community: string;
    diet: string;
    complexion?: string;
    livingIn: string;
    state: string;
    city: string;
  };
  career: {
    highestQualification: string;
    collegeName: string;
    workSector: string;
    occupation: string;
    companyName: string;
    annualIncome: string;
  };
  family: {
    fatherName?: string;
    fatherOccupation?: string;
    motherName?: string;
    motherOccupation?: string;
  };
  contact: {
    countryCode: string;
    phone: string;
    email: string;
    fatherCountryCode?: string;
    fatherPhone?: string;
    motherCountryCode?: string;
    motherPhone?: string;
    address?: string;
  };
  photo?: string;
};

Example:

{
  "en": {
    "personalDetails": "Personal Details",
    "educationCareer": "Education & Career"
  },
  "te": {
    "personalDetails": "వ్యక్తిగత వివరాలు",
    "educationCareer": "విద్య & వృత్తి"
  },
  "hi": {
    "personalDetails": "व्यक्तिगत विवरण",
    "educationCareer": "शिक्षा और करियर"
  }
}

PDF Export Requirements:

PDF must support Indian language fonts.
Use Unicode-compatible fonts.
Ensure Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Gujarati, Punjabi, Odia, Assamese, and Urdu render correctly.
Urdu should support right-to-left rendering.

Optional Advanced Features:

Add “Translate my biodata” button.
Allow side-by-side preview:
English preview
Selected language preview
Allow download in:
English only
Regional language only
Bilingual format
Add transliteration support:
Example: “Pavan Kalyan” → “పవన్ కళ్యాణ్”
Allow users to manually edit translated values before final download.

Acceptance Criteria:

User can select an Indian language.
Form labels update immediately.
Preview updates in selected language.
PDF exports without broken characters.
Names/contact fields remain unchanged by default.
Dropdown values are translated correctly.
Urdu layout handles RTL text properly.



For Codex, tell it clearly: **“Do not rely only on browser default fonts for PDF export. Add proper Unicode font support for Indian scripts.”**