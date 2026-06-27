"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function factCheckReport(
  reportId: string,
  data: {
    verification_status: string;
    verification_notes: string;
    incident_types: string[];
    attack_nature: string;
    derogatory_words: string[];
  },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("reports").update({
    verification_status: data.verification_status,
    verification_notes: data.verification_notes,
    verified_by: user.id,
    verified_at: new Date().toISOString(),
    incident_types: data.incident_types,
    attack_nature: data.attack_nature as "coordinated" | "bot_assisted" | "organic" | "unknown",
    derogatory_words: data.derogatory_words,
    status: data.verification_status === "verified" ? "under_review" : "submitted",
  }).eq("id", reportId);

  if (error) return { error: error.message };

  await supabase.from("report_audit_log").insert({
    report_id: reportId,
    viewed_by: user.id,
    action: `fact_check:${data.verification_status}`,
    notes: data.verification_notes,
  });

  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { success: true };
}

export async function verifyReport(reportId: string, status: string, notes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("reports").update({
    verification_status: status,
    verification_notes: notes,
    verified_by: user.id,
    verified_at: new Date().toISOString(),
    status: status === "verified" ? "under_review" : "submitted",
  }).eq("id", reportId);

  if (error) return { error: error.message };

  // Audit log
  await supabase.from("report_audit_log").insert({
    report_id: reportId, viewed_by: user.id, action: `fact_check:${status}`,
  });

  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateReportStatus(reportId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("reports").update({ status, assigned_to: user.id }).eq("id", reportId);
  if (error) return { error: error.message };

  await supabase.from("report_audit_log").insert({
    report_id: reportId, viewed_by: user.id, action: `status_update:${status}`,
  });

  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function assignService(reportId: string, serviceId: string, note?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("report_services").upsert({
    report_id: reportId, service_id: serviceId, assigned_by: user.id, note: note || null,
  }, { onConflict: "report_id,service_id" });

  if (error) return { error: error.message };
  revalidatePath(`/admin/reports/${reportId}`);
  return { success: true };
}

export async function removeService(reportId: string, serviceId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("report_services")
    .delete().eq("report_id", reportId).eq("service_id", serviceId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/reports/${reportId}`);
  return { success: true };
}

export async function createService(data: {
  name: string; description: string; category: string; organization?: string;
  contact_phone?: string; contact_email?: string; contact_url?: string; county?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("services").insert({ ...data, created_by: user.id, is_active: true });
  if (error) return { error: error.message };
  revalidatePath("/admin/services");
  return { success: true };
}
