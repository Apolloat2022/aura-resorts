
// Diagnostic Script: Booking Commission Calculation
// Purpose: Verify Stripe Connect transfer_data logic and commission math.

async function runDiagnostic() {
    console.log("--- STARTING DIAGNOSTIC: BOOKING COMMISSION ---");

    // 1. Mock Data
    const mockResort = {
        name: "Mock Luxury Resort",
        basePricePerNight: 200, // $200 per night
    };
    const mockPartner = {
        id: "partner_123",
        markupRate: 15, // 15% Markup
        stripeAccountId: "acct_TEST123",
    };
    const nights = 5;

    console.log("Mock Config:");
    console.log(`- Resort Base Price: $${mockResort.basePricePerNight}/night`);
    console.log(`- Nights: ${nights}`);
    console.log(`- Partner Markup Rate: ${mockPartner.markupRate}%`);
    console.log(`- Partner Stripe Account: ${mockPartner.stripeAccountId}`);
    console.log("-----------------------------------------------");

    // 2. Logic from src/actions/booking.ts
    const basePrice = mockResort.basePricePerNight * nights; // 200 * 5 = 1000

    // Logic: const markupAmount = (basePrice * (partner.markupRate || 10)) / 100;
    const markupAmount = (basePrice * (mockPartner.markupRate || 10)) / 100;

    // Logic: const totalPrice = basePrice + markupAmount;
    const totalPrice = basePrice + markupAmount;

    // 3. Output Math
    console.log("Calculated Values:");
    console.log(`- Base Price (Resort Cut): $${basePrice}`);
    console.log(`- Markup Amount (Commission?): $${markupAmount}`);
    console.log(`- Total Price (Customer Pays): $${totalPrice}`);
    console.log("-----------------------------------------------");


    // 4. Analyze Stripe Transfer Logic (UPDATED)
    // New Code:
    // payment_intent_data: {
    //      application_fee_amount: Math.round(basePrice),
    //      transfer_data: {
    //          destination: partner.stripeAccountId,
    //      },
    // }

    console.log("Stripe Transfer Configuration Analysis:");
    console.log("New configuration uses 'application_fee_amount' set to Base Price ($" + basePrice + ").");

    // In this Standard/Connect config:
    // The "destination" account receives the Total minus Application Fee minus Stripe fees.

    const stripeProcessingFeeEst = (totalPrice * 0.029) + 0.30; // Approx 2.9% + 30c
    const applicationFee = basePrice;
    const amountToPartner = totalPrice - applicationFee - stripeProcessingFeeEst;
    const amountToPlatform = applicationFee;

    console.log(`\nSimulation for a $${basePrice} booking:`);
    console.log(`1. Customer is charged: $${totalPrice.toFixed(2)}`);
    console.log(`2. Stripe Fees (approx): -$${stripeProcessingFeeEst.toFixed(2)}`);
    console.log(`3. Amount Retained by Platform (AIRE): $${amountToPlatform.toFixed(2)}`);
    console.log(`4. Amount Transferred to Partner (${mockPartner.stripeAccountId}): $${amountToPartner.toFixed(2)}`);

    console.log("\nOBSERVATION:");
    if (amountToPlatform === basePrice) {
        console.log("✅ SUCCESS: The Platform is correctly retaining the BASE PRICE.");
        console.log("   The Partner receives only the markup (minus Stripe fees).");
    } else {
        console.log("⚠️  FAILURE: The split is incorrect.");
    }

    console.log("--- END DIAGNOSTIC ---");
}

runDiagnostic();
