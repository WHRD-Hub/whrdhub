import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Admin client - uses the service role key, server-side only.
// Never import this in client components or expose to the browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
