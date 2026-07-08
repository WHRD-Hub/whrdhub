# USSD Setup Guide - WHRD Hub & Africa's Talking

## Overview
This guide explains how to set up USSD (Unstructured Supplementary Service Data) for WHRD Hub using Africa's Talking (AT) shared code infrastructure.

USSD enables users on basic feature phones to report TFGBV incidents via simple menu-driven interactions using codes like `*384*` (Africa's Talking shared code).

---

## 1. Architecture Overview

```
User Phone (USSD Menu)
    ↓
Africa's Talking Network
    ↓
Your USSD API: /api/ussd
    ↓
Supabase Database
    ↓
Reports stored as:
  - Type: incident_types array
  - Channel: "ussd"
  - Anonymous account created
  - Session logged in ussd_sessions table
```

---

## 2. Current Implementation Status

✅ **Already Implemented:**
- USSD API endpoint at `/api/ussd` (app/api/ussd/route.ts)
- Multi-language menus (English/Kiswahili)
- Incident type selection (physical violence, online harassment, sexual violence, workplace abuse, other)
- County/region selection (Nairobi, Mombasa, Kisumu, Nakuru, Other)
- Urgency level selection (Immediate, Within week, Not urgent)
- Report confirmation & submission
- Anonymous account creation for USSD users
- Phone number masking for privacy (last 4 digits visible)
- Session logging in `ussd_sessions` table
- Emergency contacts menu (police, GBV hotline, childline)

✅ **Report Form Integration:**
- USSD reports stored in `reports` table with:
  - `channel: "ussd"` for tracking source
  - `reporter_type: "anonymous"` for privacy
  - `user_id` linked to auto-created anonymous account
  - Description includes masked phone number
  - Status set to "submitted" for admin review

---

## 3. Database Setup

### Required Tables

#### `reports` table
Already configured - includes all USSD fields:
- `channel`: Identifies USSD submissions
- `reporter_type`: "anonymous" for USSD users
- `user_id`: Links to auto-created anonymous account
- `incident_types`: Array of violation types
- `county`: Region/county information
- `urgency`: Priority level
- `status`: Set to "submitted"
- `verification_status`: Set to "pending"

#### `ussd_sessions` table
Store USSD interaction logs for audit trail:

```sql
CREATE TABLE IF NOT EXISTS ussd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  text_input TEXT NOT NULL,
  current_step TEXT NOT NULL,
  report_id UUID REFERENCES reports(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_ussd_sessions_session_id ON ussd_sessions(session_id);
CREATE INDEX idx_ussd_sessions_report_id ON ussd_sessions(report_id);
```

---

## 4. Africa's Talking Configuration

### A. Register Service on Africa's Talking

1. **Sign up / Log in** at https://africastalking.com/
2. **Create an app** in the dashboard
3. **Activate USSD** from the services menu
4. **Set callback URL** to your endpoint:
   - **Production:** `https://whrdhub.vercel.app/api/ussd`
   - **Development:** Use Africa's Talking simulator or expose localhost with ngrok

### B. Shared Code vs Dedicated Code

**Shared Code (Recommended for MVP):**
- Use Africa's Talking shared code: `*384*`
- Cost-effective (shared with other services)
- Users dial: `*384*SHORTCODE#` (SHORTCODE = your assigned number)
- Example: `*384*30404#` for WHRD Hub
- No phone number setup required

**Dedicated Code (Later, if needed):**
- Buy your own short code (e.g., `*380*`)
- Users dial directly: `*380#`
- Higher cost but more branded
- Better UX for recurring users

### C. Environment Configuration

Add to `.env.local`:

```env
# Africa's Talking USSD
AT_USSD_API_KEY=your_api_key_from_dashboard
AT_USSD_USERNAME=your_username
AT_USSD_SHORT_CODE=30404  # Your assigned short code
AT_USSD_SERVICE_CODE=*380*639*  # For testing with AT simulator
NEXT_PUBLIC_USSD_SHORTCODE=*384*30404  # Shared code format
```

### D. Webhook Security

Africa's Talking includes signature verification. Add to `/api/ussd/route.ts`:

```typescript
import crypto from "crypto";

function verifyATSignature(signature: string, body: string): boolean {
  const secret = process.env.AT_USSD_API_KEY || "";
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// In POST handler:
const signature = req.headers.get("X-Signature") || "";
if (!verifyATSignature(signature, body)) {
  return new NextResponse("Unauthorized", { status: 403 });
}
```

---

## 5. Report Form Integration Points

### A. Show USSD Access in Report Form

Add to the report page to inform users:

```tsx
// In app/report/page.tsx header or info section
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-blue-800">
    <strong>No internet?</strong> You can also report via USSD:
    <br />
    Dial: <code className="font-mono font-bold">*384*30404#</code> (Shared code)
  </p>
</div>
```

### B. Link USSD Sessions to Report Details

When admin views a report submitted via USSD:

```typescript
// In /dashboard/reports/[id]/page.tsx
const { data: ussdSession } = await supabase
  .from("ussd_sessions")
  .select("*")
  .eq("report_id", reportId)
  .single();

if (ussdSession) {
  // Display:
  // - Session ID
  // - Phone number (masked)
  // - Full USSD conversation
  // - Timestamp
}
```

### C. Analytics Dashboard

Track USSD submissions separately:

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_ussd_reports,
  COUNT(CASE WHEN channel = 'ussd' THEN 1 END) as reports_via_ussd,
  COUNT(CASE WHEN channel != 'ussd' THEN 1 END) as reports_via_web
FROM reports
GROUP BY date
ORDER BY date DESC;
```

---

## 6. Testing & Deployment

### A. Test Locally with Africa's Talking Simulator

1. Open Africa's Talking USSD Simulator: https://africastalking.com/ussd/simulator
2. Dial your test service code
3. Test complete flow:
   - `1` → Report incident
   - `1` → Physical violence
   - `1` → Immediate danger
   - `1` → Nairobi
   - `1` → Confirm & submit

### B. Monitor API in Production

Add logging:

```typescript
console.log("USSD Request:", {
  sessionId,
  phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, "*"),
  step: inputs.length,
  timestamp: new Date(),
});
```

Check Vercel logs via:
```bash
vercel logs --since 1h
```

### C. Test Database Inserts

Verify reports appear in Supabase:

```sql
SELECT id, channel, reporter_type, incident_types, county, urgency, created_at
FROM reports
WHERE channel = 'ussd'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 7. Production Checklist

