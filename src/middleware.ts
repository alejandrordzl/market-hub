import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const unprotectedRoutes = ["/api/v1/auth/login", "/login", "/api/auth/"];

  if (unprotectedRoutes.includes(request.nextUrl.pathname)) {
    console.log("Unprotected route, skipping authentication");
    return NextResponse.next();
  }

  try {
    // Verify JWT token
    const token = await getToken({ req: request });
    if (!token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const response = NextResponse.next();
    if(request.nextUrl.pathname.startsWith("/api")) {
      response.headers.set('x-user-id', token.sub);
      response.headers.set('x-user-role', token.role);
    }  

    return response;
  } catch (error) {
    console.error("Middleware authentication error:", error);
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
