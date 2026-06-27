import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LayoutDashboard, FileText, Briefcase, Map, LogOut, Shield } from "lucide-react";
import { Suspense } from "react";

async function AdminNav() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles").select("user_type, username").eq("id", user.id).single();

  if (!profile || !["admin", "defender"].includes(profile.user_type)) {
    redirect("/dashboard");
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/map", label: "Map View", icon: Map },
  ];

  return (
    <aside className="w-56 shrink-0 bg-primary text-primary-foreground min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <p className="font-black text-lg">WHRD Hub</p>
        <p className="text-xs opacity-60">Admin Console</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">{profile.username || "Admin"}</p>
            <p className="text-xs opacity-60 capitalize">{profile.user_type}</p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <Suspense fallback={<div className="w-56 bg-primary min-h-screen" />}>
        <AdminNav />
      </Suspense>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
