"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// role is null for anonymous users - they only accept T&C, no role change.
export async function completeOnboarding(role: "admin" | "defender" | null) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const update: Record<string, unknown> = {
    onboarding_completed: true,
    accepted_terms_at: new Date().toISOString(),
  };

  // Only update user_type for staff roles; anonymous reporters keep theirs.
  if (role) update.user_type = role;

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", session.user.id);

  if (error) return { error: error.message };

  redirect(role === "admin" ? "/admin" : "/dashboard");
}
