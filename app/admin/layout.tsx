import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, username, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "defender"].includes(profile.user_type)) {
    redirect("/dashboard");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <AdminNav username={profile.username || "Admin"} userType={profile.user_type} />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
