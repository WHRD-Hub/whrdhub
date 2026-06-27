import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Africa's Talking USSD webhook handler
// Shared USSD code — set up via Africa's Talking dashboard
// AT sends: sessionId, serviceCode, phoneNumber, text (cumulative user input)

const MENU = {
  start: `CON Welcome to WHRD Hub Safe Report\nKaribuni kwenye Ripoti Salama\n\n1. Report an incident\n   (Ripoti tukio)\n2. Emergency contacts\n   (Nambari za dharura)`,
  main: `CON What type of incident?\nAina ya tukio?\n\n1. Physical violence (Unyanyasaji wa kimwili)\n2. Online harassment (Unyanyasaji mtandaoni)\n3. Sexual violence (Unyanyasaji wa kijinsia)\n4. Workplace abuse (Unyanyasaji kazini)\n5. Other (Nyingine)`,
  urgency: `CON How urgent is this?\nNi ya haraka kiasi gani?\n\n1. Immediate danger (Hatari sasa hivi)\n2. Within this week (Ndani ya wiki)\n3. Not urgent (Sio ya haraka)`,
  county: `CON Enter your county number:\nIngiza nambari ya kaunti yako:\n\n1. Nairobi  2. Mombasa  3. Kisumu\n4. Nakuru  5. Other (Nyingine)`,
  confirm: (type: string, county: string, urgency: string) =>
    `CON Confirm your report:\nType: ${type}\nCounty: ${county}\nUrgency: ${urgency}\n\n1. Submit (Wasilisha)\n2. Cancel (Ghairi)`,
  submitted: (ref: string) => `END Your report has been received.\nRipoti yako imepokelewa.\n\nReference: ${ref}\n\nFor help: 1195 (GBV Hotline)`,
  emergency: `END Emergency contacts:\nSimu za dharura:\n\nPolice: 999\nGBV Hotline: 1195\nChildline: 116\n\nYou are not alone.`,
  cancelled: `END Report cancelled.\nRipoti imeghairiwa.\n\nCall 1195 for support.`,
};

const INCIDENT_TYPES = ["", "physical_violence", "online_harassment", "sexual_violence", "workplace_abuse", "other"];
const COUNTIES = ["", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Other"];
const URGENCY_LEVELS = ["", "immediate", "within_week", "no_rush"];

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const sessionId = params.get("sessionId") || "";
  const phoneNumber = params.get("phoneNumber") || "";
  const text = params.get("text") || "";

  const inputs = text.split("*").filter(Boolean);
  const level = inputs.length;

  let response = "";

  try {
    if (level === 0) {
      response = MENU.start;
    } else if (level === 1) {
      if (inputs[0] === "1") response = MENU.main;
      else if (inputs[0] === "2") response = MENU.emergency;
      else response = `CON Invalid option. Enter 1 or 2.`;
    } else if (level === 2) {
      const choice = parseInt(inputs[1]);
      if (choice >= 1 && choice <= 5) response = MENU.urgency;
      else response = `CON Invalid option. Enter 1-5.`;
    } else if (level === 3) {
      const choice = parseInt(inputs[2]);
      if (choice >= 1 && choice <= 3) response = MENU.county;
      else response = `CON Invalid option. Enter 1-3.`;
    } else if (level === 4) {
      const typeIdx = parseInt(inputs[1]);
      const urgIdx = parseInt(inputs[2]);
      const countyIdx = parseInt(inputs[3]);
      const type = INCIDENT_TYPES[typeIdx] || "other";
      const county = COUNTIES[countyIdx] || "Other";
      const urgency = URGENCY_LEVELS[urgIdx] || "within_week";
      response = MENU.confirm(type.replace(/_/g, " "), county, urgency.replace(/_/g, " "));
    } else if (level === 5) {
      if (inputs[4] === "1") {
        // Submit the report
        const typeIdx = parseInt(inputs[1]);
        const urgIdx = parseInt(inputs[2]);
        const countyIdx = parseInt(inputs[3]);

        const supabase = await createClient();

        // Create anonymous USSD report
        const username = `ussd-${Math.random().toString(36).slice(2, 8)}`;
        const virtualEmail = `${username}@ussd.whrdhub.org`;
        const password = Math.random().toString(36).slice(2, 14);

        const { data: auth } = await supabase.auth.signUp({
          email: virtualEmail, password,
          options: { data: { username, is_anonymous: true, user_type: "reporter" } },
        });

        const userId = auth.user?.id;
        const { data: report } = await supabase.from("reports").insert({
          user_id: userId,
          incident_types: [INCIDENT_TYPES[typeIdx] || "other"],
          description: `USSD report via shared code from ${phoneNumber.replace(/\d(?=\d{4})/g, "*")}`,
          county: COUNTIES[countyIdx] || "Other",
          urgency: URGENCY_LEVELS[urgIdx] || "within_week",
          support_needed: [],
          reporting_for: "self",
          is_ongoing: false,
          consent_to_followup: false,
          status: "submitted",
          verification_status: "pending",
          reporter_type: "anonymous",
          channel: "ussd",
        }).select("id").single();

        // Log USSD session
        if (report?.id) {
          await supabase.from("ussd_sessions").insert({
            session_id: sessionId, phone_number: phoneNumber.replace(/\d(?=\d{4})/g, "*"),
            text_input: text, current_step: "completed", report_id: report.id,
          });
        }

        const ref = report?.id?.slice(0, 8).toUpperCase() || "ERR";
        response = MENU.submitted(ref);
      } else {
        response = MENU.cancelled;
      }
    } else {
      response = `END Session ended. Call 1195 for support.`;
    }
  } catch (err) {
    console.error("USSD error:", err);
    response = `END An error occurred. Please try again or call 1195.`;
  }

  return new NextResponse(response, {
    headers: { "Content-Type": "text/plain" },
  });
}
