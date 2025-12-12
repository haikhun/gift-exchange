import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Check if the user already has a userId cookie
    const userId = request.cookies.get("gift_user_id")?.value;

    if (!userId) {
        // Generate a new random ID if missing
        // Simple random ID generation (same logic as before)
        const newUserId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Set the cookie on the response
        response.cookies.set("gift_user_id", newUserId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: "/",
            sameSite: "lax", // Important for persistence across redirects
        });
    }

    return response;
}

export const config = {
    // Apply to all routes except API, static files, images
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
