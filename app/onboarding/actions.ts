"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// All new users are reporters - T&C only, no role selection
export async function completeOnboarding(role: "admin" | "defender" | "reporter" | null) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const update: Record<string, unknown> = {
    onboarding_completed: true,
    accepted_terms_at: new Date().toISOString(),
  };

  // All authenticated users are reporters
  if (role) update.user_type = role;

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", session.user.id);

  if (error) return { error: error.message };

  // Only admin users go to /admin; everyone else (reporter, anonymous) goes to /dashboard
  redirect(role === "admin" ? "/admin" : "/dashboard");
}
