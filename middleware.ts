import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the path is under /private
	if (pathname.startsWith("/private")) {
		const authCookie = request.cookies.get("private_auth");

		// If not authenticated, redirect to login
		if (!authCookie || authCookie.value !== "authenticated") {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(loginUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/private/:path*"],
};