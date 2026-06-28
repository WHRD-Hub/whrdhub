/**
 * WHRD Hub — UAT Worksheet Generator
 * Matches the structure, column layout, and writing style of ZMRS_UAT_Test_Scenarios_v1.0.xlsx
 * 4 sheets: UAT Plan Overview | Test Scenarios | Defect Log | UAT Sign-Off Register
 */

import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "WHRD-Hub-UAT-Worksheet.xlsx");

// ─── Colours ─────────────────────────────────────────────────────────────────
const PURPLE      = "5B21B6";
const PURPLE_DARK = "3B0764";
const PURPLE_LIGHT= "EDE9FE";
const ORANGE      = "EA580C";
const ORANGE_LIGHT= "FFF7ED";
const GREEN       = "15803D";
const GREEN_LIGHT = "DCFCE7";
const RED         = "991B1B";
const RED_LIGHT   = "FEE2E2";
const BLUE        = "1D4ED8";
const BLUE_LIGHT  = "DBEAFE";
const AMBER       = "92400E";
const AMBER_LIGHT = "FFFBEB";
const GREY_DARK   = "1F2937";
const GREY_MID    = "6B7280";
const GREY_LIGHT  = "F9FAFB";
const GREY_BORDER = "E5E7EB";
const WHITE       = "FFFFFF";
const TEAL        = "0F766E";
const TEAL_LIGHT  = "CCFBF1";
const PINK        = "BE185D";
const PINK_LIGHT  = "FCE7F3";

// ─── Style factory ───────────────────────────────────────────────────────────
const S = {
  font: (bold, sz, rgb = GREY_DARK, italic = false) => ({ bold, sz, color: { rgb }, name: "Calibri", italic }),
  fill: (rgb) => ({ fgColor: { rgb }, patternType: "solid" }),
  border: (rgb = GREY_BORDER) => {
    const s = { style: "thin", color: { rgb } };
    return { top: s, bottom: s, left: s, right: s };
  },
  align: (h = "left", v = "top", wrap = true) => ({ horizontal: h, vertical: v, wrapText: wrap }),
};

function cell(v, { bold=false, sz=10, fg=GREY_DARK, bg=WHITE, h="left", v_="top", wrap=true, italic=false }={}) {
  return {
    v: v ?? "", t: "s",
    s: { font: S.font(bold,sz,fg,italic), fill: S.fill(bg), alignment: S.align(h,v_,wrap), border: S.border() },
  };
}
function hdrCell(v, bg=GREY_DARK, fg=WHITE, sz=10) {
  return { v, t:"s", s:{ font:S.font(true,sz,fg), fill:S.fill(bg), alignment:S.align("center","center",true), border:S.border(bg) } };
}
function titleCell(v, bg=PURPLE_DARK, fg=WHITE, sz=14) {
  return { v, t:"s", s:{ font:S.font(true,sz,fg), fill:S.fill(bg), alignment:S.align("center","center",true), border:S.border(bg) } };
}
function moduleCell(v, bg=PURPLE, fg=WHITE) {
  return { v, t:"s", s:{ font:S.font(true,10,fg), fill:S.fill(bg), alignment:S.align("center","center",true), border:S.border(PURPLE_DARK) } };
}
function statusCell(v) {
  const map = {
    "Not Tested": { bg: GREY_LIGHT,   fg: GREY_MID   },
    "Pass":       { bg: GREEN_LIGHT,  fg: GREEN       },
    "Fail":       { bg: RED_LIGHT,    fg: RED         },
    "Blocked":    { bg: AMBER_LIGHT,  fg: AMBER       },
    "Open":       { bg: RED_LIGHT,    fg: RED         },
    "Fixed":      { bg: GREEN_LIGHT,  fg: GREEN       },
    "Closed":     { bg: GREY_LIGHT,   fg: GREY_MID   },
  };
  const { bg, fg } = map[v] ?? { bg: GREY_LIGHT, fg: GREY_MID };
  return { v, t:"s", s:{ font:S.font(true,10,fg), fill:S.fill(bg), alignment:S.align("center","center",true), border:S.border() } };
}
function inputCell() {
  return { v:"", t:"s", s:{ fill:S.fill("FFFEF7"), alignment:S.align("left","top",true), border:{ top:{style:"thin",color:{rgb:GREY_BORDER}}, bottom:{style:"dashed",color:{rgb:"FCD34D"}}, left:{style:"thin",color:{rgb:GREY_BORDER}}, right:{style:"thin",color:{rgb:GREY_BORDER}} } } };
}
function labelCell(v) {
  return { v, t:"s", s:{ font:S.font(true,10,GREY_DARK), fill:S.fill(GREY_LIGHT), alignment:S.align("left","center",true), border:S.border() } };
}
function valueCell(v) {
  return { v, t:"s", s:{ font:S.font(false,10,GREY_DARK), fill:S.fill(WHITE), alignment:S.align("left","center",true), border:S.border() } };
}
function noteCell(v, bg=AMBER_LIGHT, fg=AMBER) {
  return { v, t:"s", s:{ font:S.font(false,9,fg,true), fill:S.fill(bg), alignment:S.align("left","top",true), border:S.border(fg) } };
}
function sectionHdr(v, bg=GREY_DARK) {
  return { v, t:"s", s:{ font:S.font(true,11,WHITE), fill:S.fill(bg), alignment:S.align("left","center",false), border:S.border(bg) } };
}
function severity(v) {
  const map = { "🔴 CRITICAL":{bg:RED_LIGHT,fg:RED}, "🟠 HIGH":{bg:ORANGE_LIGHT,fg:ORANGE}, "🟡 MEDIUM":{bg:AMBER_LIGHT,fg:AMBER}, "🟢 LOW":{bg:GREEN_LIGHT,fg:GREEN} };
  const { bg, fg } = map[v] ?? { bg: WHITE, fg: GREY_DARK };
  return { v, t:"s", s:{ font:S.font(true,10,fg), fill:S.fill(bg), alignment:S.align("center","center",true), border:S.border() } };
}

