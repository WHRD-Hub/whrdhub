import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "WHRD-Hub-UAT-Worksheet.xlsx");

// ─── Colour palette ──────────────────────────────────────────────────────────
const C = {
  purple:     "5B21B6",
  purpleL:    "EDE9FE",
  orange:     "EA580C",
  orangeL:    "FEF3C7",
  green:      "15803D",
  greenL:     "DCFCE7",
  blue:       "1D4ED8",
  blueL:      "DBEAFE",
  red:        "991B1B",
  redL:       "FEE2E2",
  pink:       "BE185D",
  pinkL:      "FCE7F3",
  teal:       "0369A1",
  tealL:      "E0F2FE",
  grey:       "374151",
  greyL:      "F9FAFB",
  white:      "FFFFFF",
  border:     "E5E7EB",
  amber:      "92400E",
  amberL:     "FFFBEB",
};

// ─── Style helpers ───────────────────────────────────────────────────────────
function font(bold, sz, color = C.grey, name = "Calibri") {
  return { bold, sz, color: { rgb: color }, name };
}
function fill(rgb) {
  return { fgColor: { rgb }, patternType: "solid" };
}
function border(color = C.border) {
  const s = { style: "thin", color: { rgb: color } };
  return { top: s, bottom: s, left: s, right: s };
}
function align(h = "left", v = "top", wrap = true) {
  return { horizontal: h, vertical: v, wrapText: wrap };
}

function hdr(text, bgRgb, fontRgb = C.white, sz = 11) {
  return {
    v: text, t: "s",
    s: { font: font(true, sz, fontRgb), fill: fill(bgRgb), alignment: align("center", "center"), border: border(bgRgb) },
  };
}
function cell(text, opts = {}) {
  const {
    bold = false, sz = 10, fg = C.grey, bg = C.white,
    h = "left", v = "top", wrap = true, italic = false,
  } = opts;
  return {
    v: text ?? "", t: "s",
    s: {
      font: { ...font(bold, sz, fg), italic },
      fill: fill(bg),
      alignment: align(h, v, wrap),
      border: border(),
    },
  };
}
function statusCell(text) {
  const map = {
    PENDING:  { bg: C.purpleL, fg: C.purple },
    PASS:     { bg: C.greenL,  fg: C.green  },
    FAIL:     { bg: C.redL,    fg: C.red    },
    BLOCKED:  { bg: C.orangeL, fg: C.amber  },
    "N/A":    { bg: C.greyL,   fg: C.grey   },
  };
  const { bg, fg } = map[text] ?? { bg: C.greyL, fg: C.grey };
  return { v: text, t: "s", s: { font: font(true, 10, fg), fill: fill(bg), alignment: align("center", "center"), border: border() } };
}
function sectionHdr(label, color = C.purple) {
  return { v: label, t: "s", s: { font: font(true, 12, C.white), fill: fill(color), alignment: align("left", "center"), border: border(color) } };
}
function noteCell(text) {
  return { v: text, t: "s", s: { font: font(false, 9, C.teal), fill: fill(C.tealL), alignment: align("left", "top", true), border: border(C.teal) } };
}
function warnCell(text) {
  return { v: text, t: "s", s: { font: font(false, 9, C.amber), fill: fill(C.amberL), alignment: align("left", "top", true), border: border(C.orange) } };
}
function emptyComment() {
  return { v: "", t: "s", s: { fill: fill("FFFBEB"), alignment: align("left", "top", true), border: { top: { style: "dashed", color: { rgb: "FCD34D" } }, bottom: { style: "dashed", color: { rgb: "FCD34D" } }, left: { style: "dashed", color: { rgb: "FCD34D" } }, right: { style: "dashed", color: { rgb: "FCD34D" } } } } };
}

