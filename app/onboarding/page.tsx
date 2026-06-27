import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_anonymous, onboarding_completed, user_type")
    .eq("id", session.user.id)
    .single();

  // Already onboarded - send to the right place
  if (profile?.onboarding_completed) {
    redirect(profile.user_type === "admin" ? "/admin" : "/dashboard");
  }

  return <OnboardingClient isAnon={profile?.is_anonymous ?? false} />;
}
