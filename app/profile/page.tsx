import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/profile-client";

async function ProfileContent() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, email, is_anonymous, user_type, avatar_url")
    .eq("id", user.id)
    .single();

  const username    = profile?.username    ?? "";
  const displayName = profile?.display_name ?? "";
  const email       = profile?.email       ?? user.email ?? "";
  const isAnon      = profile?.is_anonymous ?? true;
  const userType    = profile?.user_type    ?? "reporter";
  const avatarUrl   = profile?.avatar_url   ?? null;
  const virtualEmail = isAnon ? `${username}@whrdhub.local` : email;

  return (
    <ProfileClient
      userId={user.id}
      username={username}
      displayName={displayName}
      email={email}
      virtualEmail={virtualEmail}
      isAnon={isAnon}
      userType={userType}
      avatarUrl={avatarUrl}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
