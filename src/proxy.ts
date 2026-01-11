/**
 * AIRE Request Proxy & Multi-Tenancy Orchestrator
 * 
 * High-level orchestration for request interception, authentication protection, 
 * and secure multi-tenant routing. Dynamically validates partner subdomains 
 * against the database and performs safe URL rewriting to isolated tenant routes.
 * 
 * Provides production-hardened security against host header injection and 
 * handles environment-specific fallback logic for Vercel and local development.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Helper to extract host from URL
const appUrlHost = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
    : null;

// Allowed base domains (prevent host header injection)
const ALLOWED_DOMAINS = [
    "localhost:3000",
    "aire.com",
    "www.aire.com",
    "vercel.app",
    process.env.NEXT_PUBLIC_BASE_DOMAIN,
    appUrlHost
].filter(Boolean) as string[];

export default clerkMiddleware(async (auth, req) => {
    const url = req.nextUrl;

    // Prevent circular rewrites if path already starts with /tenants
    if (url.pathname.startsWith("/tenants/")) {
        return NextResponse.next();
    }

    const { userId, redirectToSignIn } = await auth();

    // Protect dashboard routes
    if (isProtectedRoute(req) && !userId) {
        return redirectToSignIn();
    }

    const host = req.headers.get("host") || "";

    // Security: Validate host header against allowlist
    const isValidHost = ALLOWED_DOMAINS.some(domain =>
        host === domain || host.endsWith(`.${domain}`)
    );

    if (!isValidHost) {
        console.warn(`[SECURITY] Invalid host header: ${host}`);
        return new NextResponse("Invalid host", { status: 400 });
    }

    // Determine the base domain (e.g., aire.com or aura-resorts.vercel.app)
    let baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || appUrlHost;

    if (!baseDomain) {
        if (host.includes("localhost")) {
            baseDomain = "localhost:3000";
        } else if (host.endsWith(".vercel.app")) {
            // Logic for Vercel: base domain is the root deployment (e.g., myapp.vercel.app)
            const parts = host.split(".");
            // If it's partner1.myapp.vercel.app, length is 4. baseDomain is index 1,2,3
            if (parts.length > 3) {
                baseDomain = parts.slice(1).join(".");
            } else {
                baseDomain = host;
            }
        } else {
            baseDomain = host;
        }
    }

    const subdomain = host.endsWith(baseDomain) && host !== baseDomain
        ? host.replace(`.${baseDomain}`, "")
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