- [ ] Africa's Talking account created & verified
- [ ] USSD service activated on AT dashboard
- [ ] Callback URL set to production endpoint
- [ ] Short code assigned (e.g., 30404)
- [ ] Environment variables added to Vercel:
  - `AT_USSD_API_KEY`
  - `AT_USSD_USERNAME`
  - `AT_USSD_SHORT_CODE`
  - `NEXT_PUBLIC_USSD_SHORTCODE`
- [ ] Webhook signature verification implemented
- [ ] `ussd_sessions` table created in Supabase
- [ ] Report form UI includes USSD access instructions
- [ ] Admin dashboard displays USSD session details
- [ ] Analytics track USSD vs web submissions
- [ ] Error handling tested (network failures, invalid input)
- [ ] Phone number masking verified (last 4 digits only)
- [ ] Tested complete USSD flow end-to-end
- [ ] Documented USSD code in user-facing materials

---

## 8. User Instructions

### For Feature Phone Users

**To report via USSD:**
1. On any phone, dial: `*384*30404#`
2. Select language (English/Kiswahili)
3. Choose "Report an incident"
4. Answer menu questions
5. Confirm your report
6. Receive reference number

### For Admin/Support

**To find USSD reports:**
1. Dashboard → Reports
2. Filter by: Channel = "ussd"
3. Click report to see session details & conversation
4. Respond via emergency contact number provided

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| USSD request not reaching API | Check callback URL in AT dashboard, verify HTTPS, test with curl |
| Report not saved to database | Check Supabase credentials, verify `ussd_sessions` & `reports` tables exist |
| Phone number not masked | Verify regex: `/\d(?=\d{4})/g` replaces correctly |
| AT webhook signature fails | Verify API key in `.env`, check header format |
| Users can't dial code | Verify short code is activated on AT, check carrier support (Safaricom/Airtel) |

---

## 10. Cost Estimation (Africa's Talking)

- **Setup:** Free
- **Shared Code (per message):** KES 0.50 - 2.00
- **Dedicated Short Code:** KES 5,000 - 50,000/month
- **Estimate for 100 daily USSD reports:** ~KES 15,000/month (shared code)

---

## 11. Future Enhancements

1. **Follow-up via SMS:** Send status updates to reporter's phone
2. **Anonymous Callback:** Allow reporters to check status via USSD
3. **Multimedia USSD:** Send images/videos (where supported)
4. **Regional Analytics:** Track by mobile operator (Safaricom, Airtel, etc.)
5. **AI Responses:** Smart menu suggestions based on input
6. **Integration with Case Management:** Auto-create cases in external systems

---

## 12. Security Considerations

- ✅ Phone numbers masked (last 4 digits only)
- ✅ Anonymous accounts generated (no login required)
- ✅ Session IDs logged (not personal data)
- ✅ Webhook signature verification
- ✅ Sensitive data not logged in clear text
- ⚠️ Consider: Rate limiting per phone number (prevent spam)
- ⚠️ Consider: GDPR compliance (session retention policy)

---

## 13. Support & Documentation

- **Africa's Talking Docs:** https://africastalking.com/ussd
- **WHRD Hub Issue:** [Link to relevant issue/discussion]
- **Support Email:** ussd-support@whrdhub.org
- **Maintenance:** Check AT status dashboard weekly

---

## Quick Start Summary

1. Sign up on Africa's Talking
2. Activate USSD service
3. Get assigned short code
4. Add environment variables to Vercel
5. Create `ussd_sessions` table in Supabase
6. Test with AT simulator
7. Monitor production submissions
8. Update report form UI with USSD instructions

**Estimated Setup Time:** 2-3 hours (including testing)

---

*Last updated: 2025-07-06*
*Status: Ready for implementation*
