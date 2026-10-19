import { getCurrentUser } from "@/lib/auth/session";

// Lets client UI (the nav) know whether someone is signed in, without making every page dynamic.
export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ signedIn: !!user, name: user?.name.split(" ")[0] ?? null }, { headers: { "cache-control": "no-store" } });
}
