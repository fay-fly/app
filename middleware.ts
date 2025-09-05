import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  if (token && token.role === "lead" && pathname !== "/auth/onboarding") {
    return NextResponse.redirect(
      new URL(
        `/auth/onboarding?${new URLSearchParams({
          userId: token.id.toString(),
        })}`,
        req.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth).*)"],
};
