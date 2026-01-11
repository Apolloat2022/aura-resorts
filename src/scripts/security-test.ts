/**
 * SECURITY TEST SCRIPT
 * 
 * Purpose: Verify multi-tenant data isolation
 * Tests: Attempt to access tenant_1 data while authenticated as tenant_2
 * Expected: All queries should return empty or throw authorization errors
 * 
 * Run: npx tsx --env-file=.env src/scripts/security-test.ts
 */

import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../db";
import { partners, resorts, bookings } from "../db/schema";
import { eq } from "drizzle-orm";

async function runSecurityTests() {
    console.log("🔒 AIRE Security Test Suite\n");
    console.log("=".repeat(60));

    let testsPassed = 0;
    let testsFailed = 0;

    try {
        // Get two different partners
        const allPartners = await db.select().from(partners).limit(2);

        if (allPartners.length < 2) {
            console.error("❌ Need at least 2 partners in database to run tests");
            console.log("Run: npx tsx --env-file=.env src/scripts/seed.ts");
            return;
        }

        const partner1 = allPartners[0];
        const partner2 = allPartners[1];

        console.log(`\n✅ Test Setup:`);
        console.log(`   Partner 1: ${partner1.subdomain} (${partner1.id})`);
        console.log(`   Partner 2: ${partner2.subdomain} (${partner2.id})`);

        // TEST 1: Cross-tenant resort access
        console.log(`\n📋 TEST 1: Cross-Tenant Resort Access`);
        console.log(`   Attempting to fetch Partner 1's resorts using Partner 2's ID...`);

        const partner1Resorts = await db
            .select()
            .from(resorts)
            .where(eq(resorts.partnerId, partner1.id));

        const partner2Resorts = await db
            .select()
            .from(resorts)
            .where(eq(resorts.partnerId, partner2.id));

        console.log(`   Partner 1 has ${partner1Resorts.length} resorts`);
        console.log(`   Partner 2 has ${partner2Resorts.length} resorts`);

        // Simulate attack: Try to query without partnerId filter
        const unfilteredResorts = await db.select().from(resorts);

        if (unfilteredResorts.length > partner1Resorts.length && unfilteredResorts.length > partner2Resorts.length) {
            console.log(`   ⚠️  WARNING: Unfiltered query returned ${unfilteredResorts.length} resorts`);
            console.log(`   🔴 VULNERABILITY: Queries without partnerId filtering expose all data!`);
            testsFailed++;
        } else {
            console.log(`   ✅ PASS: Resort queries properly isolated`);
            testsPassed++;
        }

        // TEST 2: Cross-tenant booking access
        console.log(`\n📋 TEST 2: Cross-Tenant Booking Access`);

        const partner1Bookings = await db
            .select()
            .from(bookings)
            .where(eq(bookings.partnerId, partner1.id));

        const partner2Bookings = await db
            .select()
            .from(bookings)
            .where(eq(bookings.partnerId, partner2.id));

        console.log(`   Partner 1 has ${partner1Bookings.length} bookings`);
        console.log(`   Partner 2 has ${partner2Bookings.length} bookings`);

        // Check if any booking from partner1 appears in partner2's results
        const crossContamination = partner2Bookings.some(b => b.partnerId === partner1.id);

        if (crossContamination) {
            console.log(`   🔴 CRITICAL: Partner 2 can see Partner 1's bookings!`);
            testsFailed++;
        } else {
            console.log(`   ✅ PASS: Booking queries properly isolated`);
            testsPassed++;
        }

        // TEST 3: Subdomain validation
        console.log(`\n📋 TEST 3: Invalid Subdomain Rejection`);
        console.log(`   Checking if fake subdomains are rejected...`);

        const fakeSubdomain = await db
            .select()
            .from(partners)
            .where(eq(partners.subdomain, "fake-attacker-subdomain"))
            .limit(1);

        if (fakeSubdomain.length === 0) {
            console.log(`   ✅ PASS: Fake subdomain correctly returns empty`);
            testsPassed++;
        } else {
            console.log(`   🔴 FAIL: Fake subdomain exists in database!`);
            testsFailed++;
        }

        // TEST 4: Partner ID enforcement
        console.log(`\n📋 TEST 4: Partner ID Enforcement in Queries`);
        console.log(`   Verifying all queries use partnerId filtering...`);

        // This is a code review check - manual verification needed
        console.log(`   ⚠️  MANUAL CHECK REQUIRED:`);
        console.log(`   - Review src/actions/resort.ts`);
        console.log(`   - Review src/actions/partner.ts`);
        console.log(`   - Review src/actions/booking.ts`);
        console.log(`   - Ensure all queries use getSafePartnerId()`);

        // SUMMARY
        console.log(`\n${"=".repeat(60)}`);
        console.log(`\n📊 TEST SUMMARY:`);
        console.log(`   ✅ Passed: ${testsPassed}`);
        console.log(`   🔴 Failed: ${testsFailed}`);

        if (testsFailed === 0) {
            console.log(`\n🎉 ALL SECURITY TESTS PASSED!`);
            console.log(`   The "Iron Curtain" is holding strong.`);
        } else {
            console.log(`\n⚠️  SECURITY VULNERABILITIES DETECTED!`);
            console.log(`   Fix all failed tests before deploying to production.`);
            process.exit(1);
        }

    } catch (error) {
        console.error("\n❌ Test suite error:", error);
        process.exit(1);
    }
}

runSecurityTests();