// ─── Sheet helpers ────────────────────────────────────────────────────────────
function buildSheet(rows, colWidths, merges, rowHeights=[]) {
  const ws = XLSX.utils.aoa_to_sheet(rows.map(r => r.map(c => c?.v ?? "")));
  rows.forEach((row, ri) => {
    row.forEach((c, ci) => {
      if (!c?.s) return;
      const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
      if (!ws[addr]) ws[addr] = {};
      ws[addr].s = c.s;
      ws[addr].t = c.t || "s";
    });
  });
  ws["!cols"] = colWidths.map(w => ({ wch: w }));
  ws["!merges"] = merges;
  if (rowHeights.length) ws["!rows"] = rowHeights;
  return ws;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHEET 1 — UAT PLAN OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function sheetOverview() {
  const rows = [];
  const merges = [];
  let r = 0;
  const M = (rs,re,cs,ce) => merges.push({s:{r:rs,c:cs},e:{r:re,c:ce}});
  const R = (row) => { rows.push(row); return r++; };
  const B = (n=1) => { for(let i=0;i<n;i++) R([]); };

  R([titleCell("WHRD HUB — REPORTING PLATFORM",PURPLE_DARK,WHITE,18)]); M(r-1,r-1,0,1);
  R([titleCell("User Acceptance Testing (UAT) — Test Plan & Scenarios",PURPLE,WHITE,13)]); M(r-1,r-1,0,1);
  R([cell("Prepared by: Oliver Wainaina",{bold:true,fg:WHITE,bg:PURPLE}), cell("Platform: WHRD Hub — TFGBV Incident Reporting",{fg:WHITE,bg:PURPLE})]); M(r-1,r-1,0,1);
  B();

  // Document control
  R([sectionHdr("DOCUMENT CONTROL",GREY_DARK)]); M(r-1,r-1,0,1);
  const docCtrl = [
    ["Document Title","WHRD Hub UAT Test Scenarios & Sign-off Workbook"],
    ["Version","1.0"],
    ["Date","27 June 2026"],
    ["Prepared by","Oliver Wainaina"],
    ["Reviewed by","[To be completed]"],
    ["Approved by","[To be completed after UAT]"],
    ["UAT Period","[Start Date] to [End Date]"],
    ["Platform","WHRD Hub — Reporting Platform"],
    ["Status","DRAFT — Pending UAT Execution"],
  ];
  docCtrl.forEach(([k,v]) => R([labelCell(k), valueCell(v)]));
  B();

  // Purpose
  R([sectionHdr("1. PURPOSE & SCOPE",PURPLE)]); M(r-1,r-1,0,1);
  R([cell("This workbook defines the User Acceptance Testing (UAT) framework for the WHRD Hub Reporting Platform — a secure, anonymous incident reporting tool for Women Human Rights Defenders (WHRDs) in Kenya. The platform allows victims of Technology-Facilitated Gender-Based Violence (TFGBV) and physical GBV to report incidents, access support services, and connect with WHRD Hub defenders. This UAT covers all three user flows (Anonymous, Email/Password, Google OAuth), the admin case management flow, multilingual support, and accessibility.",{sz:10,wrap:true})]); M(r-1,r-1,0,1);
  B();

  // UAT Rules
  R([sectionHdr("2. UAT EXECUTION RULES",PURPLE)]); M(r-1,r-1,0,1);
  const rules = [
    ["Individual Login Required","Each tester must access the staging platform using credentials provided by Oliver Wainaina. Shared logins are not permitted. Anonymous flow testers do not need pre-provisioned credentials."],
    ["Execute All Assigned Scenarios","Each tester must execute all scenarios assigned to their role. Skipping a scenario requires written justification."],
    ["Document All Results","For every scenario: record the Actual Result, Status (Pass/Fail/Blocked), and any Comments. Leave no row blank."],
    ["Raise Defects Immediately","Any failure must be logged in the Defect Log sheet immediately, with steps to reproduce and the URL at which the failure occurred."],
    ["No Workarounds Accepted","If a step fails, do not work around it — log it as a defect. A Pass result requires the system to behave exactly as specified in the Expected Result column."],
    ["Retest After Fix","Any defect fixed by the development team must be retested by the original tester. The retest result must be recorded in the Defect Log."],
    ["Sign-Off Required","UAT is only complete when ALL assigned scenarios are Passed (or formally deferred), and the sign-off register is completed."],
    ["UAT Environment","All testing must be conducted in the designated staging environment. Production data must not be used."],
    ["Test Data","Use fictional names, fictional locations (e.g. 'Nairobi'), and placeholder images. Do not submit real personal information."],
  ];
  rules.forEach(([k,v]) => R([labelCell(k), valueCell(v)]));
  B();

  // Severity
  R([sectionHdr("3. DEFECT SEVERITY DEFINITIONS",PURPLE)]); M(r-1,r-1,0,1);
  R([severity("🔴 CRITICAL"), cell("Platform crash, data loss, security breach, or complete failure of a core flow (submission, login, admin access). Testing cannot continue until resolved.",{sz:10})]);
  R([severity("🟠 HIGH"),     cell("Core functionality is broken but a workaround exists. Significantly impacts a user flow (e.g. form does not submit, validation missing, data not saved).",{sz:10})]);
  R([severity("🟡 MEDIUM"),   cell("Non-core functionality affected. System behaviour differs from specification but the primary flow can be completed (e.g. wrong label, missing translation, chart not rendering).",{sz:10})]);
  R([severity("🟢 LOW"),      cell("Minor UI issue, copy error, or cosmetic defect. Does not affect system function (e.g. misaligned button, wrong colour, spelling error).",{sz:10})]);
  B();

  // Modules
  R([sectionHdr("4. TEST SCOPE — MODULES & SCENARIO COUNT",PURPLE)]); M(r-1,r-1,0,1);
  R([hdrCell("Module ID",GREY_DARK), hdrCell("Module Name & Scenario Count",GREY_DARK)]);
  const modules = [
    ["MOD-01","System Access & Authentication — 5 scenarios"],
    ["MOD-02","Anonymous Reporting Flow — 8 scenarios"],
    ["MOD-03","Report Form — Fields, Validation & TFGBV — 10 scenarios"],
    ["MOD-04","Account Generation, Onboarding & Role Selection — 5 scenarios"],
    ["MOD-05","Email & Password User Flow — 6 scenarios"],
    ["MOD-06","Google OAuth Flow — 5 scenarios"],
    ["MOD-07","Reporter Dashboard — 5 scenarios"],
    ["MOD-08","Admin — Reports & Case Management — 6 scenarios"],
    ["MOD-09","Admin — Fact-Checking — 5 scenarios"],
    ["MOD-10","Admin — Analytics & Map Interface — 6 scenarios"],
    ["MOD-11","Settings & Language Switcher — 6 scenarios"],
    ["MOD-12","Multilingual Testing (EN/SW/FR/PT/DE/AR) — 8 scenarios"],
    ["MOD-13","Accessibility — Keyboard, Contrast & Screen Reader — 7 scenarios"],
  ];
  modules.forEach(([id,name]) => R([cell(id,{bold:true,fg:PURPLE}), cell(name,{sz:10})]));
  R([cell("TOTAL",{bold:true,fg:WHITE,bg:GREY_DARK}), cell("72 Test Scenarios",{bold:true,fg:WHITE,bg:GREY_DARK})]);
  B();

  // Staging note
  R([noteCell("⚠  STAGING ENVIRONMENT — GOOGLE OAUTH: Each tester's Gmail address must be added to the Supabase allowlist by Oliver Wainaina before the Google OAuth flow can be tested. Send your Gmail address to oliverwai9na@gmail.com with subject 'WHRD Hub UAT Access Request' and await confirmation before beginning MOD-06. Email/Password and Anonymous flows require no pre-registration.",AMBER_LIGHT,AMBER)]); M(r-1,r-1,0,1);

  const colWidths = [{wch:28},{wch:90}];
  const rowHeights = rows.map((row,i) => {
    const maxLen = Math.max(...row.map(c => (c?.v?.toString()||"").length));
    return { hpt: i===0?40:i<=2?28:maxLen>200?72:maxLen>100?48:maxLen>50?32:20 };
  });
  return buildSheet(rows, colWidths, merges, rowHeights);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHEET 2 — TEST SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════
function sheetScenarios() {
  const rows = [];
  const merges = [];
  let r = 0;
  const M = (rs,re,cs,ce) => merges.push({s:{r:rs,c:cs},e:{r:re,c:ce}});
  const R = (row) => { rows.push(row); return r++; };

  // Title row
  R([titleCell("WHRD HUB — UAT TEST SCENARIOS",PURPLE_DARK,WHITE,14)]);
  M(r-1,r-1,0,13);

  // Column headers — matching ZMRS exactly
  R([
    hdrCell("Test ID",         GREY_DARK,WHITE,10),
    hdrCell("Module",          GREY_DARK,WHITE,10),
    hdrCell("Scenario Title",  GREY_DARK,WHITE,10),
    hdrCell("Test Type",       GREY_DARK,WHITE,10),
    hdrCell("Pre-Conditions",  GREY_DARK,WHITE,10),
    hdrCell("Test Data Required", GREY_DARK,WHITE,10),
    hdrCell("Test Steps (numbered)", GREY_DARK,WHITE,10),
    hdrCell("Expected Result", GREY_DARK,WHITE,10),
    hdrCell("Actual Result\n(Tester fills in)", GREY_DARK,WHITE,10),
    hdrCell("Status\n(Pass/Fail/Blocked)", GREY_DARK,WHITE,10),
    hdrCell("Defect Ref",      GREY_DARK,WHITE,10),
    hdrCell("Tester Name",     GREY_DARK,WHITE,10),
    hdrCell("Date Tested",     GREY_DARK,WHITE,10),
    hdrCell("Comments /\nObservations", GREY_DARK,WHITE,10),
  ]);

  // ── Scenario row helper ──────────────────────────────────────────────────
  function tc(id, mod, title, type, pre, data, steps, expected) {
    const typeColors = {
      Positive:   { bg: GREEN_LIGHT,  fg: GREEN },
      Negative:   { bg: RED_LIGHT,    fg: RED   },
      Validation: { bg: BLUE_LIGHT,   fg: BLUE  },
    };
    const tc = typeColors[type] ?? { bg: GREY_LIGHT, fg: GREY_DARK };
    R([
      cell(id,       {bold:true, fg:PURPLE, sz:10}),
      moduleCell(mod, PURPLE, WHITE),
      cell(title,    {bold:true, sz:10, fg:GREY_DARK}),
      { v:type, t:"s", s:{ font:S.font(true,10,tc.fg), fill:S.fill(tc.bg), alignment:S.align("center","center",true), border:S.border() } },
      cell(pre,      {sz:10}),
      cell(data,     {sz:10}),
      cell(steps,    {sz:10}),
      cell(expected, {sz:10}),
      inputCell(),
      statusCell("Not Tested"),
      inputCell(),
      inputCell(),
      inputCell(),
      inputCell(),
    ]);
  }

  function modHdr(label, bg=PURPLE) {
    R([{ v:label, t:"s", s:{ font:S.font(true,11,WHITE), fill:S.fill(bg), alignment:S.align("left","center",false), border:S.border(bg) }}]);
    M(r-1,r-1,0,13);
  }

  // ═══ MOD-01 — SYSTEM ACCESS & AUTHENTICATION ═══
  modHdr("MOD-01 — System Access & Authentication");
  tc("TC-001","MOD-01\nSystem Access",
    "Landing Page Loads and Renders Correctly",
    "Positive",
    "Staging URL provided by Oliver Wainaina.\nDevice: Desktop Chrome (latest).",
    "URL: [staging URL as shared by Oliver]\nBrowser: Chrome 120+",
    "1. Open the staging URL in a Chrome browser.\n2. Allow the page to fully load (wait for network idle).\n3. Observe all sections of the landing page.\n4. Open browser developer console (F12) and check for errors.",
    "Landing page loads within 5 seconds. All sections visible: navigation bar with WHRD Hub logo, 'Report now' CTA button, hero section with headline, safety banner, 'How it works' section, 'What you can report' section, statistics strip, CTA section, emergency contacts strip, and footer. Zero JavaScript errors in the browser console."
  );
  tc("TC-002","MOD-01\nSystem Access",
    "Unauthenticated User Cannot Access Dashboard",
    "Validation",
    "User is not signed in.\nBrowser has no active session cookie.",
    "No credentials required.\nBrowser with cleared cookies.",
    "1. Ensure you are not signed in (clear cookies if needed).\n2. Manually type the dashboard URL ([staging URL]/dashboard) directly into the address bar.\n3. Press Enter.\n4. Observe where the page redirects.",
    "User is immediately redirected away from /dashboard. The system returns the user to the login page (/auth/login) or the landing page. The dashboard content is not displayed to an unauthenticated user under any circumstances."
  );
  tc("TC-003","MOD-01\nSystem Access",
    "Sign In with Email and Password — Successful",
    "Positive",
    "A confirmed email/password account exists in the staging system.\nOnboarding has been completed on this account.",
    "Email: [your registered test email]\nPassword: [your test password — minimum 8 characters]",
    "1. Navigate to /auth/login.\n2. Enter your registered email address in the 'Username or Email' field.\n3. Enter your password in the Password field.\n4. Click 'Log In'.\n5. Observe the redirect destination.",
    "Login succeeds. The 'Log In' button shows a loading state ('Logging in…') while the request is processed. User is redirected to /dashboard within 3 seconds. The dashboard displays the user's name or email, their report count, and the navigation menu."
  );
  tc("TC-004","MOD-01\nSystem Access",
    "Login Failure — Incorrect Password",
    "Negative",
    "A confirmed email/password account exists in the staging system.",
    "Email: [your registered test email]\nPassword: WrongPassword99 (intentionally incorrect)",
    "1. Navigate to /auth/login.\n2. Enter your registered email address.\n3. Enter 'WrongPassword99' as the password (incorrect).\n4. Click 'Log In'.\n5. Observe the response.",
    "The system displays a red inline error message: 'Incorrect username/email or password.' The page does not redirect. The password field is cleared. The user remains on the login page. No account lockout on first attempt."
  );
  tc("TC-005","MOD-01\nSystem Access",
    "Sign Out — Session Terminated",
    "Positive",
    "User is signed in to any account type (Email, Google, or Anonymous).\nUser is on the /dashboard page.",
    "Any active signed-in session.",
    "1. From the dashboard, locate and click the 'Sign out' button or link.\n2. Observe the redirect.\n3. After sign-out, manually type [staging URL]/dashboard in the address bar.\n4. Press Enter.",
    "Step 2: User is redirected to the landing page or /auth/login. Session is terminated. Step 4: User is redirected away from /dashboard — the dashboard content is not accessible. Browser cookies for the session are cleared."
  );

  // ═══ MOD-02 — ANONYMOUS REPORTING FLOW ═══
  modHdr("MOD-02 — Anonymous Reporting Flow");
  tc("TC-006","MOD-02\nAnonymous Flow",
    "'Report Now' CTA Navigates to Report Form",
    "Positive",
    "User is not signed in.\nLanding page is loaded.",
    "No credentials required.",
    "1. On the landing page, locate the purple 'Report now' button in the navigation bar (top right).\n2. Click the button.\n3. Observe the navigation and page content.",
    "User is navigated to /report. The report form page loads with a page heading and all six sections visible: (1) About this report, (2) What happened, (3) Who did this, (4) Online evidence [conditional], (5) How can we help, (6) Your private access. No login prompt is shown."
  );
  tc("TC-007","MOD-02\nAnonymous Flow",
    "Submit Report with No Required Fields — Validation Errors",
    "Validation",
    "User is on /report.\nUser is not signed in.\nNo fields have been filled.",
    "No data — testing empty submission.",
    "1. Navigate to /report.\n2. Scroll to the bottom of the page without filling any fields.\n3. Click 'Submit report securely'.\n4. Scroll back up and observe the form.",
    "The page does not navigate away. Three distinct inline validation errors appear in red directly beneath the relevant fields:\n• Under 'Where did the violence happen?': 'Please select where the violence happened.'\n• Under 'Tell us what happened': 'Please describe what happened (0/20 minimum characters).'\n• Under 'County / Region': 'Please select a county or region.'\nThe submit button does not trigger any loading state."
  );
  tc("TC-008","MOD-02\nAnonymous Flow",
    "Violence Type = Online — Evidence Section Appears",
    "Positive",
    "User is on /report.\nUser has not yet selected a violence type.",
    "No specific test data required.",
    "1. On /report, locate the 'Where did the violence happen?' section.\n2. Click the 'Online' pill button.\n3. Observe the form below the 'Who did this?' section.",
    "The 'Online' pill turns purple and displays a white check icon. A new card titled 'Online evidence' appears below the 'Who did this?' section, containing three fields: Platform (dropdown), Link to the content (URL input), and Upload screenshots (file picker). This section is not visible when 'Physical / In person' is selected."
  );
  tc("TC-009","MOD-02\nAnonymous Flow",
    "Description Character Counter and Minimum Length",
    "Validation",
    "User is on /report.",
    "Input: type exactly 10 characters in the description field, e.g. 'Test input'",
    "1. Click into the 'Tell us what happened' textarea.\n2. Type exactly 10 characters (e.g. 'Test input').\n3. Observe the hint text below the textarea.\n4. Continue typing until 20 characters are reached.\n5. Observe the hint text again.",
    "Step 3: A grey hint below the textarea reads '10/20 min', indicating 10 of the required 20 minimum characters have been entered.\nStep 5: Once 20 characters are reached, the hint disappears entirely. The field is now considered valid."
  );
  tc("TC-010","MOD-02\nAnonymous Flow",
    "Successful Anonymous Report Submission and Account Generation",
    "Positive",
    "User is not signed in.\nUser is on /report.",
    "Violence type: Online\nDescription: 'Test incident submitted during WHRD Hub UAT exercise in Nairobi county.' (71 chars)\nCounty: Nairobi\nPassword: TestPass2026\n(All other fields optional — leave blank)",
    "1. On /report, click the 'Online' pill for Violence type.\n2. In 'Tell us what happened', enter: 'Test incident submitted during WHRD Hub UAT exercise in Nairobi county.'\n3. Select 'Nairobi' from the County dropdown.\n4. Scroll to 'Your private access' section.\n5. Enter password: TestPass2026.\n6. Click 'Submit report securely'.\n7. Observe the button state and subsequent navigation.",
    "Step 6-7: The button label changes to 'Submitting…' with a spinning loader icon. After 2–4 seconds, the user is navigated to /report/success. The success page displays: a green check icon, 'Report received' heading, a list of next steps, and a notice reading 'You are already signed in'. The user is automatically logged into their newly created anonymous account — no separate login step is required."
  );
  tc("TC-011","MOD-02\nAnonymous Flow",
    "Success Page — 'Go to Your Dashboard' Button",
    "Positive",
    "User has just completed TC-010 successfully.\nUser is on /report/success.\nUser is automatically signed in.",
    "No additional data required.",
    "1. On /report/success, locate the 'Go to your dashboard' button.\n2. Click the button.\n3. Observe the navigation and dashboard content.",
    "User is navigated directly to /dashboard. The dashboard loads without displaying a login form. The user is already authenticated. The dashboard shows: one report in the report list (the report just submitted), summary cards showing '1 Report Submitted', and — because this is an anonymous account — a 'Your login credentials' card showing the auto-generated username and email."
  );
  tc("TC-012","MOD-02\nAnonymous Flow",
    "Anonymous Credentials Displayed on Dashboard",
    "Positive",
    "User has completed TC-010 and TC-011.\nUser is on /dashboard as an anonymous user.",
    "Note the username and email shown on the credentials card for use in TC-013.",
    "1. On /dashboard, locate the 'Your login credentials' card.\n2. Note the auto-generated username (e.g. brave-shield-k4x2).\n3. Note the virtual email (e.g. brave-shield-k4x2@whrdhub.local).\n4. Click the copy icon/button next to the email address.\n5. Paste the copied value into a text editor to verify it copied correctly.",
    "A credentials card is visible only for anonymous users. It displays a system-generated username in the format [adjective]-[noun]-[code] and a corresponding virtual email in the format [username]@whrdhub.local. The copy button successfully copies the email to the clipboard. Authenticated (non-anonymous) users do not see this card."
  );
  tc("TC-013","MOD-02\nAnonymous Flow",
    "Anonymous User Sign Out and Sign Back In Using Username",
    "Positive",
    "User has completed TC-012.\nUser has noted their auto-generated username and the password chosen in TC-010 (TestPass2026).",
    "Username: [noted from TC-012 credentials card]\nPassword: TestPass2026",
    "1. From the dashboard, click 'Sign out'.\n2. Navigate to /auth/login.\n3. In the 'Username or Email' field, enter only the username (e.g. brave-shield-k4x2) — not the full email.\n4. Enter password: TestPass2026.\n5. Click 'Log In'.",
    "Sign-in succeeds. User is redirected to /dashboard (if onboarding is already complete) or /onboarding (if not yet completed). The report submitted in TC-010 is visible in the dashboard report list. The credentials card is visible showing the same username and email as noted in TC-012."
  );

  // ═══ MOD-03 — REPORT FORM FIELDS & VALIDATION ═══
  modHdr("MOD-03 — Report Form — Fields, Validation & TFGBV");
  tc("TC-014","MOD-03\nReport Form",
    "Reporting For — 'A Child' Selection",
    "Positive",
    "User is on /report (signed in or anonymous).",
    "No specific test data.",
    "1. On /report, locate the 'Who are you reporting for?' section.\n2. Click the 'A child' pill button.\n3. Observe the pill state.\n4. Select another option (e.g. 'Myself').\n5. Observe the previous pill state.",
    "Step 2-3: The 'A child' pill turns purple with a check icon. Only one pill can be active at a time — all others revert to unselected state. Step 4-5: 'Myself' becomes selected, 'A child' reverts to unselected. The form does not display any child-specific fields to the reporter (the child-protection flag is internal to the admin system)."
  );
  tc("TC-015","MOD-03\nReport Form",
    "Perpetrator Type Selection Reveals Detail Field",
    "Positive",
    "User is on /report.\nViolence type has been selected.",
    "Perpetrator type to select: 'Partner / Spouse'\nDetail text: 'John Doe, self-employed, Westlands'",
    "1. Scroll to the 'Who did this?' section.\n2. Click the 'Partner / Spouse' pill.\n3. Observe the form below the pills.\n4. In the detail input that appears, type: 'John Doe, self-employed, Westlands'.\n5. Click the 'Partner / Spouse' pill again to deselect it.\n6. Observe the detail input.",
    "Step 2-3: The 'Partner / Spouse' pill turns purple with a check icon. A text input field appears below the pills labelled 'Any details? (optional)'. Step 4: The text is accepted without restriction. Step 5-6: The pill deselects and the detail text input disappears. This confirms the field is fully conditional on perpetrator selection."
  );
  tc("TC-016","MOD-03\nReport Form",
    "Multi-Select Support Type Pills",
    "Positive",
    "User is on /report.\nScroll to 'How can we help?' section.",
    "Support types to select: Legal support, Counselling, Other\nOther text: 'Temporary housing assistance'",
    "1. In the 'How can we help?' section, click 'Legal support'.\n2. Click 'Counselling'.\n3. Click 'Other'.\n4. In the text area that appears, enter: 'Temporary housing assistance'.\n5. Click 'Counselling' a second time to deselect it.\n6. Observe which pills remain selected.",
    "Steps 1-3: Each pill independently turns purple with a check icon. Multiple pills can be selected simultaneously — this is not a single-select control. Step 3-4: Selecting 'Other' reveals a freetext textarea immediately below the pills. Step 5-6: 'Counselling' deselects and reverts to default styling. 'Legal support' and 'Other' remain selected."
  );
  tc("TC-017","MOD-03\nReport Form",
    "Urgency Selection — Immediate Danger Turns Red",
    "Positive",
    "User is on /report.\nScroll to urgency buttons in 'How can we help?' section.",
    "No specific data required.",
    "1. In the 'How can we help?' section, locate the three urgency buttons.\n2. Click 'I am in danger right now' (the top button).\n3. Observe the button colour.\n4. Click 'No rush, documenting' (the bottom button).\n5. Observe both buttons.",
    "Step 2-3: The 'I am in danger right now' button turns red with white text, indicating critical urgency. Step 4-5: 'No rush, documenting' becomes selected (default styling). The 'I am in danger right now' button reverts to its default state. Only one urgency level can be selected at a time."
  );
  tc("TC-018","MOD-03\nReport Form",
    "Consent to Contact — Reveals Contact Fields",
    "Positive",
    "User is on /report.\nScroll to consent checkbox in 'How can we help?' section.",
    "Contact method: WhatsApp\nContact value: +254 7XX XXX XXX (fictional number)",
    "1. Locate the checkbox 'I am okay with being contacted by a WHRD Hub defender'.\n2. Check the checkbox.\n3. Observe the form below the checkbox.\n4. In the contact method dropdown, select 'WhatsApp'.\n5. In the contact detail field, enter: +254 700 000 000.\n6. Uncheck the checkbox.\n7. Observe the contact fields.",
    "Step 2-3: Two fields appear below the checkbox: a dropdown for 'Preferred method' (options: Phone call, WhatsApp, Email, SMS) and a text input for 'Phone number or email'. Step 4-5: Fields accept input normally. Step 6-7: Both contact fields disappear. Unchecking consent hides the contact fields entirely."
  );
  tc("TC-019","MOD-03\nReport Form",
    "TFGBV Platform and Link Fields — Online Evidence Section",
    "Positive",
    "User is on /report.\nViolence type is set to 'Online' or 'Both'.",
    "Platform: WhatsApp\nLink: https://wa.me/invalid-test-link",
    "1. Ensure 'Online' is selected as the violence type.\n2. Scroll to the 'Online evidence' section.\n3. In the Platform dropdown, select 'WhatsApp'.\n4. In the Link field, enter: https://wa.me/invalid-test-link.\n5. Observe the fields and their labels.",
    "The 'Online evidence' section is visible. The Platform dropdown accepts 'WhatsApp' as a selection. The Link field accepts URL input. Both fields are optional — no validation error is triggered if left blank. The section title and field labels are correct (testing English language by default)."
  );
  tc("TC-020","MOD-03\nReport Form",
    "Screenshot Upload — File Picker Accepts Images",
    "Positive",
    "User is on /report.\nViolence type is set to 'Online'.\nUser has a small JPEG image (< 5 MB) available on their device.",
    "Test file: Any JPEG image under 5 MB (a screenshot, a generic image — not an actual incident image).",
    "1. Scroll to the 'Online evidence' section.\n2. Click 'Choose files (JPEG, PNG, PDF — max 5 MB each)'.\n3. In the file picker, select a small JPEG image.\n4. Observe the file list below the picker.\n5. Click the × (remove) button next to the uploaded file.",
    "Step 3-4: The file is accepted and listed below the picker with its filename and file size in KB. A remove button (×) is visible next to each file. Step 5: Clicking × removes the file from the list. The picker accepts up to 10 files simultaneously; attempting to add an 11th triggers an error toast: 'Maximum 10 files'."
  );
  tc("TC-021","MOD-03\nReport Form",
    "Password Field — Minimum Length Validation",
    "Negative",
    "User is not signed in.\nUser is on /report.\nRequired fields (violence type, description, county) are already filled.",
    "Password attempt 1: UAT1 (4 characters — too short)\nPassword attempt 2: UATTest2026 (11 characters — valid)",
    "1. Scroll to the 'Your private access' section.\n2. In the password field, enter: UAT1 (4 characters).\n3. Click 'Submit report securely'.\n4. Observe the password field.\n5. Clear the password field and enter: UATTest2026 (11 characters).\n6. Observe the error state.",
    "Step 3-4: A red error message appears directly below the password field: 'Password must be at least 8 characters.' The form does not submit. A red border appears on the password field. Step 5-6: As soon as 8 characters are entered, the red error and red border disappear. The field returns to its default state."
  );
  tc("TC-022","MOD-03\nReport Form",
    "GPS Location Capture Notice",
    "Positive",
    "User is on /report.\nBrowser location permissions have been granted (or will be requested).",
    "Allow location permission when prompted by the browser.",
    "1. Navigate to /report.\n2. When the browser displays a location permission prompt, click 'Allow'.\n3. Scroll to the 'What happened' section and observe beneath the 'Is ongoing' checkbox.",
    "After location permission is granted, a green notice appears: 'GPS noted for anonymised map visualisation only.' This confirms the browser geolocation was captured. If permission is denied, this notice does not appear and no error is shown to the user — geolocation is optional."
  );
  tc("TC-023","MOD-03\nReport Form",
    "Authenticated User — No Password Field on Report Form",
    "Validation",
    "User is signed in with an Email/Password or Google account.\nOnboarding is complete.",
    "Any signed-in session.",
    "1. While signed in, navigate to /report.\n2. Scroll to the 'Your private access' section at the bottom of the form.",
    "The password creation field is NOT shown. Instead, a green banner displays: a shield icon, 'Signed in' label, and the user's email address with a copy button. No credentials section, no password warning, and no auto-username notice are shown to signed-in users."
  );

  // ═══ MOD-04 — ACCOUNT GENERATION & ONBOARDING ═══
  modHdr("MOD-04 — Account Generation, Onboarding & Role Selection");
  tc("TC-024","MOD-04\nOnboarding",
    "New User Redirected to Onboarding Before Dashboard",
    "Validation",
    "A brand new account has been created (either via TC-010 anonymous submission, email sign-up, or first Google login).\nOnboarding has NOT yet been completed on this account.",
    "New account credentials (from TC-010, or a fresh sign-up).",
    "1. Sign in with a newly created account.\n2. Immediately after sign-in, observe the redirect destination.\n3. Alternatively, navigate directly to /dashboard.",
    "The user is redirected to /onboarding before being allowed to view /dashboard. The onboarding page loads with: a role selection section (Admin / WHRD cards), a Terms & Conditions section with accordion panels, and a 'Proceed to dashboard' button that is initially disabled."
  );
  tc("TC-025","MOD-04\nOnboarding",
    "Role Selection — Cannot Proceed Without Selecting Role",
    "Validation",
    "User is on /onboarding.\nNo role has been selected yet.",
    "No test data required.",
    "1. On /onboarding, do NOT click any role card.\n2. Attempt to click the 'Proceed to dashboard' (or equivalent) button.",
    "The 'Proceed to dashboard' button remains disabled (greyed out) and cannot be clicked while no role is selected. No error message is required — the button's disabled state communicates the requirement. The user must select a role card before proceeding."
  );
  tc("TC-026","MOD-04\nOnboarding",
    "Terms & Conditions Accordion — Expand and Read",
    "Positive",
    "User is on /onboarding.",
    "No test data required.",
    "1. On /onboarding, locate the Terms & Conditions section.\n2. Click the first accordion panel header to expand it.\n3. Read the content.\n4. Click a second accordion panel to expand it.\n5. Attempt to proceed without checking the acceptance checkbox.",
    "Step 2-4: Each accordion panel expands to reveal policy text. Multiple accordions can be open simultaneously, or only one — note the behaviour. Step 5: The 'Proceed to dashboard' button remains disabled until the acceptance checkbox is checked."
  );
  tc("TC-027","MOD-04\nOnboarding",
    "Complete Onboarding — Role + T&C + Proceed",
    "Positive",
    "User is on /onboarding.\nUser has not yet completed onboarding.",
    "Role to select: WHRD",
    "1. On /onboarding, click the 'WHRD' role card.\n2. Expand and read the Terms & Conditions accordions.\n3. Check the 'I accept the terms and conditions' checkbox.\n4. Click 'Proceed to dashboard'.",
    "Step 1: The 'WHRD' card highlights with a selected state (border, background change, or check icon). Step 3: The 'Proceed to dashboard' button becomes active/enabled. Step 4: User is navigated to /dashboard. Onboarding completion is saved — subsequent sign-ins on this account go directly to /dashboard without redirecting to /onboarding."
  );
  tc("TC-028","MOD-04\nOnboarding",
    "Onboarding Not Re-Triggered on Subsequent Login",
    "Validation",
    "User has completed TC-027 successfully.\nUser is on /dashboard.",
    "Same account used in TC-027.",
    "1. From /dashboard, click 'Sign out'.\n2. Sign back in with the same account credentials.\n3. Observe the redirect destination after login.",
    "After sign-in, the user is navigated directly to /dashboard. The /onboarding page is NOT shown. The role and T&C acceptance from TC-027 are persisted. This confirms onboarding completion is correctly stored and the gate is not re-triggered on subsequent sessions."
  );

  // ═══ MOD-05 — EMAIL & PASSWORD ═══
  modHdr("MOD-05 — Email & Password User Flow");
  tc("TC-029","MOD-05\nEmail Flow",
    "New Account Sign-Up with Email and Password",
    "Positive",
    "No existing account with the test email address.",
    "Email: [your personal test email address]\nPassword: UATEmail2026\n(Use an email you have access to — confirmation email required)",
    "1. Navigate to /auth/sign-up.\n2. Enter your test email address.\n3. Enter password: UATEmail2026.\n4. Click 'Sign up'.\n5. Check your email inbox.",
    "Step 4: A success message is displayed on screen confirming a confirmation email has been sent. Step 5: A confirmation email arrives in your inbox within 2 minutes. Check the spam/junk folder if not received. The email contains a confirmation link."
  );
  tc("TC-030","MOD-05\nEmail Flow",
    "Email Confirmation Link — Account Activated",
    "Positive",
    "TC-029 has been completed and a confirmation email received.",
    "Confirmation link from the email received in TC-029.",
    "1. Open the confirmation email from WHRD Hub.\n2. Click the confirmation link in the email.\n3. Observe the page that opens.",
    "Clicking the confirmation link opens the platform and confirms the account. The user is redirected to /onboarding (first login) or /dashboard (if already onboarded). The account is now active and can be used to sign in with email and password."
  );
  tc("TC-031","MOD-05\nEmail Flow",
    "Duplicate Email Registration Blocked",
    "Negative",
    "The email address from TC-029 is already registered.",
    "Email: same email used in TC-029 (already registered)",
    "1. Navigate to /auth/sign-up.\n2. Enter the same email address used in TC-029.\n3. Enter any password.\n4. Click 'Sign up'.\n5. Observe the response.",
    "The system displays an error message such as 'User already registered' or equivalent. A second account is not created for the same email address. The user is presented with options to sign in or reset their password instead."
  );
  tc("TC-032","MOD-05\nEmail Flow",
    "Email User — Submit Report as Authenticated User",
    "Positive",
    "Email/password account confirmed and signed in.\nOnboarding completed.",
    "Violence type: Physical / In person\nDescription: 'UAT test report submitted by authenticated email user during WHRD Hub UAT exercise.' (74 chars)\nCounty: Mombasa",
    "1. Ensure you are signed in with your email account.\n2. Navigate to /report.\n3. Select 'Physical / In person' as violence type.\n4. Enter the description above.\n5. Select 'Mombasa' from the County dropdown.\n6. Scroll to 'Your private access' — note what you see.\n7. Click 'Submit report securely'.",
    "Step 6: The 'Your private access' section shows a green 'Signed in' banner with the user's email address — no password field is shown. Step 7: The submission succeeds. A toast notification appears: 'Report submitted. Thank you for your courage.' The user is redirected to /dashboard where the new report appears in the report list."
  );
  tc("TC-033","MOD-05\nEmail Flow",
    "Report Appears on Dashboard After Submission",
    "Positive",
    "TC-032 completed successfully.\nUser is on /dashboard.",
    "No additional data required.",
    "1. On /dashboard after TC-032, locate the report list section.\n2. Find the report submitted in TC-032.\n3. Observe the report entry details.",
    "The report submitted in TC-032 is listed in the dashboard report list. The entry shows: the incident type chip ('Physical / In person'), the county ('Mombasa'), the submission date (today's date), and a status badge ('Pending review' or equivalent). The 'Reports Submitted' counter on the dashboard increments to reflect the new submission."
  );
  tc("TC-034","MOD-05\nEmail Flow",
    "Forgot Password Flow",
    "Positive",
    "Email/password account exists and is confirmed.",
    "Email: [your registered test email]",
    "1. Navigate to /auth/login.\n2. Click the 'Forgot password?' link next to the password field.\n3. Enter your registered email address.\n4. Click the submit/send button.\n5. Check your email inbox for a reset link.",
    "Step 3-4: A confirmation message is shown: password reset instructions sent to the email address. Step 5: A password reset email is received within 2 minutes. Note: This tests that the forgot password flow is functional. Full password reset execution is not required for this UAT — confirm the email is received and the link is valid."
  );

  // ═══ MOD-06 — GOOGLE OAUTH ═══
  modHdr("MOD-06 — Google OAuth Flow");
  R([noteCell("⚠  PREREQUISITE FOR MOD-06: Your Gmail address must be added to the Supabase staging allowlist by Oliver Wainaina before any test in this module can be executed. If access has not been confirmed, mark all MOD-06 scenarios as 'Blocked' and log a prerequisite note in the Comments column.",AMBER_LIGHT,AMBER)]);
  M(r-1,r-1,0,13);
  tc("TC-035","MOD-06\nGoogle OAuth",
    "Sign In with Google — Account Picker Appears",
    "Positive",
    "Gmail address has been added to Supabase allowlist by Oliver.\nUser is on /auth/login and NOT already signed in.",
    "Gmail account: [your Gmail address, pre-registered with Oliver]",
    "1. Navigate to /auth/login.\n2. Click 'Continue with Google'.\n3. Observe the button state.\n4. Observe the Google account picker that appears.",
    "Step 3: The 'Continue with Google' button changes to 'Redirecting…' and is disabled. Step 4: The browser opens Google's OAuth consent screen or account picker. The Google flow is initiated from the WHRD Hub staging domain."
  );
  tc("TC-036","MOD-06\nGoogle OAuth",
    "First-Time Google Sign-In — Redirected to Onboarding",
    "Positive",
    "TC-035 Google account has never previously signed in to WHRD Hub staging.\nGoogle account picker is open from TC-035.",
    "Gmail: [your Gmail — first time use]",
    "1. In the Google account picker, select your Gmail account.\n2. Grant any requested permissions.\n3. Observe the redirect destination after Google returns you to the platform.",
    "After Google authentication, the user is redirected to /onboarding. The onboarding page loads with role selection and T&C acceptance. The user's Google display name or email may be shown. The user is NOT taken to /dashboard until onboarding is complete."
  );
  tc("TC-037","MOD-06\nGoogle OAuth",
    "Google User Completes Onboarding and Reaches Dashboard",
    "Positive",
    "TC-036 completed — user is on /onboarding after first Google sign-in.",
    "Role to select: WHRD",
    "1. On /onboarding, select the 'WHRD' role card.\n2. Check the T&C acceptance checkbox.\n3. Click 'Proceed to dashboard'.",
    "User is navigated to /dashboard. The dashboard displays the user's Google email in the top-right or in the account section. The 'Your login credentials' anonymous card is NOT shown — this is a Google authenticated user. Report count is zero (no reports yet)."
  );
  tc("TC-038","MOD-06\nGoogle OAuth",
    "Returning Google User — Bypasses Onboarding",
    "Positive",
    "TC-037 completed successfully.\nUser has signed out.",
    "Same Gmail used in TC-035.",
    "1. Sign out from the dashboard.\n2. Navigate to /auth/login.\n3. Click 'Continue with Google'.\n4. Select the same Gmail account in the account picker.",
    "After Google authentication, the user is redirected directly to /dashboard. The /onboarding page is NOT shown. Onboarding completion is persisted from TC-037."
  );
  tc("TC-039","MOD-06\nGoogle OAuth",
    "Google User Submits Report as Authenticated",
    "Positive",
    "Google account signed in and onboarding complete.",
    "Violence type: Both\nDescription: 'UAT test report from a Google authenticated user on the WHRD Hub staging platform.' (78 chars)\nCounty: Kisumu",
    "1. While signed in with Google, navigate to /report.\n2. Select 'Both' as violence type.\n3. Enter the description above.\n4. Select 'Kisumu' from the County dropdown.\n5. Scroll to 'Your private access' and note the content.\n6. Click 'Submit report securely'.",
    "Step 5: Green 'Signed in' banner showing the Gmail address. No password field. Step 6: Report submits successfully. Toast: 'Report submitted. Thank you for your courage.' Redirected to /dashboard. New report visible in the list with type chips for both Online and Physical, county Kisumu."
  );

  // ═══ MOD-07 — REPORTER DASHBOARD ═══
  modHdr("MOD-07 — Reporter Dashboard");
  tc("TC-040","MOD-07\nDashboard",
    "Dashboard Summary Cards Show Correct Counts",
    "Positive",
    "User is signed in with an account that has at least one submitted report.",
    "Account with reports submitted during MOD-02, MOD-05, or MOD-06 testing.",
    "1. Navigate to /dashboard.\n2. Observe the summary cards at the top of the page.\n3. Note the count shown on each card: 'Reports Submitted', 'Under Review', 'Resolved'.",
    "The 'Reports Submitted' card shows the total number of reports submitted from this account. 'Under Review' and 'Resolved' counts reflect the current admin-updated status of those reports. Counts are accurate and match the number of reports visible in the report list below."
  );
  tc("TC-041","MOD-07\nDashboard",
    "Report List — Status Badges Reflect Admin Updates",
    "Positive",
    "An admin has updated at least one report to 'Under Review' status (can be done during MOD-09 admin testing).",
    "A report whose status has been changed to 'Under Review' by the admin.",
    "1. On /dashboard, scroll to the report list.\n2. Locate the report whose status was changed during admin testing.\n3. Observe the status badge on that report.",
    "The report entry shows an 'Under Review' status badge. The badge colour and label match the admin-set status. This confirms that reporter dashboard status reflects admin changes in real time (or on refresh)."
  );
  tc("TC-042","MOD-07\nDashboard",
    "Empty State — No Reports Displays CTA",
    "Positive",
    "User is signed in with a brand new account that has submitted zero reports.\n(Create a fresh account for this test.)",
    "Fresh account with no reports.",
    "1. Sign in with a brand new account that has no reports.\n2. Complete onboarding.\n3. Navigate to /dashboard.\n4. Observe the report list area.",
    "In place of a report list, an empty state is shown with a friendly message (e.g. 'No reports yet') and a 'Make a report' call-to-action button. Clicking the CTA navigates to /report."
  );
  tc("TC-043","MOD-07\nDashboard",
    "Settings Link — Navigates to /settings",
    "Positive",
    "User is signed in.\nUser is on /dashboard.",
    "No specific data required.",
    "1. On /dashboard, locate the Settings link or button (in the navigation or dashboard body).\n2. Click it.",
    "User is navigated to /settings. The settings page loads with a language selection grid showing all 6 language options. No login prompt is shown."
  );
  tc("TC-044","MOD-07\nDashboard",
    "Dashboard Not Accessible Without Sign-In",
    "Validation",
    "User has signed out or has no active session.",
    "No credentials.",
    "1. Sign out if currently signed in.\n2. Type /dashboard directly into the browser address bar.\n3. Press Enter.",
    "User is immediately redirected away from /dashboard. The redirect destination is either /auth/login or the landing page. The dashboard content (reports, stats, credentials) is not rendered or visible at any point."
  );

  // ═══ MOD-08 — ADMIN REPORTS & CASE MANAGEMENT ═══
  modHdr("MOD-08 — Admin — Reports & Case Management");
  R([noteCell("PREREQUISITE: Admin credentials must be provided by Oliver Wainaina. Regular WHRD users do not have admin access. Attempting to access /admin as a non-admin results in a redirect.",AMBER_LIGHT,AMBER)]);
  M(r-1,r-1,0,13);
  tc("TC-045","MOD-08\nAdmin Reports",
    "Admin Dashboard Loads with Statistics",
    "Positive",
    "Admin account credentials received from Oliver Wainaina.\nUser is signed in as admin.",
    "Admin credentials: [provided by Oliver]",
    "1. Sign in using admin credentials.\n2. Navigate to /admin.\n3. Observe the page content.",
    "The admin dashboard loads successfully. Summary statistics are visible: total reports, reports under review, resolved reports, and any other key metrics. An admin-specific navigation bar is shown (e.g. Reports, Analytics, Map)."
  );
  tc("TC-046","MOD-08\nAdmin Reports",
    "Non-Admin User Blocked from Admin Panel",
    "Validation",
    "A non-admin (WHRD) user account is signed in.",
    "Non-admin account (e.g. account created during MOD-05 or MOD-06).",
    "1. Sign in with a non-admin account.\n2. Manually navigate to /admin by typing it into the address bar.\n3. Observe the result.",
    "The system does not display the admin panel. The user is redirected to /dashboard or a 'Not authorised' / '403 Forbidden' page. The admin report list, fact-check form, and analytics are not accessible."
  );
  tc("TC-047","MOD-08\nAdmin Reports",
    "Admin Reports List — All Submissions Visible",
    "Positive",
    "Admin is signed in.\nAt least 2 reports have been submitted by different accounts during earlier test modules.",
    "Reports submitted during MOD-02 (TC-010), MOD-05 (TC-032), MOD-06 (TC-039).",
    "1. As admin, navigate to /admin/reports.\n2. Observe the list of reports.\n3. Confirm reports from multiple user types are visible.",
    "A list or table of all reports submitted to the platform is shown. Reports from anonymous, email, and Google users all appear in the same admin list. Each report entry shows key fields: report reference/ID, reporter type, county, incident type, urgency, status, and submission date."
  );
  tc("TC-048","MOD-08\nAdmin Reports",
    "Open Individual Report — All Fields Visible",
    "Positive",
    "Admin is signed in.\nAdmin is on /admin/reports.",
    "Any report from the list (preferably TC-010 — the anonymous report with description, county, and platform set).",
    "1. On /admin/reports, click on the report submitted in TC-010.\n2. Observe the report detail page at /admin/reports/[id].",
    "The full report detail page loads. Visible fields include: description, violence type, county, perpetrator type (if set), urgency, support needed, is_ongoing flag, platform (if online), and reporter information. For anonymous reporters, a badge reads 'Anonymous' and the auto-generated username is shown. No 404 error is returned."
  );
  tc("TC-049","MOD-08\nAdmin Reports",
    "Anonymous Reporter — No Real Email Exposed in Admin View",
    "Validation",
    "Admin is viewing the detail page for a report submitted by an anonymous user (from TC-010).",
    "Report from TC-010 (anonymous submission).",
    "1. Open the detail page for the anonymous report from TC-010.\n2. Inspect the reporter information section carefully.\n3. Look for any display of a real email address, real name, or other PII.",
    "The reporter section shows: 'Anonymous' badge, the auto-generated username (e.g. brave-shield-k4x2), and the virtual email (e.g. brave-shield-k4x2@whrdhub.local). No real name, real email, phone number, or IP address is displayed. This confirms PII protection for anonymous users."
  );
  tc("TC-050","MOD-08\nAdmin Reports",
    "Admin Submits a Report on Behalf of a Survivor",
    "Positive",
    "Admin is signed in.\nAdmin is acting as an intake officer for an in-person survivor interview.",
    "Violence type: Physical / In person\nDescription: 'In-person intake: survivor reported repeated harassment by supervisor at place of work. Incident ongoing. Name withheld at request of survivor.'\nCounty: Nairobi\nUrgency: This week, help soon",
    "1. As admin, navigate to /report.\n2. Fill in: Violence type = Physical / In person.\n3. Enter the description above.\n4. County = Nairobi.\n5. Urgency = 'This week, help soon'.\n6. Observe the 'Your private access' section.\n7. Click 'Submit report securely'.",
    "Step 6: Green 'Signed in' banner shows admin's email — no password field. Step 7: Report submits successfully. Toast notification appears. Admin is redirected to /dashboard. The report is also visible in /admin/reports with the admin's account as reporter. This flow supports in-person intake."
  );

  // ═══ MOD-09 — ADMIN FACT-CHECKING ═══
  modHdr("MOD-09 — Admin — Fact-Checking & Case Status");
  tc("TC-051","MOD-09\nFact-Checking",
    "Fact-Check Form Visible on Individual Report Page",
    "Positive",
    "Admin is signed in.\nAdmin is viewing a report detail page at /admin/reports/[id].",
    "Any report from TC-047 list.",
    "1. Open any individual report at /admin/reports/[id].\n2. Scroll through the page to locate the fact-check or case management section.",
    "A fact-check/case management form is visible on the report detail page. It contains at minimum: a status dropdown (options including Pending, Under Review, Fact-Checked, Resolved, Rejected), an admin notes textarea, and a Save/Update button."
  );
  tc("TC-052","MOD-09\nFact-Checking",
    "Update Case Status to 'Under Review'",
    "Positive",
    "Admin is on the detail page of a report with current status 'Pending'.",
    "Report: TC-010 (anonymous submission)\nNew status: Under Review\nAdmin note: 'Case reviewed during WHRD Hub UAT exercise — initial intake complete.'",
    "1. On the report detail page, open the status dropdown.\n2. Select 'Under Review'.\n3. In the admin notes field, enter: 'Case reviewed during WHRD Hub UAT exercise — initial intake complete.'\n4. Click 'Save' (or equivalent update button).\n5. Observe the confirmation and the status display.",
    "Step 4-5: The status is updated successfully. A success indicator (toast, inline message, or page reload with updated status) confirms the save. The report detail page now shows 'Under Review' as the current status. When the reporter (anonymous account from TC-013) views their dashboard, their report's status badge also reads 'Under Review'."
  );
  tc("TC-053","MOD-09\nFact-Checking",
    "Update Case Status to 'Resolved'",
    "Positive",
    "Admin is on the detail page of a report. Status may be 'Under Review' from TC-052.",
    "New status: Resolved\nAdmin note: 'Case resolved during UAT — referral to legal support service completed.'",
    "1. On the report detail page, change the status dropdown to 'Resolved'.\n2. Update the admin notes field with the note above.\n3. Click 'Save'.\n4. Navigate to the reporter's dashboard (sign in as the reporter in a separate browser tab).",
    "Step 3: Save succeeds with confirmation. Step 4: The reporter's dashboard now shows the report status as 'Resolved'. The 'Resolved' counter on the reporter's dashboard increments by one. The admin's overall resolved count in /admin also increments."
  );
  tc("TC-054","MOD-09\nFact-Checking",
    "Admin Notes Persist After Save and Page Refresh",
    "Validation",
    "Admin is on the detail page of a report.\nAdmin notes have been saved in TC-052.",
    "Report from TC-010 with notes entered in TC-052.",
    "1. On the report detail page where notes were saved in TC-052, observe the admin notes field.\n2. Hard-refresh the page (Ctrl + Shift + R or Cmd + Shift + R).\n3. Re-open the same report.\n4. Observe the admin notes field.",
    "After a page refresh and re-opening the report, the admin note entered in TC-052 ('Case reviewed during WHRD Hub UAT exercise — initial intake complete.') is still present in the admin notes field. Notes are persisted to the database, not stored only in browser session."
  );
  tc("TC-055","MOD-09\nFact-Checking",
    "Reporter Type Indicator — Anonymous vs Authenticated",
    "Validation",
    "Admin has access to reports from both anonymous and authenticated users in /admin/reports.",
    "Report from TC-010 (anonymous) and report from TC-032 (email user).",
    "1. Open the report from TC-010 (anonymous user) and note the reporter info section.\n2. Open the report from TC-032 (email user) and note the reporter info section.\n3. Compare the two.",
    "TC-010 report: Reporter section shows 'Anonymous' badge, auto-generated username, virtual email. TC-032 report: Reporter section shows the real email address of the authenticated user. The distinction between anonymous and authenticated reporters is clearly and correctly indicated."
  );

  // ═══ MOD-10 — ANALYTICS & MAP ═══
  modHdr("MOD-10 — Admin — Analytics & Map Interface");
  tc("TC-056","MOD-10\nAnalytics",
    "Analytics Page Loads with Charts",
    "Positive",
    "Admin is signed in.\nAt least 3 reports with different counties, types, and urgency levels have been submitted during earlier testing.",
    "Reports from TC-010 (Nairobi, Online), TC-032 (Mombasa, Physical), TC-039 (Kisumu, Both), TC-050 (Nairobi, Physical).",
    "1. As admin, navigate to /admin/analytics.\n2. Allow all charts to fully load.\n3. Observe each chart type on the page.",
    "The analytics page loads without errors. Charts or visualisations are visible, potentially including: reports by county, reports by violence type, reports over time (line/bar), urgency distribution, and support type breakdown. All charts render with data reflecting the reports submitted during testing."
  );
  tc("TC-057","MOD-10\nAnalytics",
    "Charts Reflect Live Data After New Submission",
    "Positive",
    "Admin is on /admin/analytics with current chart data visible.",
    "Submit one new report from a different account with County = Kilifi.",
    "1. In a separate browser tab, sign in as a reporter (non-admin) and submit a new report with County = Kilifi.\n2. Return to the admin /admin/analytics tab.\n3. Refresh the analytics page.\n4. Observe the county chart or data.",
    "After refresh, the Kilifi count in the county chart (or data table) increments to reflect the newly submitted report. Charts are data-driven and reflect real-time database state on page load."
  );
  tc("TC-058","MOD-10\nAnalytics",
    "Map Loads with Incident Markers",
    "Positive",
    "Admin is signed in.\nAt least 2 reports have been submitted with GPS coordinates captured (TC-022 GPS test) or county data.",
    "Reports from earlier test modules.",
    "1. As admin, navigate to the map view (check admin navigation for 'Map' link).\n2. Allow the map to fully load.\n3. Observe the markers or pins on the map.",
    "A Kenya map renders successfully. Markers or pins are displayed representing submitted incidents — either at GPS coordinates (if captured) or at county-level centroids. The map is interactive: it can be zoomed with the scroll wheel and panned by dragging."
  );
  tc("TC-059","MOD-10\nAnalytics",
    "Map Pin Click — Popup Shows No PII",
    "Validation",
    "Admin is on the map view.\nAt least one marker is visible.",
    "No specific data — inspect every visible popup.",
    "1. Click on any map marker/pin.\n2. Observe the popup or sidebar that appears.\n3. Record every piece of information displayed in the popup.\n4. Repeat for all visible markers.",
    "Each popup displays only anonymised data: county name, incident type, date, and urgency level. Under no circumstances is a victim's name, real email address, physical address, phone number, or IP address displayed in any map popup. This is a critical privacy requirement."
  );
  tc("TC-060","MOD-10\nAnalytics",
    "Map Renders on Mobile Viewport",
    "Positive",
    "Admin is signed in.\nTesting on a mobile device or with browser resized to 375px width.",
    "Mobile device or browser developer tools at 375px width.",
    "1. Open the map view on a mobile device OR resize the desktop browser to 375px wide using developer tools.\n2. Observe the map layout.\n3. Attempt to tap a marker.",
    "The map renders full-width on mobile. No horizontal scroll overflow. Markers are visible and tappable with a finger (minimum touch target ~44px). Popups display within the visible screen area without being cut off."
  );
  tc("TC-061","MOD-10\nAnalytics",
    "Analytics Charts Responsive on Mobile",
    "Positive",
    "Admin is signed in.\nBrowser resized to 375px width.",
    "Mobile-width browser viewport.",
    "1. On /admin/analytics, resize browser to 375px width.\n2. Scroll through all charts.\n3. Observe chart layout and readability.",
    "All charts reflow to fit the narrow viewport. No chart overflows horizontally. Chart labels and data values remain legible. No chart is completely hidden or inaccessible."
  );

  // ═══ MOD-11 — SETTINGS & LANGUAGE ═══
  modHdr("MOD-11 — Settings & Language Switcher");
  tc("TC-062","MOD-11\nSettings",
    "Settings Page — Six Language Options Displayed",
    "Positive",
    "User is signed in (any account type).",
    "No specific data required.",
    "1. Navigate to /settings.\n2. Observe the language selection section.",
    "The settings page loads and displays a grid of six language options: English 🇬🇧, Kiswahili 🇰🇪, Français 🇫🇷, Português 🇧🇷, Deutsch 🇩🇪, العربية 🇸🇦. Each option shows the flag, the native language name, and the English name. The currently active language is highlighted (purple border/background with a check icon)."
  );
  tc("TC-063","MOD-11\nSettings",
    "Select French — All Platform Text Updates to French",
    "Positive",
    "User is on /settings. Current language is English.",
    "Language to select: Français",
    "1. On /settings, click the 'Français' language card.\n2. Observe the immediate reaction on the settings page.\n3. Navigate to the landing page (/).\n4. Navigate to /report.\n5. Navigate to /auth/login.",
    "Step 2: A toast notification appears: 'Français — Language saved.' The settings page text (title, subtitle, auto-detect note) immediately changes to French. Steps 3-5: ALL platform text across landing page, report form labels, field placeholders, button text, and login form is rendered in French. No English text remains except for the brand name 'WHRD Hub'."
  );
  tc("TC-064","MOD-11\nSettings",
    "Select Arabic — RTL Layout Applied",
    "Positive",
    "User is on /settings.",
    "Language to select: العربية",
    "1. On /settings, click the 'العربية' language card.\n2. Observe the page layout immediately after selection.\n3. Navigate to /report and observe the form layout.",
    "Step 2: The page layout changes to right-to-left (RTL). Text is right-aligned. Navigation elements mirror (logo on right, nav links on left, or equivalent mirroring). Step 3: The report form shows Arabic labels only (no secondary English or Swahili). Text inputs, dropdowns, and pill buttons all align to the right side."
  );
  tc("TC-065","MOD-11\nSettings",
    "Language Persists After Hard Refresh",
    "Validation",
    "User has selected Kiswahili (or any non-English language) on /settings.",
    "Language last selected: Kiswahili",
    "1. Select 'Kiswahili' on /settings.\n2. Hard-refresh the page: press Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac).\n3. Observe the page language after reload.",
    "After a hard refresh, the page reloads in Kiswahili. The language selection is stored in the browser's localStorage. The platform does not revert to English on refresh. The active language card on /settings still shows Kiswahili as selected."
  );
  tc("TC-066","MOD-11\nSettings",
    "Compact Language Switcher in Navigation Bar",
    "Positive",
    "User is on any page (landing page, /report, or /dashboard).",
    "No specific data required.",
    "1. Locate the globe icon with a language code (e.g. 'EN') in the navigation bar.\n2. Click it.\n3. Observe the dropdown.\n4. Select a different language from the dropdown.",
    "Step 2-3: A dropdown menu appears listing all 6 languages with their flags and native names. The current language is highlighted. Step 4: Selecting a language from the nav dropdown immediately updates all visible page text without requiring navigation to /settings. The language code in the nav bar updates to reflect the new selection (e.g. 'FR' for Français)."
  );
  tc("TC-067","MOD-11\nSettings",
    "Login Page Includes Language Switcher",
    "Positive",
    "User is on /auth/login. Language is currently set to English.",
    "Language to change: Deutsch",
    "1. Navigate to /auth/login.\n2. Locate the language switcher on the login page.\n3. Change the language to Deutsch.\n4. Observe the login form content.",
    "The login page includes a language switcher (in the header area of the login card). Changing to Deutsch updates all login form text: title ('Willkommen zurück' or equivalent), field labels, button text ('Anmelden'), and the anonymous user hint. The Google sign-in button also updates its label."
  );

  // ═══ MOD-12 — MULTILINGUAL ═══
  modHdr("MOD-12 — Multilingual Testing (EN/SW/FR/PT/DE/AR)");
  tc("TC-068","MOD-12\nMultilingual",
    "EN + SW Dual Labels on Report Form",
    "Positive",
    "Platform language is set to English.",
    "Language: English (default or set via /settings)",
    "1. Set platform language to English.\n2. Navigate to /report.\n3. Inspect the field labels throughout the form — specifically: 'Tell us what happened', 'County / Region', 'Where did the violence happen?', 'Password'.",
    "When language is English, each field label shows the English label as the primary text, with the Swahili equivalent displayed in smaller, muted text in parentheses. Example: 'Tell us what happened (Tuambie kilichotokea)'. This dual-language display applies to English and Swahili only."
  );
  tc("TC-069","MOD-12\nMultilingual",
    "SW + EN Dual Labels on Report Form",
    "Positive",
    "Platform language is set to Kiswahili.",
    "Language: Kiswahili (set via /settings or nav switcher)",
    "1. Set platform language to Kiswahili.\n2. Navigate to /report.\n3. Inspect the same field labels as TC-068.",
    "When language is Swahili, each field label shows the Swahili label as the primary text, with the English equivalent in smaller, muted text in parentheses. Example: 'Tuambie kilichotokea (Tell us what happened)'. Swahili is the primary language; English is the secondary."
  );
  tc("TC-070","MOD-12\nMultilingual",
    "FR — Single Labels Only (No Secondary Language)",
    "Validation",
    "Platform language is set to Français.",
    "Language: Français",
    "1. Set platform language to Français.\n2. Navigate to /report.\n3. Inspect all field labels.\n4. Look specifically for any secondary language text in parentheses.",
    "All field labels are shown in French only. No secondary language (English or Swahili) appears in parentheses. This is the correct behaviour for FR, PT, DE, and AR — dual-language labels only appear in EN and SW modes."
  );
  tc("TC-071","MOD-12\nMultilingual",
    "Validation Error Messages Translate",
    "Validation",
    "Platform language is set to Kiswahili.\nUser is on /report.",
    "Language: Kiswahili",
    "1. Set language to Kiswahili.\n2. Navigate to /report.\n3. Without filling any required fields, click 'Submit report securely' (or equivalent Swahili button label).\n4. Observe the inline error messages.",
    "The inline validation errors appear in Swahili, not English. Example: the county error should read in Swahili ('Tafadhali chagua kaunti au mkoa' or equivalent). The button label also shows in Swahili. No English error messages are displayed when the language is set to Swahili."
  );
  tc("TC-072","MOD-12\nMultilingual",
    "Landing Page Fully Translated — All 6 Languages",
    "Positive",
    "All 6 languages are available in the settings.",
    "Test each language in sequence: EN, SW, FR, PT, DE, AR.",
    "1. For each language (EN, SW, FR, PT, DE, AR):\n   a. Set the language via /settings or nav switcher.\n   b. Navigate to the landing page (/).\n   c. Check: navigation labels, hero heading and subtitle, 'How it works' section, 'What you can report' list, CTA section, emergency contacts, footer.\n2. Record any untranslated (English) text found.",
    "For all 6 languages, the entire landing page renders in the selected language. The sections covered are: nav (Sign in, Dashboard, Report now), hero (title, subtitle, CTA buttons, trust indicators), safety banner, How it works (label, title, subtitle, 3 step cards), What you can report (items), stats, CTA section, emergency strip, and footer. No English text appears in non-English modes (exception: brand name 'WHRD Hub' is acceptable)."
  );
  tc("TC-073","MOD-12\nMultilingual",
    "Success Page Translates After Portuguese Submission",
    "Positive",
    "Platform language set to Português.\nUser has just submitted a report (TC-010 flow).",
    "Language: Português\nComplete TC-010 steps while language is set to Português.",
    "1. Set language to Português.\n2. Navigate to /report and submit a valid report (Violence type = Online, Description = 30+ chars, County = Nairobi, Password = UATPort2026).\n3. Observe the /report/success page.",
    "The /report/success page displays entirely in Portuguese: the 'Report received' heading in Portuguese, all three next-steps in Portuguese, the 'You are already signed in' notice in Portuguese, and both action buttons ('Go to your dashboard', 'Return home') labelled in Portuguese."
  );
  tc("TC-074","MOD-12\nMultilingual",
    "Language Auto-Detect from Browser Setting",
    "Positive",
    "Browser language setting is changeable in the test environment.\nLocalStorage key 'whrd-language' is cleared.",
    "Browser set to French (fr-FR) in browser language settings.\nlocalStorage cleared.",
    "1. In browser settings, set the preferred language to French (fr-FR) as the primary language.\n2. Clear localStorage (DevTools > Application > LocalStorage > Clear All).\n3. Navigate to the staging URL for the first time.\n4. Observe the landing page language without having manually selected a language.",
    "The platform auto-detects the browser language and loads in French without any manual selection. This behaviour occurs only when no language preference has been previously saved in localStorage. If localStorage contains a saved preference, that preference takes priority over the browser language."
  );
  tc("TC-075","MOD-12\nMultilingual",
    "Arabic RTL — Report Form Direction and Usability",
    "Positive",
    "Platform language is set to Arabic (العربية).",
    "Language: Arabic",
    "1. Set language to Arabic.\n2. Navigate to /report.\n3. Attempt to fill in each field type: text input, dropdown (county), pill button, checkbox, password field.\n4. Submit a valid report.",
    "The report form renders in RTL layout. All text and labels are right-aligned. Input fields accept right-to-left text entry. Dropdown opens correctly. Pill buttons are selectable. Checkboxes work. Password field has show/hide toggle on the correct (left) side in RTL. A valid report can be submitted successfully while in Arabic mode."
  );

  // ═══ MOD-13 — ACCESSIBILITY ═══
  modHdr("MOD-13 — Accessibility — Keyboard, Contrast & Screen Reader");
  tc("TC-076","MOD-13\nAccessibility",
    "Keyboard Tab Navigation — Report Form",
    "Positive",
    "User is on /report.\nNo mouse input — keyboard only for this test.",
    "Keyboard only (Tab, Shift+Tab, Enter, Space).",
    "1. Navigate to /report using the browser address bar.\n2. Without using the mouse, press Tab repeatedly.\n3. Observe which elements receive focus and in what order.\n4. When focus lands on a pill button, press Enter or Space.\n5. When focus lands on the county dropdown, use arrow keys to select 'Nairobi'.",
    "Every interactive element — pills, text inputs, the county dropdown, checkboxes, the file picker button, and the Submit button — receives visible keyboard focus in a logical top-to-bottom, left-to-right order. Pressing Enter/Space on a pill selects it. Arrow keys navigate dropdown options. No interactive element is skipped or inaccessible by keyboard."
  );
  tc("TC-077","MOD-13\nAccessibility",
    "Focus Ring Visible on All Interactive Elements",
    "Positive",
    "User is on /report (or any page with interactive elements).",
    "No specific data required.",
    "1. Press Tab on any page to begin keyboard navigation.\n2. Observe each focused element as Tab is pressed.\n3. Test on: pill buttons, text inputs, dropdowns, checkboxes, the submit button, and navigation links.",
    "Every focused element displays a clearly visible focus ring (purple outline or equivalent). No element receives focus without a visual indicator. The focus ring is distinct enough to be visible on both light and dark backgrounds. Elements do not appear 'invisible focused'."
  );
  tc("TC-078","MOD-13\nAccessibility",
    "Primary Button Colour Contrast — WCAG AA",
    "Positive",
    "User is on any page containing the primary 'Report now' or 'Submit report securely' button.",
    "Use browser DevTools colour picker or a contrast checker tool (e.g. WebAIM Contrast Checker).",
    "1. Identify the primary purple button (e.g. 'Report now' or 'Submit report securely').\n2. Using DevTools or a colour picker, note the background colour (purple) and the text colour (white).\n3. Input these values into a WCAG contrast checker.",
    "The contrast ratio between white text (#FFFFFF) and the purple button background meets or exceeds 4.5:1, the WCAG 2.1 AA minimum for normal-weight text at 14px. Record the actual contrast ratio in the Actual Result column."
  );
  tc("TC-079","MOD-13\nAccessibility",
    "Error Messages Accessible to Screen Readers",
    "Positive",
    "User has VoiceOver (Mac) or NVDA (Windows) enabled.\nUser is on /report.",
    "Screen reader software active.",
    "1. Enable your screen reader (VoiceOver: Cmd+F5 on Mac; NVDA: Ctrl+Alt+N on Windows).\n2. Navigate to /report.\n3. Press the submit button without filling required fields to trigger validation errors.\n4. Listen to what the screen reader announces.",
    "After triggering validation errors, the screen reader announces the error messages — either by reading them automatically (via aria-live region announcement) or by moving focus to the first error field and reading its label and error text. The user is able to understand what went wrong without needing to visually inspect the page."
  );
  tc("TC-080","MOD-13\nAccessibility",
    "No Horizontal Scroll at 375px Viewport",
    "Positive",
    "Desktop browser with developer tools available.",
    "Browser viewport: 375px wide (iPhone SE simulation in DevTools).",
    "1. Open DevTools (F12).\n2. Enable responsive design mode and set the viewport to 375px wide.\n3. Navigate through: landing page, /report (all sections), /auth/login, /dashboard.\n4. On each page, check for horizontal scrollbars or content that extends beyond the viewport width.",
    "No horizontal scrollbar appears on any page at 375px viewport width. All content — including pill buttons, cards, tables, and navigation — fits within the 375px width. Text wraps correctly and does not overflow horizontally."
  );
  tc("TC-081","MOD-13\nAccessibility",
    "Touch Target Sizes — Mobile Usability",
    "Positive",
    "Testing on a physical mobile device (or mobile emulation at 375px).",
    "Mobile device or 375px emulation.",
    "1. On a mobile device, navigate to /report.\n2. Attempt to tap each interactive element: pills, checkboxes, dropdown, submit button, show/hide password toggle.\n3. Note any elements that require multiple tap attempts to activate.",
    "All interactive elements are tappable on the first attempt without precision. Pill buttons, checkboxes, and all other touch targets meet the minimum 44×44px touch target size. The show/hide password toggle (eye icon) is reachable without accidental adjacent taps."
  );
  tc("TC-082","MOD-13\nAccessibility",
    "Pinch-Zoom Not Disabled on Mobile",
    "Positive",
    "Testing on a physical mobile device.",
    "Mobile device with pinch-zoom capability.",
    "1. On a mobile device, open any page on the platform.\n2. Attempt to pinch-zoom the page.\n3. Attempt to double-tap to zoom.",
    "Pinch-zoom works. The page scales up when pinched. The viewport meta tag does NOT include 'user-scalable=no' or 'maximum-scale=1' — these would block accessibility-required zoom functionality. Users who need to zoom for readability can do so freely."
  );

  // Column widths matching ZMRS proportions
  const colWidths = [
    {wch:10}, // Test ID
    {wch:14}, // Module
    {wch:32}, // Scenario Title
    {wch:11}, // Test Type
    {wch:36}, // Pre-Conditions
    {wch:30}, // Test Data
    {wch:52}, // Steps
    {wch:42}, // Expected
    {wch:30}, // Actual (tester)
    {wch:12}, // Status
    {wch:12}, // Defect Ref
    {wch:14}, // Tester Name
    {wch:13}, // Date Tested
    {wch:28}, // Comments
  ];

  const rowHeights = rows.map((row, i) => {
    if (i === 0) return { hpt: 36 };
    if (i === 1) return { hpt: 40 };
    const maxLen = Math.max(...row.map(c => (c?.v?.toString() || "").length));
    return { hpt: maxLen > 600 ? 200 : maxLen > 400 ? 150 : maxLen > 200 ? 110 : maxLen > 100 ? 70 : maxLen > 50 ? 45 : 30 };
  });

  return buildSheet(rows, colWidths, merges, rowHeights);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHEET 3 — DEFECT LOG
// ═══════════════════════════════════════════════════════════════════════════════
function sheetDefectLog() {
  const rows = [];
  const merges = [];
  let r = 0;
  const M = (rs,re,cs,ce) => merges.push({s:{r:rs,c:cs},e:{r:re,c:ce}});
  const R = (row) => { rows.push(row); return r++; };

  R([titleCell("WHRD HUB UAT — DEFECT LOG",PURPLE_DARK,WHITE,13)]);
  M(r-1,r-1,0,11);
  R([noteCell("Log ALL defects here immediately. Include the URL, the test case reference, and a screenshot filename where possible. Do not modify a defect entry after logging — add a new row if needed.",AMBER_LIGHT,AMBER)]);
  M(r-1,r-1,0,11);

  R([
    hdrCell("Defect ID",    GREY_DARK,WHITE,10),
    hdrCell("Test Case Ref",GREY_DARK,WHITE,10),
    hdrCell("Module",       GREY_DARK,WHITE,10),
    hdrCell("Defect Title", GREY_DARK,WHITE,10),
    hdrCell("Severity\n(Critical/High/\nMedium/Low)", GREY_DARK,WHITE,10),
    hdrCell("Defect Description\n(What happened vs. what was expected)", GREY_DARK,WHITE,10),
    hdrCell("Steps to Reproduce", GREY_DARK,WHITE,10),
    hdrCell("URL at Point\nof Failure", GREY_DARK,WHITE,10),
    hdrCell("Screenshot /\nEvidence Ref", GREY_DARK,WHITE,10),
    hdrCell("Status\n(Open/Fixed/\nRetested/Closed)", GREY_DARK,WHITE,10),
    hdrCell("Assigned To\n(Dev Team)", GREY_DARK,WHITE,10),
    hdrCell("Date Raised", GREY_DARK,WHITE,10),
    hdrCell("Date Fixed /\nClosed", GREY_DARK,WHITE,10),
  ]);
  M(r-1,r-1,0,0); // just ensure header row is separate

  for (let i = 1; i <= 20; i++) {
    const id = `DEF-${String(i).padStart(3,"0")}`;
    rows.push([
      cell(id, {bold:true, fg:RED}),
      inputCell(), inputCell(), inputCell(),
      inputCell(),
      inputCell(), inputCell(), inputCell(), inputCell(),
      statusCell("Open"),
      inputCell(), inputCell(), inputCell(),
    ]);
    r++;
  }

  const colWidths = [
    {wch:10},{wch:13},{wch:12},{wch:28},{wch:13},
    {wch:40},{wch:35},{wch:28},{wch:15},
    {wch:13},{wch:16},{wch:13},{wch:13},
  ];
  const rowHeights = rows.map((_,i) => ({ hpt: i<=2?28:i===3?40:55 }));
  return buildSheet(rows, colWidths, merges, rowHeights);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHEET 4 — SIGN-OFF REGISTER
// ═══════════════════════════════════════════════════════════════════════════════
function sheetSignOff() {
  const rows = [];
  const merges = [];
  let r = 0;
  const M = (rs,re,cs,ce) => merges.push({s:{r:rs,c:cs},e:{r:re,c:ce}});
  const R = (row) => { rows.push(row); return r++; };
  const B = (n=1) => { for(let i=0;i<n;i++) R([]); };

  R([titleCell("WHRD HUB UAT — FORMAL SIGN-OFF REGISTER",PURPLE_DARK,WHITE,13)]); M(r-1,r-1,0,6);
  R([noteCell("Each UAT participant must sign off below ONLY when all scenarios assigned to their role have been executed and the results are recorded. A sign-off certifies that testing is complete and the results are accurate.",AMBER_LIGHT,AMBER)]); M(r-1,r-1,0,6);
  B();

  R([
    hdrCell("Name",                  GREY_DARK,WHITE,10),
    hdrCell("Job Title / Role",      GREY_DARK,WHITE,10),
    hdrCell("UAT Role",              GREY_DARK,WHITE,10),
    hdrCell("Modules Tested",        GREY_DARK,WHITE,10),
    hdrCell("Scenarios Passed /\nTotal Assigned", GREY_DARK,WHITE,10),
    hdrCell("Sign-Off Date",         GREY_DARK,WHITE,10),
    hdrCell("Signature / Initials",  GREY_DARK,WHITE,10),
  ]);

  const testers = [
    ["Oliver Wainaina", "Product Owner / Platform Developer", "Test Co-ordinator & Final Reviewer", "All Modules (MOD-01 to MOD-13)", "", "", ""],
    ["",  "Reporter / WHRD User",       "Primary Reporter Tester",  "MOD-01, MOD-02, MOD-03, MOD-04, MOD-07", "", "", ""],
    ["",  "Reporter / WHRD User",       "Anonymous Flow Tester",    "MOD-02, MOD-03, MOD-04, MOD-11, MOD-12", "", "", ""],
    ["",  "Admin / Case Worker",        "Admin Flow Tester",        "MOD-08, MOD-09, MOD-10, MOD-01", "", "", ""],
    ["",  "Reporter — Google account",  "Google OAuth Tester",      "MOD-06, MOD-04, MOD-05, MOD-07", "", "", ""],
    ["",  "Reporter — Email account",   "Email Flow Tester",        "MOD-05, MOD-04, MOD-07, MOD-13", "", "", ""],
    ["",  "Accessibility Tester",       "A11y & Multilingual",      "MOD-13, MOD-12, MOD-11", "", "", ""],
  ];
  testers.forEach(([name,...rest]) => {
    R([
      name ? cell(name,{bold:true,fg:PURPLE}) : inputCell(),
      cell(rest[0],{sz:10}), cell(rest[1],{sz:10}), cell(rest[2],{sz:10}),
      inputCell(), inputCell(), inputCell(),
    ]);
  });
  B(2);

  R([sectionHdr("OVERALL UAT SIGN-OFF — PRODUCT OWNER FINAL APPROVAL",PURPLE_DARK)]); M(r-1,r-1,0,6);

  const signOff = [
    ["UAT Outcome", "[ ] PASSED — System approved for use\n[ ] FAILED — Outstanding critical defects prevent approval\n[ ] CONDITIONAL — Approved with known minor defects deferred"],
    ["Outstanding Defects at Close", "Critical: _____     High: _____     Medium: _____     Low: _____"],
    ["Go-Live Recommendation", "[ ] Approved for go-live as at [date]\n[ ] Conditional approval — defects listed above to be resolved within [n] days\n[ ] Not approved — UAT failed, defects must be resolved and retested"],
    ["Product Owner Name", "Oliver Wainaina"],
    ["Product Owner Signature", ""],
    ["Date of Final Sign-Off", ""],
  ];
  signOff.forEach(([k,v]) => R([labelCell(k), v ? valueCell(v) : inputCell(), inputCell(), inputCell(), inputCell(), inputCell(), inputCell()]));
  M(r-signOff.length,   r-signOff.length,   1, 6);
  M(r-signOff.length+1, r-signOff.length+1, 1, 6);
  M(r-signOff.length+2, r-signOff.length+2, 1, 6);
  M(r-signOff.length+3, r-signOff.length+3, 1, 6);
  M(r-signOff.length+4, r-signOff.length+4, 1, 6);
  M(r-signOff.length+5, r-signOff.length+5, 1, 6);
  B(2);

  R([noteCell("UAT PASS CRITERIA: (1) All CRITICAL test cases pass. (2) ≥ 90% of HIGH test cases pass. (3) All three user flows (Anonymous, Email, Google) complete end-to-end without blocking defects. (4) Admin can view, fact-check, and update case status. (5) Platform usable in English and Swahili. (6) No PII exposed on map or admin list. (7) No horizontal scroll on 375px mobile.",PURPLE_LIGHT,PURPLE_DARK)]); M(r-1,r-1,0,6);

  const colWidths = [{wch:28},{wch:28},{wch:24},{wch:40},{wch:18},{wch:16},{wch:20}];
  const rowHeights = rows.map((_,i) => ({ hpt: i<=1?32:i===2?20:i<=3?40:60 }));
  return buildSheet(rows, colWidths, merges, rowHeights);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE
// ═══════════════════════════════════════════════════════════════════════════════
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, sheetOverview(),   "UAT Plan Overview");
XLSX.utils.book_append_sheet(wb, sheetScenarios(),  "Test Scenarios");
XLSX.utils.book_append_sheet(wb, sheetDefectLog(),  "Defect Log");
XLSX.utils.book_append_sheet(wb, sheetSignOff(),    "UAT Sign-Off Register");

XLSX.writeFile(wb, OUT, { bookType: "xlsx", type: "buffer", cellStyles: true });
console.log("✓ Written:", OUT);