// ─── Worksheet builder ───────────────────────────────────────────────────────
function ws() {
  const data = [];
  const merges = [];
  let r = 0;

  function push(row) { data.push(row); r++; }
  function blank(n = 1) { for (let i = 0; i < n; i++) push([]); }
  function merge(rs, re, cs, ce) { merges.push({ s: { r: rs, c: cs }, e: { r: re, c: ce } }); }

  // ── Cols: ID | Description | Steps | Expected | Result | Comments
  const COL_WIDTHS = [12, 38, 58, 42, 11, 36];

  // ═══════════════════ COVER ═══════════════════
  push([hdr("WHRD Hub — Reporting Platform", C.purple, C.white, 18)]);
  merge(r-1, r-1, 0, 5);
  push([hdr("User Acceptance Testing (UAT) Worksheet", C.purple, C.white, 13)]);
  merge(r-1, r-1, 0, 5);
  blank();
  push([
    cell("Prepared by:", { bold: true }), cell("Oliver Wainaina"), cell(""),
    cell("Platform:", { bold: true }), cell("WHRD Hub"), cell(""),
  ]);
  push([
    cell("Date:", { bold: true }), cell("27 June 2026"), cell(""),
    cell("Environment:", { bold: true }), cell("Staging"), cell(""),
  ]);
  push([
    cell("Version:", { bold: true }), cell("1.0.0-staging"), cell(""),
    cell("Document Status:", { bold: true }), cell("In Review"), cell(""),
  ]);
  blank();
  push([warnCell("CONFIDENTIAL · INTERNAL USE ONLY · Do not share outside the test team.")]);
  merge(r-1, r-1, 0, 5);
  blank(2);

  // ═══════════════════ LEGEND ═══════════════════
  push([sectionHdr("Result Legend", C.grey)]);
  merge(r-1, r-1, 0, 5);
  push([
    statusCell("PENDING"), cell("Test not yet executed"),
    statusCell("PASS"), cell("Test passed"),
    statusCell("FAIL"), cell("Test failed — log in Defect Log"),
    statusCell("BLOCKED"),
  ]);
  push([
    cell(""), cell(""),
    cell(""), cell(""),
    cell(""), cell("N/A — Not applicable for this environment"),
  ]);
  blank(2);

  // ═══════════════════ SECTION HEADER ROW helper ═══════════════════
  function section(num, title, tag, color = C.purple) {
    push([sectionHdr(`Section ${num} — ${title}`, color)]);
    merge(r-1, r-1, 0, 4);
    push([cell(tag, { bold: true, sz: 9, fg: C.white, bg: color })]);
    merge(r-1, r-1, 0, 5);
    blank();
  }

  function tableHdr() {
    push([
      hdr("ID",          C.grey, C.white, 10),
      hdr("Test Case",   C.grey, C.white, 10),
      hdr("Steps to Execute", C.grey, C.white, 10),
      hdr("Expected Outcome", C.grey, C.white, 10),
      hdr("Result",      C.grey, C.white, 10),
      hdr("Comments / Bug Notes", C.grey, C.white, 10),
    ]);
  }

  function tc(id, desc, steps, expected, status = "PENDING") {
    push([
      cell(id,       { bold: true, fg: C.purple, sz: 10 }),
      cell(desc,     { bold: false, sz: 10 }),
      cell(steps,    { sz: 10 }),
      cell(expected, { sz: 10 }),
      statusCell(status),
      emptyComment(),
    ]);
  }

  function subHdr(label, tagColor = C.purpleL, tagFg = C.purple) {
    blank();
    push([cell(label, { bold: true, sz: 11, fg: tagFg, bg: tagColor })]);
    merge(r-1, r-1, 0, 5);
    tableHdr();
  }

  function infoRow(text, color = C.tealL, fg = C.teal) {
    push([{ v: text, t: "s", s: { font: font(false, 9, fg), fill: fill(color), alignment: align("left", "top", true), border: border(color) } }]);
    merge(r-1, r-1, 0, 5);
  }

  // ═══════════════════ S1 — PREREQUISITES ═══════════════════
  section("1", "Prerequisites & Staging Setup", "⚠ Read before testing begins", C.orange);
  infoRow("⚠  STAGING ENVIRONMENT NOTICE: Google OAuth requires each tester's Gmail to be allowlisted in Supabase. Send your Gmail address to oliverwai9na@gmail.com with subject 'WHRD Hub UAT Access Request' and wait for confirmation before testing the Google flow. Email/Password and Anonymous flows require no pre-registration.", C.amberL, C.amber);
  blank();
  push([
    cell("Item", { bold: true, bg: C.greyL }), cell("Detail", { bold: true, bg: C.greyL }),
    cell(""), cell(""), cell(""), cell(""),
  ]);
  const prereqs = [
    ["Staging URL", "Shared by Oliver via WhatsApp/email before testing. Do not share publicly."],
    ["Google OAuth access", "Send Gmail address to oliverwai9na@gmail.com — Oliver adds it to Supabase allowlist."],
    ["Admin credentials", "Request separately from Oliver. Not self-service."],
    ["Email/Password", "Self-register on the staging site — no pre-setup needed."],
    ["Anonymous flow", "No setup needed — open the site and click 'Report now'."],
    ["Test data", "Use fictional names, 'Nairobi' as location, placeholder images for screenshots."],
    ["Devices", "Test on: Desktop Chrome, Desktop Firefox, Mobile Safari (iPhone), Mobile Chrome (Android)."],
    ["Browser min. versions", "Chrome 120+, Safari 17+, Firefox 121+, Edge 120+."],
  ];
  prereqs.forEach(([k, v]) => {
    push([cell(k, { bold: true }), cell(v), cell(""), cell(""), cell(""), cell("")]);
  });
  blank(2);

  // ═══════════════════ S2 — FORM FIELDS REFERENCE ═══════════════════
  section("2", "Report Form Fields — Reference Guide", "Field glossary — read before testing report form", C.pink);

  const fieldHdr = () => push([
    hdr("Field", C.pink, C.white, 10),
    hdr("English Label", C.pink, C.white, 10),
    hdr("Swahili Label", C.pink, C.white, 10),
    hdr("What It Means", C.pink, C.white, 10),
    hdr("Required?", C.pink, C.white, 10),
    hdr("Validation", C.pink, C.white, 10),
  ]);

  function fieldRow(field, en, sw, desc, req, val) {
    push([
      cell(field, { bold: true, sz: 10 }),
      cell(en, { sz: 10 }),
      cell(sw, { sz: 10 }),
      cell(desc, { sz: 10 }),
      cell(req, { bold: req === "YES", fg: req === "YES" ? C.red : C.grey, sz: 10 }),
      cell(val, { sz: 10, fg: C.teal }),
    ]);
  }

  infoRow("SECTION 1 — ABOUT THIS REPORT", C.pinkL, C.pink);
  fieldHdr();
  fieldRow("Reporting For", "Who are you reporting for?", "Unaripoti kwa ajili ya nani?",
    "Who the report is on behalf of. 'A child' and 'My community' map internally to 'Someone else' but flag the case differently for case workers. Child reports trigger child-protection routing.",
    "No (defaults to Myself)", "Pill selection — tap/click to select");
  fieldRow("Violence Type", "Where did the violence happen?", "Unyanyasaji ulitokea wapi?",
    "Online = digital platforms. Physical = in-person GBV. Both = combined. Selecting Online or Both reveals the TFGBV evidence section (Section 4). This is the most critical routing field.",
    "YES", "Must select one before submit; red error if skipped");

  blank();
  infoRow("SECTION 2 — WHAT HAPPENED", C.pinkL, C.pink);
  fieldHdr();
  fieldRow("Description", "Tell us what happened", "Tuambie kilichotokea",
    "Free-text narrative — the core of the report. No medical or legal language required. Case workers read this first to assess severity and required support type.",
    "YES", "Minimum 20 characters. Live counter shows 'X/20 min'. Red border + red error text on submit if too short.");
  fieldRow("When", "Approximately when?", "Siku gani?",
    "Date of the incident. Approximate is fine — reporters do not need to know exact date.", "No", "Date picker; cannot be future date");
  fieldRow("County / Region", "County / Region", "Kaunti / Mkoa",
    "Geographic location of incident. Used for the admin map and aggregate statistics. Covers all 47 Kenyan counties plus 'Other / Outside Kenya'.",
    "YES", "Dropdown — must select. Red border + error if skipped on submit.");
  fieldRow("Location (optional)", "Location (optional)", "Mahali (Hili sio swali la lazima)",
    "More specific than county — e.g. 'home', 'workplace', 'Westgate Mall'. Never shown on public maps.", "No", "Free text, no restriction");
  fieldRow("Is Ongoing", "This is still happening", "Hii bado inaendelea",
    "Checkbox. Flags the case as active — affects urgency prioritisation in the admin queue.", "No", "Checkbox toggle");
  fieldRow("GPS (auto-captured)", "(not shown to user)", "—",
    "Browser geolocation captured silently on form load. Used ONLY for anonymised map visualisation. Not linked to identity. A green notice appears if captured successfully.",
    "No", "Browser permission prompt appears once. User can deny.");

  blank();
  infoRow("SECTION 3 — WHO DID THIS (fully optional)", C.pinkL, C.pink);
  fieldHdr();
  fieldRow("Perpetrator Type", "Who did this? (Nani alitenda tendo hili?)", "Ni nani aliyefanya hivi?",
    "Pill selection. Options: Government/Police, Partner/Spouse, Family member, Employer/Colleague, Stranger/Online group, Unknown. When selected, a detail text box appears for optional extra info.",
    "No", "Pill toggle. Text box appears on selection, disappears on deselect.");

  blank();
  infoRow("SECTION 4 — ONLINE EVIDENCE (TFGBV) — only visible when Violence Type = Online or Both", C.pinkL, C.pink);
  fieldHdr();
  fieldRow("Platform", "Platform", "Jukwaa",
    "The digital platform where abuse occurred. 12 options: Facebook, Twitter/X, Instagram, WhatsApp, TikTok, YouTube, Telegram, LinkedIn, Snapchat, Email, SMS, Other.",
    "No", "Dropdown");
  fieldRow("Link", "Link to the content (optional)", "Kiungo cha maudhui (Hili sio swali la lazima)",
    "URL to the offending post, profile, or message. Helps case workers find and document evidence before deletion.",
    "No", "URL input — must start with https://");
  fieldRow("Screenshots", "Upload screenshots (optional)", "Pakia picha za skrini (Hili sio swali la lazima)",
    "Up to 10 image files (JPEG, PNG, PDF). Max 5 MB each. Stored securely, only viewable by authorised case workers. Upload available for signed-in users.",
    "No", "Max 10 files; each max 5 MB; JPEG/PNG/PDF only; individual remove buttons");

  blank();
  infoRow("SECTION 5 — SUPPORT NEEDED", C.pinkL, C.pink);
  fieldHdr();
  fieldRow("Support Type", "Type of support needed", "Aina ya msaada unaohitajika",
    "Multi-select pills. Legal support, Medical care, Counselling, Digital security, Safe shelter, Referral, Other. Selecting Other reveals a text box. Multiple options can be selected simultaneously.",
    "No", "Multi-select pills; Other reveals text box");
  fieldRow("Urgency", "How urgent is your situation?", "Hali yako ni ya haraka kiasi gani?",
    "Three full-width buttons: 'I am in danger right now' (red), 'This week, help soon' (normal), 'No rush, documenting' (grey). Sets case priority in admin queue.",
    "No (defaults to 'This week')", "Single selection; red button for immediate danger");
  fieldRow("Consent to Contact", "I am okay with being contacted by a WHRD Hub defender", "Ninakubali kuwasiliana na mtetezi wa WHRD Hub",
    "Checkbox. When ticked, two fields appear: preferred contact method (Phone/WhatsApp/Email/SMS) and contact details. Without consent, defenders cannot proactively reach out.",
    "No", "Checkbox; fields appear dynamically on check");

  blank();
  infoRow("SECTION 6 — ACCOUNT (shown to anonymous/unauthenticated users ONLY)", C.pinkL, C.pink);
  fieldHdr();
  fieldRow("Auto Username Notice", "(display only)", "—",
    "Informational: a unique username is auto-generated (e.g. 'brave-shield-k4x2'). Reporter does not choose it.", "N/A", "Display only");
  fieldRow("Password", "Create a password (minimum 8 characters)", "Weka nywila (angalau herufi 8)",
    "The ONLY credential for the account. No email is linked. No password reset exists. An amber warning box emphasises this — reporters must write it down.",
    "YES (anonymous only)", "Min 8 chars; red error if too short; show/hide toggle");

  blank();
  infoRow("REPORTING FOR SELF vs OTHERS — Key Differences", C.blueL, C.blue);
  push([
    hdr("Scenario", C.blue, C.white, 10), hdr("What Changes in the Report", C.blue, C.white, 10),
    hdr("Case Worker Handling", C.blue, C.white, 10), cell(""), cell(""), cell(""),
  ]);
  [
    ["Myself", "Standard flow. Reporter IS the victim. Contact consent applies to reporter directly.", "Case worker communicates directly with reporter."],
    ["Someone else", "Same UI. Logged as third-party report. Contact details reach a proxy.", "Verification of victim consent may be needed."],
    ["A child", "Mapped internally to 'someone_else'. Child-protection flag set in admin view.", "Child safeguarding protocol applies. Case elevated."],
    ["My community", "Mapped to 'someone_else'. For community health workers reporting patterns.", "May be aggregated, not individual case-managed."],
  ].forEach(([s, w, c]) => push([cell(s, { bold: true }), cell(w), cell(c), cell(""), cell(""), cell("")]));
  blank(2);

  // ═══════════════════ S3 — ANONYMOUS ═══════════════════
  section("3", "Anonymous User Flow", "No account required — full flow from landing to onboarding");

  subHdr("3.1 — Landing Page Navigation", C.purpleL, C.purple);
  tc("AN-001", "Landing page loads correctly",
    "1. Open the staging URL in browser\n2. Observe the page fully loads",
    "Logo, nav bar with 'Report now' button, hero section, safety banner, and emergency strip all visible. No console errors.");
  tc("AN-002", "Language auto-detect on load",
    "1. Note your browser language setting\n2. Load the staging URL\n3. Observe the language shown in the globe icon in the nav",
    "If browser is set to SW/FR/PT/DE/AR, page renders in that language. English or unsupported → defaults to English.");
  tc("AN-003", "'Report now' CTA in nav",
    "1. Click the purple 'Report now' button in the top-right navigation bar",
    "Navigates to /report. Report form page loads with heading and all sections visible.");
  tc("AN-004", "'Make a report' hero CTA",
    "1. Click the white 'Make a report' button in the hero section",
    "Navigates to /report. Same as AN-003.");
  tc("AN-005", "Emergency strip phone links",
    "1. Scroll to the red emergency strip at the bottom\n2. Tap/click 'Police: 999'",
    "Device prompts to call 999 (mobile) or opens tel: link (desktop). GBV Helpline and Childline links behave the same.");

  subHdr("3.2 — Report Form Validation", C.purpleL, C.purple);
  tc("AN-010", "Submit with no fields filled",
    "1. Navigate to /report\n2. Scroll to bottom\n3. Click 'Submit report securely' without filling anything",
    "3 red inline errors: 'Please select where the violence happened' (Violence Type), 'Please describe what happened (0/20…)' (Description), 'Please select a county' (County). Page does NOT navigate away.");
  tc("AN-011", "Violence type = Online → reveals evidence section",
    "1. Click the 'Online' pill in Section 1\n2. Observe the form",
    "Pill turns purple with check icon. 'Online evidence' card (Section 4) appears with Platform, Link, and Screenshots fields.");
  tc("AN-012", "Violence type = Physical → evidence section hidden",
    "1. Click 'Physical / In person' pill\n2. Observe form",
    "The 'Online evidence' card is NOT shown. Only 4 main cards visible.");
  tc("AN-013", "Description character counter",
    "1. Click into the description textarea\n2. Type 5 characters\n3. Observe below the textarea",
    "Grey hint shows '5/20 min'. Counter increments as characters are typed. At 20+ characters, hint disappears.");
  tc("AN-014", "Description error clears on typing",
    "1. Click submit (triggers errors)\n2. Note the red description error\n3. Type 20+ characters into description",
    "Red error under description disappears as soon as 20 characters are reached.");
  tc("AN-015", "County dropdown selection",
    "1. Click the county dropdown\n2. Select 'Nairobi'",
    "Dropdown closes, 'Nairobi' shown. County error (if present) clears immediately.");
  tc("AN-016", "Perpetrator type pill + detail field",
    "1. In Section 3, click 'Partner / Spouse' pill\n2. Type 'John Doe' in the detail field\n3. Click the pill again to deselect",
    "Pill selects (purple + check). Detail text input appears. On deselect, input disappears.");
  tc("AN-017", "Support type multi-select",
    "1. Click 'Legal support'\n2. Click 'Counselling'\n3. Click 'Other'\n4. Observe the text box",
    "All three pills show check icons simultaneously. 'Other' text area appears on selection.");
  tc("AN-018", "Urgency — immediate danger",
    "1. Click 'I am in danger right now' (top urgency button)",
    "Button turns red. Other two revert to default styling. Only one urgency selectable at a time.");
  tc("AN-019", "Consent to contact — field reveal",
    "1. Check 'I am okay with being contacted'\n2. Observe below",
    "Two fields appear: contact method dropdown (Phone/WhatsApp/Email/SMS) and contact detail input.");
  tc("AN-020", "Password too short — error",
    "1. Type 'abc123' (6 chars) in password field\n2. Click submit",
    "Red error: 'Password must be at least 8 characters.' Form does not submit.");
  tc("AN-021", "Password show/hide toggle",
    "1. Type a password\n2. Click the eye icon on the right",
    "Password toggles between dots and visible text. Icon changes between eye and eye-off.");

  subHdr("3.3 — Account Generation & Successful Submission", C.purpleL, C.purple);
  tc("AN-030", "Successful anonymous submission",
    "1. Set Violence type = Online\n2. Description = 'Test incident for UAT purposes in Nairobi county.' (40+ chars)\n3. County = Nairobi\n4. Password = 'TestPass123'\n5. Click 'Submit report securely'",
    "Button shows spinner 'Submitting…'. After 2–4 seconds, navigates to /report/success with green check, 'Report received' heading, and credentials reminder.");
  tc("AN-031", "Auto-login after anonymous submission",
    "1. After AN-030, observe the success page\n2. Note the credentials section",
    "Success page says 'You are already signed in'. User is logged in automatically — no separate login needed.");
  tc("AN-032", "'Go to your dashboard' button",
    "1. On success page, click 'Go to your dashboard'",
    "Navigates to /dashboard. User is already signed in. Dashboard shows one report and credentials card.");
  tc("AN-033", "Credentials shown on dashboard",
    "1. On dashboard, locate 'Your login credentials' card\n2. Note username and email\n3. Click copy button next to email",
    "Username (e.g. brave-shield-k4x2) and email (username@whrdhub.local) shown. Copy button copies email to clipboard.");
  tc("AN-034", "Sign out and sign back in as anonymous",
    "1. Sign out from dashboard\n2. Go to /auth/login\n3. Enter the username (NOT the email) and password chosen in AN-030\n4. Click 'Log In'",
    "Successfully signs in. Redirected to dashboard. Report from AN-030 visible in report list.");
  tc("AN-035", "Wrong password — error message",
    "1. At login, enter correct username but wrong password\n2. Click 'Log In'",
    "Red error: 'Incorrect username/email or password.' No redirect.");

  subHdr("3.4 — Anonymous User Onboarding", C.purpleL, C.purple);
  tc("AN-040", "Onboarding triggered on first dashboard visit",
    "1. After AN-031 (auto-logged in after submission)\n2. Navigate to /dashboard",
    "If onboarding not yet completed, user is redirected to /onboarding before seeing the dashboard.");
  tc("AN-041", "Role selection on onboarding",
    "1. On /onboarding, observe the role cards\n2. Click 'WHRD' card",
    "Card highlights (selected state). 'Admin' and 'WHRD' are the two options. Selecting one enables the Continue button.");
  tc("AN-042", "Terms & conditions accordion",
    "1. On onboarding, locate the T&C section\n2. Click each accordion item to expand",
    "Each accordion section opens to reveal policy text.");
  tc("AN-043", "Accept T&C and proceed",
    "1. Select role (WHRD)\n2. Check 'I accept the terms and conditions'\n3. Click 'Proceed to dashboard'",
    "Onboarding marked complete. Redirected to /dashboard. Subsequent visits do NOT redirect back to /onboarding.");
  tc("AN-044", "Cannot skip onboarding",
    "1. Sign in as a new anonymous user\n2. Manually type /dashboard in the address bar",
    "Redirected to /onboarding. Dashboard inaccessible until onboarding is complete.");
  blank(2);

  // ═══════════════════ S4 — EMAIL & PASSWORD ═══════════════════
  section("4", "Email & Password User Flow", "Registered account — sign up, confirm, onboard, report", C.blue);

  subHdr("4.1 — Sign Up", C.blueL, C.blue);
  tc("EP-001", "Sign up with email and password",
    "1. Go to /auth/sign-up\n2. Enter a valid test email address\n3. Enter a password (min 8 chars)\n4. Click 'Sign up'",
    "Success message shown. Confirmation email sent to inbox. Check spam if not received within 2 minutes.");
  tc("EP-002", "Email confirmation link",
    "1. Open the confirmation email\n2. Click the confirmation link",
    "Browser opens, account confirmed, redirected to onboarding or dashboard.");
  tc("EP-003", "Duplicate email — error",
    "1. Attempt to sign up with an email already registered",
    "Error: 'User already registered' or similar. No second account created.");

  subHdr("4.2 — Sign In & Onboarding", C.blueL, C.blue);
  tc("EP-010", "Sign in with confirmed email",
    "1. Go to /auth/login\n2. Enter email and password\n3. Click 'Log In'",
    "Redirect to /onboarding (first time) or /dashboard (returning user).");
  tc("EP-011", "Complete onboarding",
    "1. Select 'WHRD' role\n2. Accept T&C\n3. Click 'Proceed to dashboard'",
    "Redirected to /dashboard. Role saved. No anonymous credentials card visible.");

  subHdr("4.3 — Reporting as Authenticated Email User", C.blueL, C.blue);
  tc("EP-020", "Account section shows 'Signed in' for authenticated user",
    "1. While signed in, go to /report\n2. Scroll to 'Your private access' section",
    "No password field shown. Green banner: 'Signed in' with user's email and copy button.");
  tc("EP-021", "Submit a report as signed-in user",
    "1. Fill: Violence type = Physical, Description = 25+ chars, County = Mombasa\n2. Click 'Submit report securely'",
    "Toast: 'Report submitted. Thank you for your courage.' Redirected to /dashboard. New report appears in list.");
  tc("EP-022", "Dashboard shows submitted report",
    "1. After EP-021, check dashboard\n2. Find report in the list",
    "Report shown with date, county, incident type, and status badge (Pending review).");
  blank(2);

  // ═══════════════════ S5 — GOOGLE ═══════════════════
  section("5", "Google Authenticated User Flow", "OAuth — requires Gmail pre-registration with Oliver", C.green);
  infoRow("⚠  PREREQUISITE: Gmail must be added to Supabase staging allowlist by Oliver before this section can be tested. Email oliverwai9na@gmail.com to request access.", C.amberL, C.amber);

  subHdr("5.1 — OAuth Flow", C.greenL, C.green);
  tc("GO-001", "Sign in with Google",
    "1. Go to /auth/login\n2. Click 'Continue with Google'\n3. Select your Google account in the Google picker",
    "Google account picker appears. After selection, redirected back to platform → onboarding (first time) or dashboard.");
  tc("GO-002", "Button shows loading state",
    "1. Click 'Continue with Google'\n2. Observe button before Google opens",
    "Button text changes to 'Redirecting…' and is disabled until Google OAuth opens.");
  tc("GO-003", "First-time Google sign-in → Onboarding",
    "1. Sign in with Google for the first time",
    "Redirected to /onboarding. Role selection and T&C required before dashboard.");
  tc("GO-004", "Returning Google user → Dashboard",
    "1. Sign out\n2. Sign back in with Google",
    "Skips onboarding, goes directly to /dashboard.");
  tc("GO-005", "Google user reports as authenticated",
    "1. While signed in with Google, go to /report\n2. Observe account section\n3. Fill required fields and submit",
    "Account section shows Google email in green 'Signed in' banner. No password field. After submit → /dashboard with toast.");
  blank(2);

  // ═══════════════════ S6 — ONBOARDING ═══════════════════
  section("6", "Onboarding Flow — All User Types", "Applies to Anonymous, Email, and Google users on first login", C.purple);

  subHdr("6.1 — Onboarding Gates & Edge Cases", C.purpleL, C.purple);
  tc("ON-001", "Cannot proceed without role selected",
    "1. On /onboarding, do NOT select a role\n2. Click 'Proceed' / 'Continue'",
    "Button remains disabled or error appears. User cannot proceed without selecting a role.");
  tc("ON-002", "Cannot proceed without T&C acceptance",
    "1. Select a role but leave T&C checkbox unchecked\n2. Click 'Proceed'",
    "Blocked — T&C checkbox must be checked before continuing.");
  tc("ON-003", "Onboarding persists after refresh",
    "1. Start onboarding, select a role\n2. Refresh page without completing\n3. Re-open onboarding",
    "Onboarding page shows again — not bypassed. Note whether role selection persists or resets.");
  tc("ON-004", "Completed onboarding — no re-trigger",
    "1. Complete onboarding fully\n2. Sign out and sign back in\n3. Navigate to /dashboard",
    "No onboarding redirect. Goes directly to dashboard.");
  blank(2);

  // ═══════════════════ S7 — DASHBOARD ═══════════════════
  section("7", "Dashboard — Reporter View", "Stats, report list, credentials, sign out", C.teal);

  subHdr("7.1 — Dashboard Overview", C.tealL, C.teal);
  tc("DB-001", "Dashboard loads with stats",
    "1. Navigate to /dashboard",
    "Summary cards show: Reports Submitted, Under Review, Resolved — numbers reflect real reports on account.");
  tc("DB-002", "Report list — status badges",
    "1. Observe reports in the list",
    "Each report shows incident type chip, county, date, and status badge (Pending / Under Review / Resolved).");
  tc("DB-003", "Empty state — no reports",
    "1. Sign in with a brand new account with no reports\n2. Go to dashboard",
    "'No reports yet' empty state with a 'Make a report' CTA button.");
  tc("DB-004", "Anonymous user — credentials card",
    "1. Sign in as anonymous user\n2. Go to dashboard\n3. Locate 'Your login credentials' card",
    "Username and virtual email (username@whrdhub.local) shown. Copy button works. Authenticated users do NOT see this card.");
  tc("DB-005", "Settings link accessible",
    "1. From dashboard, find and click Settings link or button",
    "Navigates to /settings page showing language selector grid.");
  tc("DB-006", "Sign out from dashboard",
    "1. Click 'Sign out' on the dashboard",
    "Session ends, redirected to landing page or login. Accessing /dashboard directly now redirects to login.");
  blank(2);

  // ═══════════════════ S8 — ADMIN ═══════════════════
  section("8", "Admin Flow — Reports, Fact-Checking & Case Management", "Admin role required — request credentials from Oliver", C.amber);
  infoRow("⚠  Admin accounts are manually provisioned. Contact Oliver to receive admin credentials. Non-admins visiting /admin are redirected away.", C.amberL, C.amber);

  subHdr("8.1 — Admin Navigation & Reports List", C.orangeL, C.amber);
  tc("AD-001", "Admin dashboard loads",
    "1. Sign in as admin\n2. Navigate to /admin",
    "Admin dashboard with summary statistics. Admin navigation bar visible.");
  tc("AD-002", "Non-admin redirected from /admin",
    "1. Sign in as WHRD user\n2. Manually navigate to /admin",
    "Redirected to /dashboard or 'Not authorised' page. Cannot access admin panel.");
  tc("AD-003", "Reports list shows all submissions",
    "1. Go to /admin/reports",
    "Table/card list of all reports. Columns: ID, user, county, type, status, date, urgency.");
  tc("AD-004", "Filter reports by status",
    "1. On reports list, use status filter\n2. Select 'Pending'",
    "List filters to pending reports only.");
  tc("AD-005", "Open individual report",
    "1. Click any report in the list",
    "Navigates to /admin/reports/[id]. Full details shown: description, county, perpetrator, urgency, support needed, reporter info.");
  tc("AD-006", "Admin can also submit a report",
    "1. As admin, go to /report\n2. Fill in form and submit",
    "Admin can intake reports on behalf of survivors. No password field (admin already signed in). Report linked to admin account.");

  subHdr("8.2 — Fact-Checking & Case Status", C.orangeL, C.amber);
  infoRow("Fact-checking: admin reviews a report, verifies information, and updates case status. Form is inside the individual report page at /admin/reports/[id].", C.amberL, C.amber);
  tc("FC-001", "Fact-check form visible",
    "1. Open /admin/reports/[id]\n2. Scroll to fact-check section",
    "Form with: status dropdown (Pending/Under Review/Fact-Checked/Resolved/Rejected), admin notes textarea, and Save button.");
  tc("FC-002", "Change status to 'Under Review'",
    "1. Open status dropdown\n2. Select 'Under Review'\n3. Add note: 'Reviewed by UAT tester'\n4. Click Save",
    "Status updates. Toast/success shown. Reporter's dashboard now shows 'Under Review' badge on their report.");
  tc("FC-003", "Change status to 'Resolved'",
    "1. Change status to 'Resolved'\n2. Add note\n3. Save",
    "Status = Resolved on detail page. Reporter's 'Resolved' count increments on their dashboard.");
  tc("FC-004", "Admin notes persist after reload",
    "1. Type a 200+ char note in admin notes\n2. Save\n3. Refresh page",
    "Note persists after save and page refresh.");
  tc("FC-005", "Reporter type indicator",
    "1. Open a report submitted by an anonymous user\n2. Observe reporter info section",
    "'Anonymous' badge shown. Username in mono font. No real email exposed.");

  subHdr("8.3 — Admin Analytics Dashboard", C.orangeL, C.amber);
  tc("AN-ADM-001", "Analytics page loads",
    "1. Go to /admin/analytics",
    "Charts load: reports by county, by violence type, over time, urgency breakdown, support type distribution.");
  tc("AN-ADM-002", "Charts reflect live data",
    "1. Submit a new report from another account\n2. Refresh analytics page",
    "Charts update to include new report's county, type, and urgency.");
  tc("AN-ADM-003", "Charts are responsive",
    "1. Resize browser to mobile width\n2. Observe analytics page",
    "Charts reflow and remain readable. No horizontal overflow.");
  blank(2);

  // ═══════════════════ S9 — MAP ═══════════════════
  section("9", "Admin — Map Interface", "Anonymised incident map — admin only", C.green);
  infoRow("The map shows anonymised incident locations. No PII exposed. Pins represent counties or GPS coordinates — never victim addresses. Used for geographic GBV pattern analysis.", C.tealL, C.teal);

  subHdr("9.1 — Map Tests", C.greenL, C.green);
  tc("MAP-001", "Map loads with incident pins",
    "1. As admin, navigate to the map view",
    "Kenya map rendered. Coloured markers for each report (or county clusters). Map is interactive (zoom/pan).");
  tc("MAP-002", "Click a pin — report summary popup",
    "1. Click any map marker/pin",
    "Popup or sidebar shows: county, incident type, date, urgency level. No victim name or personal details visible.");
  tc("MAP-003", "Zoom and pan",
    "1. Scroll to zoom in\n2. Drag to pan",
    "Map responds smoothly. Markers remain in correct geographic positions.");
  tc("MAP-004", "Filter by incident type",
    "1. Use filter controls\n2. Select 'Online only'",
    "Map updates to show only online harassment incidents. Physical-only reports hidden.");
  tc("MAP-005", "No PII exposed on map",
    "1. Click every visible map pin\n2. Inspect popup content for any PII",
    "NO victim name, real address, email, or phone number in any popup. Only: county, type, date, urgency.");
  tc("MAP-006", "Map on mobile",
    "1. Open map on mobile device or narrow viewport",
    "Map renders full-width. Pins are tappable. Popups fit on screen without overflow.");
  blank(2);

  // ═══════════════════ S10 — SETTINGS ═══════════════════
  section("10", "Settings — Language & Preferences", "All users — /settings page and nav switcher", C.purple);

  subHdr("10.1 — Language Switcher", C.purpleL, C.purple);
  tc("ST-001", "Settings page shows 6 language options",
    "1. Navigate to /settings",
    "Grid of 6 language options: English 🇬🇧, Kiswahili 🇰🇪, Français 🇫🇷, Português 🇧🇷, Deutsch 🇩🇪, العربية 🇸🇦. Selected language highlighted in purple.");
  tc("ST-002", "Select French — platform updates",
    "1. Click 'Français'\n2. Navigate to landing page, report form, and login page",
    "Toast 'Français — Language saved.' All page text switches to French. Language persists across navigation.");
  tc("ST-003", "Select Arabic — RTL layout",
    "1. Click 'العربية'\n2. Observe page layout",
    "Text becomes Arabic. Layout flips to RTL — text aligns right, layout mirrors. Nav items on correct side.");
  tc("ST-004", "Language persists after reload",
    "1. Select Swahili\n2. Hard-refresh page (Ctrl+Shift+R)",
    "Page reloads in Swahili. Language choice remembered via localStorage.");
  tc("ST-005", "Compact language switcher in nav bar",
    "1. Observe globe icon + language code (e.g. 'EN') in nav\n2. Click it",
    "Dropdown appears with all 6 language options. Selecting one updates platform immediately.");
  tc("ST-006", "Language switcher on login page",
    "1. Navigate to /auth/login\n2. Observe top of login form\n3. Change language",
    "Language switcher present. Changing language updates all login form text.");
  blank(2);

  // ═══════════════════ S11 — MULTILINGUAL ═══════════════════
  section("11", "Multilingual Testing — EN / SW & All Languages", "i18n — dual labels and full translations", C.teal);
  infoRow("DUAL-LANGUAGE LABELS (EN and SW only): When platform language is English or Swahili, report form shows bilingual labels — e.g. 'Tell us what happened (Tuambie kilichotokea)'. For FR/PT/DE/AR, only the single translated label is shown — no secondary language.", C.tealL, C.teal);

  subHdr("11.1 — Language Coverage", C.tealL, C.teal);
  tc("I18-001", "EN — dual labels on report form",
    "1. Set language to English\n2. Navigate to /report\n3. Inspect field labels",
    "Labels show English primary with Swahili secondary in muted text. E.g. 'County / Region (Kaunti / Mkoa)'.");
  tc("I18-002", "SW — dual labels on report form",
    "1. Set language to Kiswahili\n2. Navigate to /report",
    "Labels show Swahili primary with English secondary. E.g. 'Kaunti / Mkoa (County / Region)'.");
  tc("I18-003", "FR — single labels only",
    "1. Set language to Français\n2. Navigate to /report",
    "Labels show French only — no secondary EN or SW. E.g. 'Comté / Région'.");
  tc("I18-004", "AR — single labels, RTL form",
    "1. Set language to العربية\n2. Navigate to /report",
    "Arabic labels only. Form layout is RTL — inputs, dropdowns, text align right. Pills still functional.");
  tc("I18-005", "Success page translates",
    "1. Set language to Português\n2. Submit a report\n3. Observe success page",
    "All success page text in Portuguese: heading, steps, buttons.");
  tc("I18-006", "Login form translates",
    "1. Set language to Deutsch\n2. Navigate to /auth/login",
    "Login form shows German: 'Willkommen zurück', 'Weiter mit Google', labels and error messages in German.");
  tc("I18-007", "Landing page full translation",
    "1. Set each language in turn\n2. Return to landing page\n3. Verify: nav, hero, how it works, what you can report, CTA, emergency strip, footer all translate",
    "All sections fully translated for all 6 languages. No English text bleeds through (except brand name 'WHRD Hub').");
  tc("I18-008", "Error messages translate",
    "1. Set language to Swahili\n2. Submit report with empty required fields",
    "Inline error messages appear in Swahili, not English.");
  blank(2);

  // ═══════════════════ S12 — ACCESSIBILITY ═══════════════════
  section("12", "Accessibility Testing", "WCAG 2.1 AA — keyboard, contrast, screen reader, mobile", C.green);

  subHdr("12.1 — Keyboard Navigation", C.greenL, C.green);
  tc("A11-001", "Tab through report form",
    "1. On /report, press Tab repeatedly from the top\n2. Observe focus indicators",
    "Every interactive element (pills, inputs, dropdowns, checkboxes, buttons) receives visible focus ring. Tab order is logical.");
  tc("A11-002", "Keyboard-activate a pill",
    "1. Tab to a Violence Type pill\n2. Press Enter or Space",
    "Pill selects (turns purple, check icon appears). Same as click.");
  tc("A11-003", "Lang switcher keyboard",
    "1. Tab to globe icon language switcher\n2. Press Enter to open\n3. Use Tab/arrow keys to select\n4. Press Enter",
    "Dropdown opens; language navigable by keyboard; selection works without mouse.");

  subHdr("12.2 — Colour Contrast & Visual", C.greenL, C.green);
  tc("A11-010", "Primary button contrast",
    "1. Inspect purple 'Submit report securely' or 'Report now' button\n2. Use browser contrast checker",
    "White text on purple background. Contrast ratio ≥ 4.5:1 (WCAG AA minimum).");
  tc("A11-011", "Error text contrast",
    "1. Trigger a form validation error\n2. Check red error text contrast",
    "Red error text meets 4.5:1 contrast ratio against white background.");
  tc("A11-012", "Focus ring visible on all inputs",
    "1. Tab to each input type: text, dropdown, checkbox, pill button",
    "All elements show a visible focus ring. No element receives focus without visual indication.");
  tc("A11-013", "Dark mode (if supported)",
    "1. Enable OS dark mode\n2. Reload the platform",
    "All text remains legible. No white-on-white or black-on-black combinations.");

  subHdr("12.3 — Screen Reader & Semantic HTML", C.greenL, C.green);
  tc("A11-020", "Form labels announced by screen reader",
    "1. Enable VoiceOver (Mac) or NVDA (Windows)\n2. Tab through report form",
    "Each input announced with its label. Required fields announced as 'required'. Errors announced when they appear.");
  tc("A11-021", "Page headings structure",
    "1. Use screen reader heading navigation (H key in NVDA)\n2. Navigate headings on landing page",
    "Logical heading hierarchy: H1 for page title, H2 for sections, H3 for subsections. No heading levels skipped.");
  tc("A11-022", "Error alerts accessible",
    "1. Submit form with errors\n2. With screen reader on, observe what is announced",
    "Error messages announced — via aria-live region or focus move to error. User knows what went wrong without visual inspection.");

  subHdr("12.4 — Mobile & Touch", C.greenL, C.green);
  tc("A11-030", "Touch target sizes",
    "1. On mobile, attempt to tap each pill, button, and checkbox",
    "All interactive elements comfortably tappable — minimum 44×44px touch target. No mis-taps needed.");
  tc("A11-031", "Pinch-zoom not disabled",
    "1. On mobile, attempt to pinch-zoom the page",
    "Pinch zoom works. Viewport meta tag does NOT block user scaling.");
  tc("A11-032", "No horizontal scroll",
    "1. On mobile at 375px width, scroll through each page",
    "No horizontal scrollbar or overflow on any page. All content fits within viewport width.");
  blank(2);

  // ═══════════════════ S13 — SIGN OFF ═══════════════════
  section("13", "Sign-off & Defect Log", "Complete after all test cases executed", C.grey);

  infoRow("DEFECT SEVERITY GUIDE: CRITICAL = platform unusable / data loss / security risk. MAJOR = core user flow broken. MINOR = cosmetic or non-blocking issue.", C.amberL, C.amber);
  blank();

  push([
    hdr("Defect ID", C.grey, C.white, 10),
    hdr("Test Case", C.grey, C.white, 10),
    hdr("Page / URL", C.grey, C.white, 10),
    hdr("Severity", C.grey, C.white, 10),
    hdr("Steps to Reproduce", C.grey, C.white, 10),
    hdr("Actual vs Expected", C.grey, C.white, 10),
  ]);
  for (let i = 1; i <= 10; i++) {
    push([
      cell(`DEF-00${i}`, { bold: true, fg: C.red }),
      emptyComment(), emptyComment(), emptyComment(), emptyComment(), emptyComment(),
    ]);
  }
  blank(2);

  push([
    hdr("UAT PASS CRITERIA", C.green, C.white, 11),
    cell(""), cell(""), cell(""), cell(""), cell(""),
  ]);
  merge(r-1, r-1, 0, 5);
  const criteria = [
    "✓ All CRITICAL test cases pass",
    "✓ ≥ 90% of MAJOR test cases pass",
    "✓ All three user flows (Anonymous, Email, Google) complete end-to-end without blocking defects",
    "✓ Admin can view, fact-check, and update reports",
    "✓ Platform is usable in English and Swahili without UI breakage",
    "✓ No PII exposed on the map or admin report list",
  ];
  criteria.forEach(c => {
    push([cell(c, { fg: C.green, sz: 10 }), cell(""), cell(""), cell(""), cell(""), cell("")]);
    merge(r-1, r-1, 0, 5);
  });
  blank(2);

  push([
    hdr("Role", C.grey, C.white, 10),
    hdr("Name", C.grey, C.white, 10),
    hdr("Date Tested", C.grey, C.white, 10),
    hdr("Overall Result", C.grey, C.white, 10),
    hdr("Signature / Initials", C.grey, C.white, 10),
    cell(""),
  ]);
  const signers = ["Product Owner — Oliver Wainaina", "UAT Tester 1", "UAT Tester 2", "UAT Tester 3", "UAT Tester 4"];
  signers.forEach(s => {
    push([cell(s, { bold: s.startsWith("Product") }), emptyComment(), emptyComment(), emptyComment(), emptyComment(), cell("")]);
  });
  blank(2);
  push([cell("Prepared by Oliver Wainaina · WHRD Hub Reporting Platform · 27 June 2026 · CONFIDENTIAL", { fg: C.muted ?? C.grey, sz: 9, italic: true })]);
  merge(r-1, r-1, 0, 5);

  // ─── Build worksheet ──────────────────────────────────────────────────────
  const worksheet = XLSX.utils.aoa_to_sheet(data.map(row => row.map(c => c?.v ?? "")));

  // Apply styles
  const wsAny = worksheet;
  data.forEach((row, ri) => {
    row.forEach((c, ci) => {
      if (!c || !c.s) return;
      const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
      if (!wsAny[addr]) wsAny[addr] = {};
      wsAny[addr].s = c.s;
      if (c.t) wsAny[addr].t = c.t;
    });
  });

  worksheet["!merges"] = merges;
  worksheet["!cols"] = COL_WIDTHS.map(w => ({ wch: w }));

  // Row heights
  const rowHeights = [];
  data.forEach((row, ri) => {
    const maxChars = Math.max(...row.map(c => (c?.v?.toString() ?? "").length));
    rowHeights[ri] = { hpt: maxChars > 120 ? 90 : maxChars > 60 ? 60 : maxChars > 30 ? 40 : 20 };
  });
  worksheet["!rows"] = rowHeights;

  return worksheet;
}

// ─── Build workbook ──────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws(), "UAT Worksheet");

// Write
XLSX.writeFile(wb, OUT, { bookType: "xlsx", type: "buffer", cellStyles: true });
console.log("✓ Generated:", OUT);
