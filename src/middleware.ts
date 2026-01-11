import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Allowed base domains (prevent host header injection)
const ALLOWED_DOMAINS = [
    "localhost:3000",
    "aire.com",
    "www.aire.com",
    process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000"
];

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth();

    // Protect dashboard routes
    if (isProtectedRoute(req) && !userId) {
        return redirectToSignIn();
    }

    const url = req.nextUrl;
    const host = req.headers.get("host") || "";

    // Security: Validate host header against allowlist
    const isValidHost = ALLOWED_DOMAINS.some(domain =>
        host === domain || host.endsWith(`.${domain}`)
    );

    if (!isValidHost) {
        console.warn(`[SECURITY] Invalid host header: ${host}`);
        return new NextResponse("Invalid host", { status: 400 });
    }

    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";

    const subdomain = host.endsWith(baseDomain)
        ? host.replace(`.${baseDomain}`, "").replace(baseDomain, "")
        : "";

    // If subdomain exists, validate it against database
    if (subdomain && subdomain !== "www" && subdomain !== "") {
        try {
            // Security: Verify subdomain exists in partners table
            const sql = neon(process.env.DATABASE_URL || "");
            const result = await sql`
        SELECT id FROM partners WHERE subdomain = ${subdomain} LIMIT 1
      `;

            if (result.length === 0) {
                console.warn(`[SECURITY] Subdomain spoofing attempt: ${subdomain}`);
                return new NextResponse("Subdomain not found", { status: 404 });
            }

            // Subdomain is valid, rewrite to tenant route
            const rewriteUrl = new URL(`/tenants/${subdomain}${url.pathname}${url.search}`, req.url);
            return NextResponse.rewrite(rewriteUrl);

        } catch (error) {
            console.error("[SECURITY] Database validation error:", error);
            return new NextResponse("Service unavailable", { status: 503 });
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
