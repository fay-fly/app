import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  console.log("middleware", token?.role);
  const { pathname } = req.nextUrl

  if (token && token.role === "lead" && pathname !== "/auth/onboarding") {
    console.log("redirect");
    return NextResponse.redirect(new URL(`/auth/onboarding?${new URLSearchParams({
      userId: token.id.toString(),
    })}`, req.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api/auth).*)",
  ],
}