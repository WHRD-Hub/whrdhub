import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Intentional no-op. Token refresh is handled entirely by proxy.ts,
          // which calls getUser() once per request and writes refreshed tokens
          // to both request.cookies and the response headers.
          //
          // Writing cookies from a Server Component in Next.js 15+ succeeds
          // (unlike v14 where it threw), which causes Next.js App Router to
          // detect a "tracked cookie changed during render" and issue an RSC
          // re-render — infinite loop. Keeping this as a no-op prevents that.
        },
      },
    },
  );
}
