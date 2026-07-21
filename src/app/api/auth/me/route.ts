import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user });
}
