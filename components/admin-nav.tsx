"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase, BarChart2, Map, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LangSwitcher } from "@/components/lang-switcher";

const navLinks = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/reports",   label: "Reports",    icon: FileText },
  { href: "/admin/services",  label: "Services",   icon: Briefcase },
  { href: "/admin/analytics", label: "Analytics",  icon: BarChart2 },
  { href: "/map",             label: "Map View",   icon: Map },
];

export function AdminNav({ username, userType }: { username: string; userType: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-56 shrink-0 bg-primary text-primary-foreground h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <img src="/main-logo.png" alt="WHRD Hub" className="h-8 w-auto object-contain brightness-0 invert mb-2" />
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 opacity-60" />
          <p className="text-xs opacity-60 capitalize">{userType} Console</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{username}</p>
            <p className="text-[11px] opacity-60 capitalize">{userType}</p>
          </div>
        </div>

        {/* Language switcher */}
        <LangSwitcher variant="compact" className="w-full [&>button]:w-full [&>button]:justify-start [&>button]:bg-white/10 [&>button]:border-white/20 [&>button]:text-white [&>button]:hover:bg-white/20" />

        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
