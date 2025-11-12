import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // (Optional) lightweight gating can be done client-side;
  // often simpler: route to /onboarding after sign-in and check there.
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/workspace", "/onboarding"],
};

